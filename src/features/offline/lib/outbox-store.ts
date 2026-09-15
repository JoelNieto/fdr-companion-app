import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { notifyOutboxChange } from './outbox-events';

export interface OutboxDBSchema extends DBSchema {
  outbox: {
    key: string;
    value: {
      id: string;
      type: 'status_change' | 'call_outcome' | 'create';
      payload: Record<string, unknown>;
      description: string;
      state: 'pending' | 'syncing' | 'synced' | 'failed';
      error?: string;
      createdAt: string;
      retriedAt?: string;
    };
    indexes: { 'by-state': string; 'by-createdAt': string };
  };
}

const OP_TIMEOUT_MS = 4000;

/** Serialize writes/reads so WebKit/Chrome don't wedge overlapping txs. */
let chain: Promise<unknown> = Promise.resolve();

function enqueue<T>(op: () => Promise<T>): Promise<T> {
  const run = chain.then(op, op);
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${OP_TIMEOUT_MS}ms`));
    }, OP_TIMEOUT_MS);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

async function openOutboxDB(): Promise<IDBPDatabase<OutboxDBSchema>> {
  return openDB<OutboxDBSchema>('field-companion-outbox', 1, {
    upgrade(db) {
      const store = db.createObjectStore('outbox', { keyPath: 'id' });
      store.createIndex('by-state', 'state');
      store.createIndex('by-createdAt', 'createdAt');
    },
  });
}

/**
 * Open → run → close per operation. A long-lived shared connection was
 * getting stuck under concurrent outbox UI reads + mutation writes.
 */
async function withDb<T>(label: string, fn: (db: IDBPDatabase<OutboxDBSchema>) => Promise<T>): Promise<T> {
  const db = await withTimeout(openOutboxDB(), `${label} open`);
  try {
    return await withTimeout(fn(db), label);
  } finally {
    try {
      db.close();
    } catch {
      // ignore — tests may mock a partial IDBPDatabase
    }
  }
}

export async function getOutboxDB(): Promise<IDBPDatabase<OutboxDBSchema>> {
  // Kept for tests / callers that expect an open handle — prefer withDb ops.
  return openOutboxDB();
}

export async function addOutboxItem(item: OutboxDBSchema['outbox']['value']): Promise<void> {
  await enqueue(async () => {
    await withDb('outbox add', (db) => db.add('outbox', item));
  });
  notifyOutboxChange();
}

export async function getOutboxItems(): Promise<OutboxDBSchema['outbox']['value'][]> {
  return enqueue(async () => {
    const items = await withDb('outbox getAll', (db) => db.getAll('outbox'));
    return items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  });
}

export async function getPendingOutboxItems(): Promise<OutboxDBSchema['outbox']['value'][]> {
  return enqueue(async () => {
    return withDb('outbox getPending', (db) =>
      db.getAllFromIndex('outbox', 'by-state', 'pending'),
    );
  });
}

export async function updateOutboxItem(item: OutboxDBSchema['outbox']['value']): Promise<void> {
  await enqueue(async () => {
    await withDb('outbox put', (db) => db.put('outbox', item));
  });
  notifyOutboxChange();
}

export async function deleteOutboxItem(id: string): Promise<void> {
  await enqueue(async () => {
    await withDb('outbox delete', (db) => db.delete('outbox', id));
  });
  notifyOutboxChange();
}

export async function clearSyncedItems(): Promise<void> {
  await enqueue(async () => {
    await withDb('outbox clearSynced', async (db) => {
      const syncedItems = await db.getAllFromIndex('outbox', 'by-state', 'synced');
      if (syncedItems.length === 0) return;

      const tx = db.transaction('outbox', 'readwrite');
      for (const item of syncedItems) {
        await tx.store.delete(item.id);
      }
      await tx.done;
    });
  });
  notifyOutboxChange();
}
