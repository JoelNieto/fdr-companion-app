import { notFound } from 'next/navigation';
import { dataStore } from '@/lib/storage/data-store';
import { WorkOrderDetail } from '@/features/work-orders/components/WorkOrderDetail';

interface WorkOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const workOrders = dataStore.getWorkOrders();
  return workOrders.map((wo) => ({
    id: wo.id,
  }));
}

export default async function WorkOrderDetailPage({ params }: WorkOrderDetailPageProps) {
  const { id } = await params;
  
  // Check if work order exists server-side
  const wo = dataStore.getWorkOrder(id);
  if (!wo) {
    // Redirect to a custom not-found page with the ID
    notFound();
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <WorkOrderDetail workOrderId={id} />
    </div>
  );
}