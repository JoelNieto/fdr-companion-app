'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function WorkOrderNotFound({ workOrderId }: { workOrderId: string }) {
  return (
    <div
      data-testid="wo-not-found-screen"
      className="min-h-screen flex flex-col items-center justify-center p-8 text-center"
    >
      <svg className="w-24 h-24 text-gray-300 dark:text-gray-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Work Order Not Found
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        The work order <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">{workOrderId}</code> does not exist or has been removed.
      </p>
      <Link href="/work-orders">
        <Button
          data-testid="wo-not-found-back-button"
          size="lg"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to My Work Orders
        </Button>
      </Link>
    </div>
  );
}