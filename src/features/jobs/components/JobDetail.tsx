'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useJob } from '@/features/jobs/hooks/use-jobs.hook';
import { useWorkOrdersByJob } from '@/features/work-orders/hooks/use-work-orders.hook';
import { useCreateWorkOrder } from '@/features/jobs/hooks/use-jobs.hook';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CreateWorkOrderSheet } from './CreateWorkOrderSheet';
import { ContactCard } from './ContactCard';
import { WorkOrderList } from './WorkOrderList';

interface JobDetailProps {
  jobId: string;
}

export function JobDetail({ jobId }: JobDetailProps) {
  const { data: job, isLoading, error } = useJob(jobId);
  const { data: workOrders } = useWorkOrdersByJob(jobId);
  const createWorkOrder = useCreateWorkOrder(jobId);
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  
  const statusColors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    lead: 'default',
    scheduled: 'info',
    in_progress: 'warning',
    completed: 'success',
  };
  
  if (isLoading) {
    return (
      <div className="p-4 space-y-4 animate-pulse" data-testid="job-detail">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      </div>
    );
  }
  
  if (error || !job) {
    return (
      <div className="p-4 text-center text-red-600 dark:text-red-400" data-testid="job-detail">
        Job not found
      </div>
    );
  }
  
  return (
    <div data-testid="job-detail" className="p-4 space-y-6">
      <div>
        <Link href="/jobs" className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Jobs
        </Link>
        <div className="flex items-center justify-between gap-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{job.title}</h1>
          <Badge variant={statusColors[job.status] || 'default'} className="text-lg px-4 py-2">
            {job.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Details</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Address</dt>
              <dd className="font-medium text-gray-900 dark:text-gray-100">{job.address}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Value</dt>
              <dd className="font-medium text-gray-900 dark:text-gray-100">${job.value.toLocaleString()}</dd>
            </div>
          </dl>
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Contact</h2>
          <ContactCard contactId={job.contactId} />
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Work Orders</h2>
        <Button
          onClick={() => setShowCreateSheet(true)}
          data-testid="wo-create-button"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Work Order
        </Button>
      </div>
      
      <WorkOrderList 
        workOrders={workOrders || []} 
        data-testid="job-detail-wo-list"
      />
      
      <CreateWorkOrderSheet
        isOpen={showCreateSheet}
        onClose={() => setShowCreateSheet(false)}
        onCreate={createWorkOrder.mutateAsync}
        isPending={createWorkOrder.isPending}
      />
    </div>
  );
}