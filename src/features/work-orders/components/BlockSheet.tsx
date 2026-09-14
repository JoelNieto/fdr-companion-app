'use client';

import { useState } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

interface BlockSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onBlock: (reason: string) => void;
  isPending: boolean;
  dataTestId?: string;
}

export function BlockSheet({ isOpen, onClose, onBlock, isPending, dataTestId }: BlockSheetProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  
  const isValid = reason.trim().length >= 5 && reason.length <= 200;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setError(reason.trim().length < 5 ? 'Reason must be at least 5 characters' : 'Reason must be at most 200 characters');
      return;
    }
    setError('');
    onBlock(reason.trim());
  };
  
  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Block Work Order"
      data-testid={dataTestId}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            This work order will be blocked. Please provide a reason (5-200 characters).
          </p>
          <Textarea
            id="wo-block-reason-input"
            data-testid="wo-block-reason-input"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for blocking..."
            className="min-h-[120px]"
            aria-describedby="reason-hint"
            autoFocus
          />
          <p id="reason-hint" className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {reason.length}/200 characters
          </p>
          {error && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          )}
        </div>
        
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            data-testid="wo-block-confirm-button"
            className="flex-1"
            disabled={!isValid || isPending}
            aria-disabled={!isValid || isPending}
          >
            {isPending ? 'Blocking...' : 'Block'}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}