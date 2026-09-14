'use server';

import { dataStore } from '@/lib/storage/data-store';
import type { ApiEnvelope, WorkOrder, AdvanceStatusInput, BlockWorkOrderInput, ResumeWorkOrderInput, Photo } from '@/lib/types';
import { advanceStatusSchema, blockWorkOrderSchema, resumeWorkOrderSchema } from '@/features/work-orders/schema/work-order.schema';
import { validateInput, createEnvelope, createErrorEnvelope } from '@/lib/validation';

export async function getWorkOrders(): Promise<ApiEnvelope<WorkOrder[]>> {
  return createEnvelope(dataStore.getWorkOrders());
}

export async function getWorkOrder(id: string): Promise<ApiEnvelope<WorkOrder | undefined>> {
  return createEnvelope(dataStore.getWorkOrder(id));
}

export async function getWorkOrdersByJob(jobId: string): Promise<ApiEnvelope<WorkOrder[]>> {
  return createEnvelope(dataStore.getWorkOrdersByJob(jobId));
}

export async function getMyWorkOrders(assignee: string = 'Casey Rivera'): Promise<ApiEnvelope<WorkOrder[]>> {
  return createEnvelope(dataStore.getWorkOrdersByAssigneeAndStatus(assignee, 'done'));
}

export async function advanceWorkOrderStatus(input: AdvanceStatusInput): Promise<ApiEnvelope<WorkOrder>> {
  const validation = validateInput(advanceStatusSchema, input);
  if (!validation.success) {
    return createErrorEnvelope<WorkOrder>('Validation failed');
  }
  
  const result = dataStore.advanceWorkOrderStatus(validation.data);
  return result;
}

export async function blockWorkOrder(input: BlockWorkOrderInput): Promise<ApiEnvelope<WorkOrder>> {
  const validation = validateInput(blockWorkOrderSchema, input);
  if (!validation.success) {
    return createErrorEnvelope<WorkOrder>('Validation failed');
  }
  
  const result = dataStore.blockWorkOrder(validation.data);
  return result;
}

export async function resumeWorkOrder(input: ResumeWorkOrderInput): Promise<ApiEnvelope<WorkOrder>> {
  const validation = validateInput(resumeWorkOrderSchema, input);
  if (!validation.success) {
    return createErrorEnvelope<WorkOrder>('Validation failed');
  }
  
  const result = dataStore.resumeWorkOrder(validation.data);
  return result;
}

export async function addPhotoToWorkOrder(workOrderId: string, uri: string): Promise<ApiEnvelope<Photo>> {
  const result = dataStore.addPhoto(workOrderId, uri);
  if (!result.success) {
    return result as ApiEnvelope<Photo>;
  }
  return createEnvelope(result.data, result.message);
}