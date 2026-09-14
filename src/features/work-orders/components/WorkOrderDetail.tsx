'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWorkOrder } from '@/features/work-orders/hooks/use-work-orders.hook';
import { useAdvanceStatus, useBlockWorkOrder, useResumeWorkOrder, useAddPhoto } from '@/features/work-orders/hooks/use-work-orders.hook';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BlockSheet } from './BlockSheet';
import { PhotoGrid } from './PhotoGrid';
import { CameraPermissionExplainer } from './CameraPermissionExplainer';

interface WorkOrderDetailProps {
  workOrderId: string;
}

export function WorkOrderDetail({ workOrderId }: WorkOrderDetailProps) {
  const { data: wo, isLoading, error } = useWorkOrder(workOrderId);
  const advanceStatus = useAdvanceStatus();
  const blockWorkOrder = useBlockWorkOrder();
  const resumeWorkOrder = useResumeWorkOrder();
  const addPhoto = useAddPhoto();
  const [showBlockSheet, setShowBlockSheet] = useState(false);
  const [showCameraExplainer, setShowCameraExplainer] = useState(false);
  
  const statusColors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    scheduled: 'info',
    en_route: 'warning',
    on_site: 'warning',
    done: 'success',
    blocked: 'danger',
  };
  
  const advanceLabels: Record<string, string> = {
    scheduled: 'En route',
    en_route: 'On site',
    on_site: 'Done',
    blocked: '',
    done: '',
  };
  
  const canAdvance = wo && ['scheduled', 'en_route', 'on_site'].includes(wo.status);
  const canBlock = wo && ['en_route', 'on_site'].includes(wo.status);
  const canResume = wo && wo.status === 'blocked';
  const canAddPhoto = wo && ['on_site', 'done'].includes(wo.status);
  
  if (isLoading) {
    return (
      <div className="p-4 space-y-4 animate-pulse" data-testid="wo-detail">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      </div>
    );
  }
  
  if (!wo) {
    return null;
  }
  
  const handleAdvance = () => {
    advanceStatus.mutate({ workOrderId: wo.id });
  };
  
  const handleBlock = (reason: string) => {
    blockWorkOrder.mutate({ workOrderId: wo.id, reason }, {
      onSuccess: () => setShowBlockSheet(false),
    });
  };
  
  const handleResume = () => {
    resumeWorkOrder.mutate({ workOrderId: wo.id });
  };
  
  const handleAddPhoto = () => {
    // For web, we'll simulate photo capture with a file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Create a blob URL for the photo
        const url = URL.createObjectURL(file);
        addPhoto.mutate({ workOrderId: wo.id, uri: url });
      }
    };
    input.click();
  };
  
  return (
    <div data-testid="wo-detail" className="p-4 space-y-6 pb-20 md:pb-4">
      <div>
        <Link href="/work-orders" className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Work Orders
        </Link>
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{wo.title}</h1>
          <Badge 
            data-testid="wo-detail-status-badge"
            variant={statusColors[wo.status] || 'default'} 
            className="text-lg px-4 py-2"
          >
            {wo.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Job Details</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Job</dt>
              <dd className="font-medium text-gray-900 dark:text-gray-100">{wo.title}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Scheduled</dt>
              <dd className="font-medium text-gray-900 dark:text-gray-100">{wo.scheduledDate}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Assignee</dt>
              <dd className="font-medium text-gray-900 dark:text-gray-100">{wo.assignee}</dd>
            </div>
          </dl>
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Contact</h2>
          {wo.jobId && (
            <div className="space-y-2">
              <p className="font-medium text-gray-900 dark:text-gray-100">Contact for this job</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tap to call</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Status Actions */}
      <div className="space-y-3">
        {canAdvance && (
          <Button
            onClick={handleAdvance}
            disabled={advanceStatus.isPending}
            aria-disabled={advanceStatus.isPending}
            data-testid="wo-status-advance-button"
            className="w-full md:w-auto"
            size="lg"
          >
            {advanceStatus.isPending ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Advancing...
              </>
            ) : (
              advanceLabels[wo.status]
            )}
          </Button>
        )}
        
        {canBlock && !canAdvance && (
          <Button
            variant="secondary"
            onClick={() => setShowBlockSheet(true)}
            data-testid="wo-block-button"
            className="w-full md:w-auto"
          >
            Block
          </Button>
        )}
        
        {canResume && (
          <Button
            onClick={handleResume}
            disabled={resumeWorkOrder.isPending}
            aria-disabled={resumeWorkOrder.isPending}
            data-testid="wo-resume-button"
            className="w-full md:w-auto"
            variant="secondary"
          >
            {resumeWorkOrder.isPending ? 'Resuming...' : 'Resume'}
          </Button>
        )}
        
        {canAddPhoto && (
          <Button
            onClick={handleAddPhoto}
            data-testid="wo-add-photo-button"
            className="w-full md:w-auto"
            variant="secondary"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Add Photo
          </Button>
        )}
      </div>
      
      {/* Blocked reason display */}
      {wo.status === 'blocked' && wo.blockedReason && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg" data-testid="wo-block-reason-display">
          <p className="font-medium text-red-800 dark:text-red-300">Blocked Reason:</p>
          <p className="text-red-700 dark:text-red-400">{wo.blockedReason}</p>
        </div>
      )}
      
      {/* Photos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Photos ({wo.photos?.length || 0})</h2>
        </div>
        <PhotoGrid 
          photos={wo.photos || []} 
          data-testid="wo-photo-grid"
        />
      </div>
      
      {/* Camera permission explainer for web */}
      {showCameraExplainer && (
        <CameraPermissionExplainer
          onClose={() => setShowCameraExplainer(false)}
          data-testid="camera-permission-explainer"
        />
      )}
      
      {/* Block Sheet */}
      <BlockSheet
        isOpen={showBlockSheet}
        onClose={() => setShowBlockSheet(false)}
        onBlock={handleBlock}
        isPending={blockWorkOrder.isPending}
        data-testid="block-sheet"
      />
    </div>
  );
}