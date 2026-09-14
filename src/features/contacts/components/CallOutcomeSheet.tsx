'use client';

import { useState } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { useCallOutcome } from '@/features/contacts/hooks/use-contacts.hook';

interface CallOutcomeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  contactId: string;
  contactName: string;
  onSave: () => void;
}

export function CallOutcomeSheet({ isOpen, onClose, contactId, contactName, onSave }: CallOutcomeSheetProps) {
  const [note, setNote] = useState('');
  const callOutcome = useCallOutcome();
  
  const isNoteValid = note.trim().length > 0 && note.length <= 500;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isNoteValid) return;
    
    callOutcome.mutate(
      { contactId, note: note.trim() },
      {
        onSuccess: () => {
          setNote('');
          onSave();
        },
      }
    );
  };
  
  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Call Outcome"
      data-testid="call-outcome-sheet"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Call with <strong>{contactName}</strong> ended. Add a note about the outcome.
          </p>
          <Textarea
            id="call-outcome-note-input"
            data-testid="call-outcome-note-input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Enter call outcome note (1-500 characters)..."
            className="min-h-[120px]"
            aria-describedby="note-hint"
            autoFocus
          />
          <p id="note-hint" className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {note.length}/500 characters
          </p>
        </div>
        
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            data-testid="call-outcome-dismiss-button"
            className="flex-1"
          >
            Dismiss
          </Button>
          <Button
            type="submit"
            data-testid="call-outcome-save-button"
            className="flex-1"
            disabled={!isNoteValid || callOutcome.isPending}
            aria-disabled={!isNoteValid || callOutcome.isPending}
          >
            {callOutcome.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}