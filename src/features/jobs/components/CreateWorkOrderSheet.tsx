'use client';

import { useState, useEffect } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useFeedback } from '@/lib/feedback';
import { seedData } from '@/lib/storage/seed-data';

interface CreateWorkOrderSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: { title: string; assignee: string; scheduledDate: string }) => Promise<unknown>;
  isPending: boolean;
}

export function CreateWorkOrderSheet({ isOpen, onClose, onCreate, isPending }: CreateWorkOrderSheetProps) {
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showError } = useFeedback();
  
  const crewMembers = seedData.crewMembers;
  
  const isValid = title.length >= 3 && assignee && scheduledDate;
  
  useEffect(() => {
    if (!isOpen || scheduledDate) return;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduledDate(tomorrow.toISOString().split('T')[0]);
  }, [isOpen, scheduledDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isPending) return;
    
    setErrors({});
    try {
      await onCreate({ title, assignee, scheduledDate });
      setTitle('');
      setAssignee('');
      setScheduledDate('');
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        showError(err.message);
      }
    }
  };
  
  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Create Work Order"
      data-testid="wo-create-sheet"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="wo-create-title-input"
          data-testid="wo-create-title-input"
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter work order title (3-80 characters)"
          error={errors.title}
          required
          minLength={3}
          maxLength={80}
        />
        
        <Select
          id="wo-create-assignee-select"
          data-testid="wo-create-assignee-select"
          label="Assignee"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          options={crewMembers.map(name => ({ value: name, label: name }))}
          placeholder="Select assignee"
          error={errors.assignee}
          required
        />
        
        <Input
          id="wo-create-date-input"
          data-testid="wo-create-date-input"
          label="Scheduled Date"
          type="date"
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
          error={errors.date}
          required
          min={new Date().toISOString().split('T')[0]}
        />
        
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            data-testid="wo-create-cancel-button"
            className="flex-1"
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            data-testid="wo-create-submit-button"
            className="flex-1"
            disabled={!isValid || isPending}
            aria-disabled={!isValid || isPending}
          >
            {isPending ? 'Creating...' : 'Create Work Order'}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}