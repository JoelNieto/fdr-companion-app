import { z } from 'zod';
import type { WorkOrderStatus } from '@/lib/types';

export const createWorkOrderSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(80, 'Title must be at most 80 characters'),
  assignee: z.string().min(1, 'Assignee is required'),
  scheduledDate: z.string().refine(
    (date) => {
      const selected = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selected >= today;
    },
    'Scheduled date must be today or in the future'
  ),
});

export const callOutcomeSchema = z.object({
  contactId: z.string().min(1, 'Contact ID is required'),
  note: z.string().min(1, 'Note cannot be empty').max(500, 'Note must be at most 500 characters'),
});

export const blockWorkOrderSchema = z.object({
  workOrderId: z.string().min(1, 'Work order ID is required'),
  reason: z.string().min(5, 'Reason must be at least 5 characters').max(200, 'Reason must be at most 200 characters'),
});

export const resumeWorkOrderSchema = z.object({
  workOrderId: z.string().min(1, 'Work order ID is required'),
});

export const advanceStatusSchema = z.object({
  workOrderId: z.string().min(1, 'Work order ID is required'),
});

export const jobStatusSchema = z.enum(['lead', 'scheduled', 'in_progress', 'completed']);
export const workOrderStatusSchema = z.enum(['scheduled', 'en_route', 'on_site', 'done', 'blocked']);

export const legalTransitions: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  scheduled: ['en_route'],
  en_route: ['on_site', 'blocked'],
  on_site: ['done', 'blocked'],
  blocked: [], // Resume handled separately
  done: [],
};

export function isLegalTransition(from: WorkOrderStatus, to: WorkOrderStatus): boolean {
  return legalTransitions[from]?.includes(to) ?? false;
}

export type CreateWorkOrderInput = z.infer<typeof createWorkOrderSchema>;
export type CallOutcomeInput = z.infer<typeof callOutcomeSchema>;
export type BlockWorkOrderInput = z.infer<typeof blockWorkOrderSchema>;
export type ResumeWorkOrderInput = z.infer<typeof resumeWorkOrderSchema>;
export type AdvanceStatusInput = z.infer<typeof advanceStatusSchema>;