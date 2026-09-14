'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getJobs, getJob, getJobsByContact, getJobsByStatus, createWorkOrder } from '@/features/jobs/server/actions';
import type { Job, CreateWorkOrderInput } from '@/lib/types';
import { useFeedback } from '@/lib/feedback';

export function useJobs() {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const result = await getJobs();
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: async () => {
      const result = await getJob(id);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!id,
  });
}

export function useJobsByContact(contactId: string) {
  return useQuery({
    queryKey: ['jobs', 'contact', contactId],
    queryFn: async () => {
      const result = await getJobsByContact(contactId);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!contactId,
  });
}

export function useJobsByStatus(status: Job['status'] | 'all') {
  return useQuery({
    queryKey: ['jobs', 'status', status],
    queryFn: async () => {
      if (status === 'all') {
        const result = await getJobs();
        if (!result.success) throw new Error(result.message);
        return result.data;
      }
      const result = await getJobsByStatus(status);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
  });
}

export function useCreateWorkOrder(jobId: string) {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useFeedback();
  
  return useMutation({
    mutationFn: async (input: CreateWorkOrderInput) => {
      const result = await createWorkOrder(jobId, input);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs', jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      showSuccess('Work order created successfully');
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });
}