'use client';

import { dataStore } from '@/lib/storage/data-store';
import type { 
  Contact, Job, WorkOrder, Note, Photo, 
  CreateWorkOrderInput, CallOutcomeInput, AdvanceStatusInput, 
  BlockWorkOrderInput, ResumeWorkOrderInput, 
  ApiEnvelope 
} from '@/lib/types';
import { createEnvelope, createErrorEnvelope, validateInput } from '@/lib/validation';
import { createWorkOrderSchema } from '@/features/jobs/schema/job.schema';
import { callOutcomeSchema as contactCallOutcomeSchema } from '@/features/contacts/schema/contact.schema';
import { advanceStatusSchema, blockWorkOrderSchema, resumeWorkOrderSchema } from '@/features/work-orders/schema/work-order.schema';

// Client-side actions that use dataStore directly (for static export)
// These replace Server Actions when using output: 'export'

// Contacts
export async function getContacts(): Promise<ApiEnvelope<Contact[]>> {
  return createEnvelope(dataStore.getContacts());
}

export async function getContact(id: string): Promise<ApiEnvelope<Contact | undefined>> {
  return createEnvelope(dataStore.getContact(id));
}

export async function saveCallOutcome(input: CallOutcomeInput): Promise<ApiEnvelope<{ note: Note }>> {
  const result = dataStore.addCallOutcomeNote(input);
  if (!result.success) {
    return createErrorEnvelope<{ note: Note }>(result.message ?? 'Failed to save call outcome');
  }
  return createEnvelope({ note: result.data! }, result.message ?? 'Call outcome saved');
}

// Jobs
export async function getJobs(): Promise<ApiEnvelope<Job[]>> {
  return createEnvelope(dataStore.getJobs());
}

export async function getJob(id: string): Promise<ApiEnvelope<Job | undefined>> {
  return createEnvelope(dataStore.getJob(id));
}

export async function getJobsByContact(contactId: string): Promise<ApiEnvelope<Job[]>> {
  return createEnvelope(dataStore.getJobsByContact(contactId));
}

export async function getJobsByStatus(status: Job['status']): Promise<ApiEnvelope<Job[]>> {
  return createEnvelope(dataStore.getJobsByStatus(status));
}

export async function createWorkOrder(jobId: string, input: CreateWorkOrderInput): Promise<ApiEnvelope<{ workOrder: { id: string; title: string; status: string } }>> {
  const validation = validateInput(createWorkOrderSchema, input);
  if (!validation.success) {
    return createErrorEnvelope<{ workOrder: { id: string; title: string; status: string } }>('Validation failed');
  }
  
  const newWO = dataStore.createWorkOrderWithJob(jobId, validation.data);
  return createEnvelope({ workOrder: { id: newWO.id, title: newWO.title, status: newWO.status } }, 'Work order created successfully');
}

// Work Orders
export async function getWorkOrders(): Promise<ApiEnvelope<WorkOrder[]>> {
  return createEnvelope(dataStore.getWorkOrders());
}

export async function getWorkOrder(id: string): Promise<ApiEnvelope<WorkOrder | undefined>> {
  return createEnvelope(dataStore.getWorkOrder(id));
}

export async function getWorkOrdersByJob(jobId: string): Promise<ApiEnvelope<WorkOrder[]>> {
  return createEnvelope(dataStore.getWorkOrdersByJob(jobId));
}

export async function getWorkOrdersByAssignee(assignee: string): Promise<ApiEnvelope<WorkOrder[]>> {
  return createEnvelope(dataStore.getWorkOrdersByAssignee(assignee));
}

export async function getMyWorkOrders(assignee: string = 'Casey Rivera'): Promise<ApiEnvelope<WorkOrder[]>> {
  return createEnvelope(dataStore.getWorkOrdersByAssignee(assignee));
}

export async function getWorkOrdersByAssigneeAndStatus(assignee: string, excludeStatus?: WorkOrder['status']): Promise<ApiEnvelope<WorkOrder[]>> {
  return createEnvelope(dataStore.getWorkOrdersByAssigneeAndStatus(assignee, excludeStatus));
}

export async function advanceWorkOrderStatus(input: AdvanceStatusInput): Promise<ApiEnvelope<WorkOrder>> {
  return dataStore.advanceWorkOrderStatus(input);
}

export async function blockWorkOrder(input: BlockWorkOrderInput): Promise<ApiEnvelope<WorkOrder>> {
  return dataStore.blockWorkOrder(input);
}

export async function resumeWorkOrder(input: ResumeWorkOrderInput): Promise<ApiEnvelope<WorkOrder>> {
  return dataStore.resumeWorkOrder(input);
}

export async function addPhotoToWorkOrder(workOrderId: string, uri: string): Promise<ApiEnvelope<Photo>> {
  return dataStore.addPhoto(workOrderId, uri);
}

/** Reset persisted localStorage demo data to seed fixtures. */
export async function resetDemoData(): Promise<ApiEnvelope<null>> {
  dataStore.resetToSeed();
  return createEnvelope(null, 'Demo data reset to seed');
}