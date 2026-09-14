import { MyWorkOrdersList } from '@/features/work-orders/components/MyWorkOrdersList';

export default function WorkOrdersPage() {
  return (
    <div className="max-w-md mx-auto md:max-w-2xl">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Work Orders</h1>
      </div>
      <MyWorkOrdersList />
    </div>
  );
}