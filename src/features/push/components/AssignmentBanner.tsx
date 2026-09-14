'use client';

import { Button } from '@/components/ui/Button';

interface AssignmentBannerProps {
  workOrder: {
    id: string;
    title: string;
    status: string;
  };
  onDismiss: () => void;
  onNavigate: () => void;
}

export function AssignmentBanner({ workOrder, onDismiss, onNavigate }: AssignmentBannerProps) {
  return (
    <div
      data-testid="push-inapp-banner"
      className="fixed top-16 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 bg-blue-600 text-white rounded-lg shadow-lg p-4 animate-slide-down"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium">New Work Order Assigned</p>
          <p className="font-semibold">{workOrder.title}</p>
          <p className="text-xs opacity-90">Status: {workOrder.status.replace('_', ' ')}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={onDismiss}
            className="bg-white/20 hover:bg-white/30 text-white"
          >
            Dismiss
          </Button>
          <Button
            size="sm"
            onClick={onNavigate}
            className="bg-white text-blue-600 hover:bg-white/90"
          >
            View
          </Button>
        </div>
      </div>
    </div>
  );
}