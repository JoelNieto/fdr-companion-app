'use client';

import { useSyncExternalStore } from 'react';
import {
  getOnlineSnapshot,
  getReconnectGeneration,
  getSimulatedOffline,
  subscribeOnlineStatus,
} from '@/features/offline/lib/online-status';

function subscribe(onStoreChange: () => void) {
  return subscribeOnlineStatus(onStoreChange);
}

export function useOnlineStatus() {
  const isOnline = useSyncExternalStore(subscribe, getOnlineSnapshot, () => true);
  const reconnectGeneration = useSyncExternalStore(
    subscribe,
    getReconnectGeneration,
    () => 0,
  );
  const simulatedOffline = useSyncExternalStore(
    subscribe,
    getSimulatedOffline,
    () => false,
  );

  // wasOffline is true after an offline→online transition until generation is observed
  const wasOffline = reconnectGeneration > 0;

  return { isOnline, wasOffline, reconnectGeneration, simulatedOffline };
}
