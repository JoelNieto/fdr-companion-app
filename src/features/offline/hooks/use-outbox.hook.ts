'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getOutboxItems, getPendingOutboxItems, updateOutboxItem, deleteOutboxItem } from '@/features/offline/lib/outbox-store';
import { replayOutbox } from '@/features/offline/lib/sync-engine';
import { useOnlineStatus } from './use-online-status.hook';
import { notifyOutboxChange, OUTBOX_CHANGED_EVENT } from '@/features/offline/lib/outbox-events';
import type { OutboxDBSchema } from '@/features/offline/lib/outbox-store';

export function useOutbox() {
  const [items, setItems] = useState<OutboxDBSchema['outbox']['value'][]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const { isOnline, reconnectGeneration } = useOnlineStatus();
  const lastReplayedGeneration = useRef(0);

  const loadItems = useCallback(async () => {
    const allItems = await getOutboxItems();
    const pendingItems = await getPendingOutboxItems();
    setItems(allItems);
    setPendingCount(pendingItems.length);
  }, []);

  const handleReplay = useCallback(async () => {
    setIsSyncing(true);
    await replayOutbox({
      onItemStart: (item) => {
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, state: 'syncing' } : i));
      },
      onItemSuccess: (item) => {
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, state: 'synced', retriedAt: new Date().toISOString() } : i));
      },
      onItemError: (item, error) => {
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, state: 'failed', error, retriedAt: new Date().toISOString() } : i));
      },
      onComplete: () => {
        setIsSyncing(false);
        loadItems();
      },
    });
  }, [loadItems]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadItems();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadItems]);

  useEffect(() => {
    window.addEventListener(OUTBOX_CHANGED_EVENT, loadItems);
    return () => {
      window.removeEventListener(OUTBOX_CHANGED_EVENT, loadItems);
    };
  }, [loadItems]);

  // Replay only on offline→online transitions (not on every mount while online)
  useEffect(() => {
    if (!isOnline) return;
    if (reconnectGeneration <= lastReplayedGeneration.current) return;

    lastReplayedGeneration.current = reconnectGeneration;
    const timer = setTimeout(() => {
      handleReplay();
    }, 0);
    return () => clearTimeout(timer);
  }, [isOnline, reconnectGeneration, handleReplay]);

  const handleRetry = useCallback(async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item || item.state !== 'failed') return;
    
    await updateOutboxItem({ ...item, state: 'pending', error: undefined });
    notifyOutboxChange();
    await handleReplay();
  }, [items, handleReplay]);

  const handleRemove = useCallback(async (itemId: string) => {
    await deleteOutboxItem(itemId);
    notifyOutboxChange();
    loadItems();
  }, [loadItems]);

  return {
    items,
    pendingCount,
    isSyncing,
    isOnline,
    wasOffline: reconnectGeneration > 0,
    replay: handleReplay,
    retry: handleRetry,
    remove: handleRemove,
    refresh: loadItems,
  };
}
