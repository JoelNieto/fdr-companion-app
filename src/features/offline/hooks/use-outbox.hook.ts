'use client';

import { useState, useEffect, useCallback } from 'react';
import { getOutboxItems, getPendingOutboxItems, updateOutboxItem, deleteOutboxItem } from '@/features/offline/lib/outbox-store';
import { replayOutbox } from '@/features/offline/lib/sync-engine';
import { useOnlineStatus } from './use-online-status.hook';
import type { OutboxDBSchema } from '@/features/offline/lib/outbox-store';

export function useOutbox() {
  const [items, setItems] = useState<OutboxDBSchema['outbox']['value'][]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const { isOnline, wasOffline } = useOnlineStatus();
  
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
    // Use setTimeout to avoid synchronous setState in effect
    const timer = setTimeout(() => {
      loadItems();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadItems]);
  
  useEffect(() => {
    if (isOnline && wasOffline) {
      const timer = setTimeout(() => {
        handleReplay();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline, handleReplay]);
  
  const handleRetry = useCallback(async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item || item.state !== 'failed') return;
    
    await updateOutboxItem({ ...item, state: 'pending', error: undefined });
    await handleReplay();
  }, [items, handleReplay]);
  
  const handleRemove = useCallback(async (itemId: string) => {
    await deleteOutboxItem(itemId);
    loadItems();
  }, [loadItems]);
  
  return {
    items,
    pendingCount,
    isSyncing,
    isOnline,
    wasOffline,
    replay: handleReplay,
    retry: handleRetry,
    remove: handleRemove,
    refresh: loadItems,
  };
}