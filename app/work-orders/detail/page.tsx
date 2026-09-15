'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getWorkOrder } from '@/lib/client-actions';
import { WorkOrderDetail } from '@/features/work-orders/components/WorkOrderDetail';

export default function WorkOrderDetailPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const { data, isLoading, error } = useQuery({
    queryKey: ['work-order', id],
    queryFn: async () => {
      const result = await getWorkOrder(id!);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
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

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center text-red-600 dark:text-red-400">
        Work order not found
      </div>
    );
  }

  return <WorkOrderDetail workOrderId={id!} />;
}