'use client';

import { useOutbox } from '@/features/offline/hooks/use-outbox.hook';
import { Button } from '@/components/ui/Button';
import { OutboxPanel } from './OutboxPanel';
import { useState } from 'react';

export function OutboxIndicator() {
  const { pendingCount, isSyncing, isOnline } = useOutbox();
  const [showPanel, setShowPanel] = useState(false);
  
  if (pendingCount === 0 && !isSyncing) return null;
  
  return (
    <div className="relative" data-testid="outbox-indicator">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowPanel(!showPanel)}
        className="relative"
        aria-label={`Outbox: ${pendingCount} pending`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {pendingCount > 9 ? '9+' : pendingCount}
          </span>
        )}
        {isSyncing && (
          <svg className="w-5 h-5 animate-spin ml-1" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
      </Button>
      
      {showPanel && (
        <OutboxPanel 
          onClose={() => setShowPanel(false)} 
          isOnline={isOnline}
        />
      )}
    </div>
  );
}