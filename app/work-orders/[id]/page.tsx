import { WorkOrderDetail } from '@/features/work-orders/components/WorkOrderDetail';

interface WorkOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkOrderDetailPage({ params }: WorkOrderDetailPageProps) {
  const { id } = await params;
  return (
    <div className="max-w-4xl mx-auto">
      <WorkOrderDetail workOrderId={id} />
    </div>
  );
}