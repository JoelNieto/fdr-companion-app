'use server';

import { dataStore } from '@/lib/storage/data-store';
import type { ApiEnvelope, CreateWorkOrderInput, Job, WorkOrder } from '@/lib/types';
import { createWorkOrderSchema } from '@/features/jobs/schema/job.schema';
import { validateInput, createEnvelope, createErrorEnvelope } from '@/lib/validation';

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
  
  const job = dataStore.getJob(jobId);
  if (!job) {
    return createErrorEnvelope<{ workOrder: { id: string; title: string; status: string } }>('Job not found');
  }
  
  const newWO = dataStore.createWorkOrderWithJob(jobId, validation.data);
  return createEnvelope({ workOrder: { id: newWO.id, title: newWO.title, status: newWO.status } }, 'Work order created successfully');
}