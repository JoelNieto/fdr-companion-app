'use client';

import Link from 'next/link';
import { useMyWorkOrders } from '@/features/work-orders/hooks/use-work-orders.hook';
import { Badge } from '@/components/ui/Badge';

export function MyWorkOrdersList() {
  const { data: workOrders, isLoading, error } = useMyWorkOrders();
  
  const statusColors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    scheduled: 'info',
    en_route: 'warning',
    on_site: 'warning',
    done: 'success',
    blocked: 'danger',
  };
  
  const today = new Date().toISOString().split('T')[0];
  
  const todayOrders = workOrders?.filter(wo => 
    wo.scheduledDate === today && wo.status !== 'done'
  ) ?? [];
  
  const upcomingOrders = workOrders?.filter(wo => 
    wo.scheduledDate > today && wo.status !== 'done'
  ).sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate)) ?? [];
  
  if (isLoading) {
    return (
      <div data-testid="my-wo-list" className="p-4 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3" data-testid="my-wo-today-group">Today</h2>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-20 rounded-lg" />
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3" data-testid="my-wo-upcoming-group">Upcoming</h2>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-20 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div data-testid="my-wo-list" className="p-4 text-center text-red-600 dark:text-red-400">
        Failed to load work orders
      </div>
    );
  }
  
  return (
    <div data-testid="my-wo-list" className="p-4 space-y-6">
      <div>
        <h2 id="my-wo-today-group" data-testid="my-wo-today-group" className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Today ({todayOrders.length})
        </h2>
        {todayOrders.length === 0 ? (
          <p className="text-center py-8 text-gray-500 dark:text-gray-400">No work orders for today</p>
        ) : (
          <div className="space-y-3">
            {todayOrders.map(wo => (
              <Link
                key={wo.id}
                href={`/work-orders/${wo.id}`}
                className="block p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div data-testid={`wo-item-${wo.id}`} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{wo.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Scheduled: {wo.scheduledDate}</p>
                  </div>
                  <Badge variant={statusColors[wo.status] || 'default'}>
                    {wo.status.replace('_', ' ')}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      <div>
        <h2 id="my-wo-upcoming-group" data-testid="my-wo-upcoming-group" className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Upcoming ({upcomingOrders.length})
        </h2>
        {upcomingOrders.length === 0 ? (
          <p className="text-center py-8 text-gray-500 dark:text-gray-400">No upcoming work orders</p>
        ) : (
          <div className="space-y-3">
            {upcomingOrders.map(wo => (
              <Link
                key={wo.id}
                href={`/work-orders/${wo.id}`}
                className="block p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div data-testid={`wo-item-${wo.id}`} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{wo.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Scheduled: {wo.scheduledDate}</p>
                  </div>
                  <Badge variant={statusColors[wo.status] || 'default'}>
                    {wo.status.replace('_', ' ')}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}