'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getContacts, getContact, saveCallOutcome } from '@/features/contacts/server/actions';
import type { CallOutcomeInput } from '@/lib/types';
import { useFeedback } from '@/lib/feedback';

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
  
  return useMutation({
    mutationFn: async (input: CallOutcomeInput) => {
      const result = await saveCallOutcome(input);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      showSuccess('Call outcome saved');
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });
}