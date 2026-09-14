'use server';

import { dataStore } from '@/lib/storage/data-store';
import type { ApiEnvelope, CallOutcomeInput, Contact, Note } from '@/lib/types';
import { callOutcomeSchema } from '@/features/contacts/schema/contact.schema';
import { validateInput, createEnvelope, createErrorEnvelope } from '@/lib/validation';

export async function getContacts(): Promise<ApiEnvelope<Contact[]>> {
  return createEnvelope(dataStore.getContacts());
}

export async function getContact(id: string): Promise<ApiEnvelope<Contact | undefined>> {
  const contact = dataStore.getContact(id);
  if (!contact) {
    return createErrorEnvelope<Contact | undefined>('Contact not found');
  }
  return createEnvelope(contact);
}

export async function saveCallOutcome(input: CallOutcomeInput): Promise<ApiEnvelope<{ note: Note }>> {
  const validation = validateInput(callOutcomeSchema, input);
  if (!validation.success) {
    return createErrorEnvelope<{ note: Note }>('Validation failed');
  }
  
  const result = dataStore.addCallOutcomeNote(validation.data);
  if (!result.success || !result.data) {
    return createErrorEnvelope<{ note: Note }>(result.message ?? 'Failed to save call outcome');
  }
  
  return createEnvelope({ note: result.data }, result.message);
}