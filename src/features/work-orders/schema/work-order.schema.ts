import { z } from 'zod';
import type { WorkOrderStatus } from '@/lib/types';

export const advanceStatusSchema = z.object({
  workOrderId: z.string().min(1, 'Work order ID is required'),
});

export const blockWorkOrderSchema = z.object({
  workOrderId: z.string().min(1, 'Work order ID is required'),
  reason: z.string().min(5, 'Reason must be at least 5 characters').max(200, 'Reason must be at most 200 characters'),
});

export const resumeWorkOrderSchema = z.object({
  workOrderId: z.string().min(1, 'Work order ID is required'),
});

export const photoEvidenceSchema = z.object({
  workOrderId: z.string().min(1, 'Work order ID is required'),
  uri: z.string().min(1, 'Photo URI is required'),
});

export const legalTransitions: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  scheduled: ['en_route'],
  en_route: ['on_site', 'blocked'],
  on_site: ['done', 'blocked'],
  blocked: [],
  done: [],
};

export function isLegalTransition(from: WorkOrderStatus, to: WorkOrderStatus): boolean {
  return legalTransitions[from]?.includes(to) ?? false;
}

export type AdvanceStatusInput = z.infer<typeof advanceStatusSchema>;
export type BlockWorkOrderInput = z.infer<typeof blockWorkOrderSchema>;
export type ResumeWorkOrderInput = z.infer<typeof resumeWorkOrderSchema>;
export type PhotoEvidenceInput = z.infer<typeof photoEvidenceSchema>;