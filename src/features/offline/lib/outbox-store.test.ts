import { describe, it, expect, vi, beforeEach } from 'vitest';
import { openDB } from 'idb';
import { 
  addOutboxItem, 
  getOutboxItems, 
  getPendingOutboxItems, 
  updateOutboxItem, 
  deleteOutboxItem, 
  clearSyncedItems 
} from '@/features/offline/lib/outbox-store';

const { mockDB } = vi.hoisted(() => {
  const mockStore = {
    delete: vi.fn().mockResolvedValue(undefined),
  };
  const db = {
    add: vi.fn().mockResolvedValue(undefined),
    put: vi.fn().mockResolvedValue(undefined),
    getAll: vi.fn().mockResolvedValue([]),
    getAllFromIndex: vi.fn().mockResolvedValue([]),
    delete: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(undefined),
    transaction: vi.fn().mockReturnValue({
      done: Promise.resolve(),
      store: mockStore,
    }),
    close: vi.fn(),
  };
  return { mockDB: db };
});

vi.mock('idb', () => ({
  openDB: vi.fn().mockResolvedValue(mockDB),
}));

describe('Outbox Store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(openDB).mockResolvedValue(mockDB as never);
    vi.mocked(mockDB.add).mockResolvedValue(undefined);
    vi.mocked(mockDB.put).mockResolvedValue(undefined);
    vi.mocked(mockDB.getAll).mockResolvedValue([]);
    vi.mocked(mockDB.getAllFromIndex).mockResolvedValue([]);
    vi.mocked(mockDB.delete).mockResolvedValue(undefined);
  });

  describe('addOutboxItem', () => {
    it('adds item to outbox', async () => {
      const item = {
        id: 'test-1',
        type: 'status_change' as const,
        payload: { workOrderId: 'wo-1', type: 'advance' },
        description: 'Advance work order wo-1',
        state: 'pending' as const,
        createdAt: new Date().toISOString(),
      };

      await addOutboxItem(item);
      
      expect(mockDB.add).toHaveBeenCalledWith('outbox', expect.objectContaining({
        id: 'test-1',
        type: 'status_change',
        state: 'pending',
      }));
    });

    it('uses provided createdAt when given', async () => {
      const providedCreatedAt = '2024-01-01T12:00:00Z';
      const item = {
        id: 'test-2',
        type: 'call_outcome' as const,
        payload: { contactId: 'c-1', note: 'Test' },
        description: 'Log call outcome for contact c-1',
        state: 'pending' as const,
        createdAt: providedCreatedAt,
      };

      await addOutboxItem(item);
      
      expect(mockDB.add).toHaveBeenCalledWith('outbox', expect.objectContaining({
        createdAt: providedCreatedAt,
      }));
    });
  });

  describe('getOutboxItems', () => {
    it('returns all outbox items sorted by createdAt', async () => {
      const mockItems = [
        { id: '2', type: 'status_change', state: 'pending', createdAt: '2024-01-02T00:00:00Z' },
        { id: '1', type: 'status_change', state: 'pending', createdAt: '2024-01-01T00:00:00Z' },
      ];
      mockDB.getAll.mockResolvedValue(mockItems);

      const items = await getOutboxItems();
      
      expect(items.map(i => i.id)).toEqual(['1', '2']);
      expect(mockDB.getAll).toHaveBeenCalledWith('outbox');
    });
  });

  describe('getPendingOutboxItems', () => {
    it('returns only pending items from by-state index', async () => {
      const mockItems = [
        { id: '1', type: 'status_change', state: 'pending', createdAt: '2024-01-01T00:00:00Z' },
        { id: '3', type: 'create', state: 'pending', createdAt: '2024-01-03T00:00:00Z' },
      ];
      mockDB.getAllFromIndex.mockResolvedValue(mockItems);

      const items = await getPendingOutboxItems();
      
      expect(items).toHaveLength(2);
      expect(items.map(i => i.id)).toEqual(['1', '3']);
      expect(mockDB.getAllFromIndex).toHaveBeenCalledWith('outbox', 'by-state', 'pending');
    });
  });

  describe('updateOutboxItem', () => {
    it('updates item state', async () => {
      const item = { 
        id: 'test-1', 
        type: 'status_change' as const, 
        payload: {}, 
        description: 'Test',
        state: 'synced' as const, 
        createdAt: '2024-01-01T00:00:00Z' 
      };
      
      await updateOutboxItem(item);
      
      expect(mockDB.put).toHaveBeenCalledWith('outbox', expect.objectContaining({
        id: 'test-1',
        state: 'synced',
      }));
    });

    it('updates item with error and retriedAt', async () => {
      const item = { 
        id: 'test-1', 
        type: 'status_change' as const, 
        payload: {}, 
        description: 'Test',
        state: 'failed' as const, 
        createdAt: '2024-01-01T00:00:00Z',
        error: 'Network error',
        retriedAt: '2024-01-01T00:00:01Z',
      };
      
      await updateOutboxItem(item);
      
      expect(mockDB.put).toHaveBeenCalledWith('outbox', expect.objectContaining({
        id: 'test-1',
        state: 'failed',
        error: 'Network error',
        retriedAt: '2024-01-01T00:00:01Z',
      }));
    });
  });

  describe('deleteOutboxItem', () => {
    it('deletes item from outbox', async () => {
      await deleteOutboxItem('test-1');
      
      expect(mockDB.delete).toHaveBeenCalledWith('outbox', 'test-1');
    });
  });

  describe('clearSyncedItems', () => {
    it('deletes all synced items via transaction', async () => {
      const mockItems = [
        { id: '1', state: 'synced' },
        { id: '3', state: 'synced' },
      ];
      mockDB.getAllFromIndex.mockResolvedValue(mockItems);

      const mockStore = {
        delete: vi.fn().mockResolvedValue(undefined),
      };
      mockDB.transaction.mockReturnValue({
        done: Promise.resolve(),
        store: mockStore,
      });

      await clearSyncedItems();
      
      expect(mockDB.getAllFromIndex).toHaveBeenCalledWith('outbox', 'by-state', 'synced');
      expect(mockDB.transaction).toHaveBeenCalledWith('outbox', 'readwrite');
      
      expect(mockStore.delete).toHaveBeenCalledTimes(2);
      expect(mockStore.delete).toHaveBeenCalledWith('1');
      expect(mockStore.delete).toHaveBeenCalledWith('3');
    });

    it('does nothing if no synced items', async () => {
      mockDB.getAllFromIndex.mockResolvedValue([]);

      await clearSyncedItems();
      
      expect(mockDB.getAllFromIndex).toHaveBeenCalledWith('outbox', 'by-state', 'synced');
      expect(mockDB.transaction).not.toHaveBeenCalled();
    });
  });
});
