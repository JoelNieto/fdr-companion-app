import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { addOutboxItem, getOutboxItems, getPendingOutboxItems, updateOutboxItem, deleteOutboxItem } from '@/features/offline/lib/outbox-store';

// Mock IDB
const mockStore = new Map<string, any>();

vi.mock('idb', () => ({
  openDB: vi.fn().mockResolvedValue({
    add: vi.fn(async (storeName, item) => {
      mockStore.set(item.id, { ...item });
    }),
    getAllFromIndex: vi.fn(async (storeName, indexName, query) => {
      if (indexName === 'by-createdAt') {
        return Array.from(mockStore.values())
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }
      if (indexName === 'by-state') {
        return Array.from(mockStore.values())
          .filter(item => item.state === query);
      }
      return Array.from(mockStore.values());
    }),
    put: vi.fn(async (storeName, item) => {
      mockStore.set(item.id, { ...item });
    }),
    delete: vi.fn(async (storeName, id) => {
      mockStore.delete(id);
    }),
    transaction: vi.fn(() => ({
      store: {
        delete: vi.fn(async (id) => mockStore.delete(id)),
      },
      done: Promise.resolve(),
    })),
  }),
}));

describe('outbox-store', () => {
  beforeEach(() => {
    mockStore.clear();
  });

  it('adds and retrieves outbox items', async () => {
    const item = {
      id: 'test-1',
      type: 'status_change' as const,
      payload: { workOrderId: 'wo-1', type: 'advance' },
      description: 'Advance work order wo-1',
      state: 'pending' as const,
      createdAt: new Date().toISOString(),
    };

    await addOutboxItem(item);
    const items = await getOutboxItems();
    
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('test-1');
  });

  it('filters pending items', async () => {
    const pendingItem = {
      id: 'pending-1',
      type: 'call_outcome' as const,
      payload: { contactId: 'c-1', note: 'test' },
      description: 'Call outcome for c-1',
      state: 'pending' as const,
      createdAt: new Date().toISOString(),
    };
    
    const syncedItem = {
      id: 'synced-1',
      type: 'status_change' as const,
      payload: { workOrderId: 'wo-1', type: 'advance' },
      description: 'Advance wo-1',
      state: 'synced' as const,
      createdAt: new Date().toISOString(),
      retriedAt: new Date().toISOString(),
    };

    await addOutboxItem(pendingItem);
    await addOutboxItem(syncedItem);

    const pending = await getPendingOutboxItems();
    expect(pending).toHaveLength(1);
    expect(pending[0].id).toBe('pending-1');
  });

  it('updates item state', async () => {
    const item = {
      id: 'update-1',
      type: 'status_change' as const,
      payload: { workOrderId: 'wo-1', type: 'block' },
      description: 'Block wo-1',
      state: 'pending' as const,
      createdAt: new Date().toISOString(),
    };

    await addOutboxItem(item);
    await updateOutboxItem({ ...item, state: 'synced', retriedAt: new Date().toISOString() });
    
    const items = await getOutboxItems();
    expect(items[0].state).toBe('synced');
    expect(items[0].retriedAt).toBeDefined();
  });

  it('deletes items', async () => {
    const item = {
      id: 'delete-1',
      type: 'call_outcome' as const,
      payload: { contactId: 'c-1', note: 'test' },
      description: 'Call outcome',
      state: 'pending' as const,
      createdAt: new Date().toISOString(),
    };

    await addOutboxItem(item);
    await deleteOutboxItem('delete-1');
    
    const items = await getOutboxItems();
    expect(items).toHaveLength(0);
  });
});