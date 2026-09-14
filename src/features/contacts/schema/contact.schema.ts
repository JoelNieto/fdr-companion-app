import { z } from 'zod';

export const callOutcomeSchema = z.object({
  contactId: z.string().min(1, 'Contact ID is required'),
  note: z.string().min(1, 'Note cannot be empty').max(500, 'Note must be at most 500 characters'),
});

export type CallOutcomeInput = z.infer<typeof callOutcomeSchema>;