import { getPendingOutboxItems, updateOutboxItem } from './outbox-store';
import type { OutboxDBSchema } from './outbox-store';
import { 
  advanceWorkOrderStatus, blockWorkOrder, resumeWorkOrder, 
  createWorkOrder, saveCallOutcome 
} from '@/lib/client-actions';

type MutationFunction = (payload: Record<string, unknown>) => Promise<{ success: boolean; message?: string; data?: unknown }>;

export interface SyncOptions {
  onItemStart?: (item: OutboxDBSchema['outbox']['value']) => void;
  onItemSuccess?: (item: OutboxDBSchema['outbox']['value']) => void;
  onItemError?: (item: OutboxDBSchema['outbox']['value'], error: string) => void;
  onComplete?: (results: { success: number; failed: number }) => void;
}

const mutationMap: Record<string, MutationFunction> = {
  status_change: async (payload) => {
    const { type, ...rest } = payload;
    
    if (type === 'advance') {
      return advanceWorkOrderStatus({ workOrderId: rest.workOrderId as string });
    }
    if (type === 'block') {
      return blockWorkOrder({ workOrderId: rest.workOrderId as string, reason: rest.reason as string });
    }
    if (type === 'resume') {
      return resumeWorkOrder({ workOrderId: rest.workOrderId as string });
    }
    if (type === 'create') {
      return createWorkOrder(rest.jobId as string, { 
        title: rest.title as string, 
        assignee: rest.assignee as string, 
        scheduledDate: rest.scheduledDate as string 
      });
    }
    return { success: false, message: 'Unknown mutation type' };
  },
  call_outcome: async (payload) => {
    return saveCallOutcome({ contactId: payload.contactId as string, note: payload.note as string });
  },
};

export async function replayOutbox(options: SyncOptions = {}): Promise<void> {
  const pendingItems = await getPendingOutboxItems();
  
  if (pendingItems.length === 0) {
    options.onComplete?.({ success: 0, failed: 0 });
    return;
  }
  
  let successCount = 0;
  let failedCount = 0;
  
  for (const item of pendingItems) {
    options.onItemStart?.(item);
    
    // Update to syncing state
    await updateOutboxItem({ ...item, state: 'syncing' });
    
    try {
      const mutationFn = mutationMap[item.type];
      if (!mutationFn) {
        throw new Error(`No mutation handler for type: ${item.type}`);
      }
      
      const result = await mutationFn(item.payload);
      
      if (result.success) {
        await updateOutboxItem({ ...item, state: 'synced', retriedAt: new Date().toISOString() });
        successCount++;
        options.onItemSuccess?.(item);
      } else {
        await updateOutboxItem({ 
          ...item, 
          state: 'failed', 
          error: result.message || 'Unknown error',
          retriedAt: new Date().toISOString(),
        });
        failedCount++;
        options.onItemError?.(item, result.message || 'Unknown error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await updateOutboxItem({ 
        ...item, 
        state: 'failed', 
        error: errorMessage,
        retriedAt: new Date().toISOString(),
      });
      failedCount++;
      options.onItemError?.(item, errorMessage);
    }
  }
  
  options.onComplete?.({ success: successCount, failed: failedCount });
}

export async function retryFailedItem(itemId: string): Promise<void> {
  // This would be called for individual retry
  // For now, we just trigger a full replay
  await replayOutbox();
}