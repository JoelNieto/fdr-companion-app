'use client';

import { usePathname } from 'next/navigation';
import { WorkOrderNotFound } from '@/features/push/components/WorkOrderNotFound';

export default function NotFoundPage() {
  const pathname = usePathname();
  // Extract ID from /work-orders/{id}
  const id = pathname?.split('/work-orders/')[1] || 'unknown';
  
  return <WorkOrderNotFound workOrderId={id} />;
}