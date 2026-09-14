'use client';

import { useOnlineStatus } from '@/features/offline/hooks/use-online-status.hook';
import { ClientOnly } from '@/components/ui/ClientOnly';
import { useState } from 'react';

export function OfflineIndicator() {
  const { isOnline } = useOnlineStatus();
  const [simulatedOffline, setSimulatedOffline] = useState(false);
  
  const effectiveOffline = simulatedOffline || !isOnline;
  
  return (
    <ClientOnly fallback={null}>
      {() => {
        if (!effectiveOffline) {
          // Dev-only test button
          if (process.env.NODE_ENV === 'development') {
            return (
              <div className="fixed top-4 right-4 z-50">
                <button
                  onClick={() => setSimulatedOffline(true)}
                  className="bg-yellow-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg hover:bg-yellow-700 transition-colors"
                  data-testid="simulate-offline-btn"
                >
                  Simulate Offline
                </button>
              </div>
            );
          }
          return null;
        }
        
        return (
          <div
            data-testid="offline-indicator"
            className="fixed top-0 left-0 right-0 z-50 bg-yellow-600 text-white text-center py-2 px-4 text-sm font-medium shadow-lg animate-slide-down"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              You&apos;re offline. Changes will sync when connection is restored.
              {simulatedOffline && (
                <button
                  onClick={() => setSimulatedOffline(false)}
                  className="ml-4 text-white underline hover:no-underline"
                >
                  Go Online
                </button>
              )}
            </div>
          </div>
        );
      }}
    </ClientOnly>
  );
}