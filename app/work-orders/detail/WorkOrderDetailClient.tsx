'use client';

import { useWorkOrder } from '@/features/work-orders/hooks/use-work-orders.hook';
import { WorkOrderDetail } from '@/features/work-orders/components/WorkOrderDetail';
import { useEffect, useState } from 'react';

export function WorkOrderDetailClient() {
  const [workOrderId, setWorkOrderId] = useState<string | null>(null);
  const [hasReadParams, setHasReadParams] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setWorkOrderId(params.get('id'));
    setHasReadParams(true);
  }, []);

  const { data, isLoading, error } = useWorkOrder(workOrderId ?? '');

  if (!hasReadParams || (workOrderId && isLoading)) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (!workOrderId || error || !data) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center text-red-600 dark:text-red-400">
        Work order not found
      </div>
    );
  }

  return <WorkOrderDetail workOrderId={workOrderId} />;
}
