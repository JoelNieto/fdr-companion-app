'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getContacts, getContact, saveCallOutcome } from '@/features/contacts/server/actions';
import type { CallOutcomeInput, Note } from '@/lib/types';
import { useFeedback } from '@/lib/feedback';
import { useOfflineMutation } from '@/features/offline/hooks/use-offline-mutations.hook';

export function useContacts() {
  return useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const result = await getContacts();
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
  });
}

export function useContact(id: string) {
  return useQuery({
    queryKey: ['contacts', id],
    queryFn: async () => {
      const result = await getContact(id);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!id,
  });
}

export function useCallOutcome() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useFeedback();
  
  return useOfflineMutation<{ note: Note }, CallOutcomeInput>({
    mutationFn: async (input) => {
      const result = await saveCallOutcome(input);
      if (!result.success || !result.data) throw new Error(result.message ?? 'Failed to save call outcome');
      return result.data;
    },
    outboxType: 'call_outcome',
    getDescription: (input) => `Log call outcome for contact ${input.contactId}`,
    getPayload: (input) => ({ ...input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      showSuccess('Call outcome saved');
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });
}