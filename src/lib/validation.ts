import { z } from 'zod';

export function validateInput<T>(schema: z.ZodSchema<T>, input: unknown): { success: true; data: T } | { success: false; errors: z.ZodIssue[] } {
  const result = schema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error.issues };
}

export function createEnvelope<T>(data: T, message?: string): { success: true; data: T; message?: string } {
  return { success: true, data, message };
}

export function createErrorEnvelope<T = unknown>(message: string, data?: T): { success: false; message: string; data?: T } {
  return { success: false, message, data };
}

export function formatZodErrors(errors: z.ZodIssue[]): Record<string, string> {
  const formatted: Record<string, string> = {};
  for (const error of errors) {
    const path = error.path.join('.');
    if (!formatted[path] || error.code === 'invalid_type') {
      formatted[path] = error.message;
    }
  }
  return formatted;
}