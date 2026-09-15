import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface OutboxDBSchema extends DBSchema {
  outbox: {
    key: string;
    value: {
      id: string;
      type: 'status_change' | 'call_outcome';
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

let dbInstance: IDBPDatabase<OutboxDBSchema> | null = null;

export async function getOutboxDB(): Promise<IDBPDatabase<OutboxDBSchema>> {
  if (dbInstance) return dbInstance;
  
  dbInstance = await openDB<OutboxDBSchema>('field-companion-outbox', 1, {
    upgrade(db) {
      const store = db.createObjectStore('outbox', { keyPath: 'id' });
      store.createIndex('by-state', 'state');
      store.createIndex('by-createdAt', 'createdAt');
    },
  });
  
  return dbInstance;
}

export async function addOutboxItem(item: OutboxDBSchema['outbox']['value']): Promise<void> {
  const db = await getOutboxDB();
  await db.add('outbox', item);
}

export async function getOutboxItems(): Promise<OutboxDBSchema['outbox']['value'][]> {
  const db = await getOutboxDB();
  return db.getAllFromIndex('outbox', 'by-createdAt');
}

export async function getPendingOutboxItems(): Promise<OutboxDBSchema['outbox']['value'][]> {
  const db = await getOutboxDB();
  return db.getAllFromIndex('outbox', 'by-state', 'pending');
}

export async function updateOutboxItem(item: OutboxDBSchema['outbox']['value']): Promise<void> {
  const db = await getOutboxDB();
  await db.put('outbox', item);
}

export async function deleteOutboxItem(id: string): Promise<void> {
  const db = await getOutboxDB();
  await db.delete('outbox', id);
}

export async function clearSyncedItems(): Promise<void> {
  const db = await getOutboxDB();
  const syncedItems = await db.getAllFromIndex('outbox', 'by-state', 'synced');
  
  if (syncedItems.length === 0) {
    return;
  }
  
  const tx = db.transaction('outbox', 'readwrite');
  for (const item of syncedItems) {
    await tx.store.delete(item.id);
  }
  await tx.done;
}