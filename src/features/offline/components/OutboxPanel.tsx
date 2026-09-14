'use client';

import { useOutbox } from '@/features/offline/hooks/use-outbox.hook';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';

interface OutboxPanelProps {
  onClose: () => void;
  isOnline: boolean;
}

export function OutboxPanel({ onClose, isOnline }: OutboxPanelProps) {
  const { items, retry, remove, isSyncing, pendingCount } = useOutbox();
  
  const pendingItems = items.filter(item => item.state === 'pending' || item.state === 'syncing');
  const syncedItems = items.filter(item => item.state === 'synced');
  const failedItems = items.filter(item => item.state === 'failed');
  
  return (
    <Sheet
      isOpen={true}
      onClose={onClose}
      title={`Outbox (${pendingCount} pending)`}
      data-testid="outbox-panel"
    >
      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        {!isOnline && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-800 dark:text-yellow-300 text-sm">
            You&apos;re offline. Items will sync automatically when connection is restored.
          </div>
        )}
        
        {isSyncing && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-800 dark:text-blue-300 text-sm flex items-center gap-2">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Syncing {pendingItems.length} item{pendingItems.length !== 1 ? 's' : ''}...
          </div>
        )}
        
        {pendingItems.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Pending</h3>
            <div className="space-y-2">
              {pendingItems.map((item, index) => (
                <div
                  key={item.id}
                  data-testid={`outbox-item-${index}`}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                  <span 
                    data-testid="outbox-item-state"
                    className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                      item.state === 'syncing' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}
                  >
                    {item.state}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {failedItems.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Failed</h3>
            <div className="space-y-2">
              {failedItems.map((item, index) => (
                <div
                  key={item.id}
                  data-testid={`outbox-item-${pendingItems.length + index}`}
                  className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                >
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">{item.description}</p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{item.error || 'Unknown error'}</p>
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => retry(item.id)}
                      data-testid={`outbox-retry-button-${index}`}
                      disabled={isSyncing}
                    >
                      Retry
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => remove(item.id)}
                      className="text-red-600 dark:text-red-400"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {syncedItems.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Synced</h3>
            <div className="space-y-2">
              {syncedItems.slice(-5).map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                >
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">{item.description}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Synced {item.retriedAt ? new Date(item.retriedAt).toLocaleString() : 'recently'}
                  </p>
                  <span 
                    data-testid="outbox-item-state"
                    className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  >
                    synced
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {items.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Outbox is empty
          </div>
        )}
      </div>
    </Sheet>
  );
}