'use client';

import { useOnlineStatus } from '@/features/offline/hooks/use-online-status.hook';
import { setSimulatedOffline } from '@/features/offline/lib/online-status';
import { ClientOnly } from '@/components/ui/ClientOnly';

export function OfflineIndicator() {
  const { isOnline, simulatedOffline } = useOnlineStatus();

  return (
    <ClientOnly fallback={null}>
      {() => {
        if (isOnline) {
          if (process.env.NODE_ENV === 'development') {
            return (
              <div className="fixed top-safe-offset right-4 z-50">
                <button
                  type="button"
                  onClick={() => setSimulatedOffline(true)}
                  className="rounded bg-gray-800/80 px-2 py-1 text-xs text-white hover:bg-gray-800"
                  data-testid="simulate-offline-button"
                >
                  Go Offline
                </button>
              </div>
            );
          }
          return null;
        }

        return (
          <div
            data-testid="offline-indicator"
            className="fixed top-0 left-0 right-0 z-50 bg-yellow-600 text-white text-center px-4 pt-safe-area pb-2 text-sm font-medium shadow-lg animate-slide-down pointer-events-none"
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
                  type="button"
                  onClick={() => setSimulatedOffline(null)}
                  className="ml-4 text-white underline hover:no-underline pointer-events-auto"
                  data-testid="simulate-online-button"
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
