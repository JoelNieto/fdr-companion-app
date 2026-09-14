'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';

interface WorkOrderListProps {
  workOrders: Array<{
    id: string;
    title: string;
    status: string;
  }>;
  'data-testid'?: string;
}

export function WorkOrderList({ workOrders, 'data-testid': testId }: WorkOrderListProps) {
  const statusColors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    scheduled: 'info',
    en_route: 'warning',
    on_site: 'warning',
    done: 'success',
    blocked: 'danger',
  };
  
  if (workOrders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400" data-testid={testId}>
        No work orders yet. Create one to get started.
      </div>
    );
  }
  
  return (
    <ul data-testid={testId} className="divide-y divide-gray-200 dark:divide-gray-700">
      {workOrders.map(wo => (
        <li key={wo.id}>
          <Link
            href={`/work-orders/${wo.id}`}
            className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div data-testid={`job-wo-item-${wo.id}`} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{wo.title}</p>
              </div>
              <Badge variant={statusColors[wo.status] || 'default'}>
                {wo.status.replace('_', ' ')}
              </Badge>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}