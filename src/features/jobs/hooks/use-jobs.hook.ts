'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getJobs, getJob, getJobsByContact, getJobsByStatus, createWorkOrder } from '@/features/jobs/server/actions';
import type { Job, CreateWorkOrderInput } from '@/lib/types';
import { useFeedback } from '@/lib/feedback';
import { useOfflineMutation } from '@/features/offline/hooks/use-offline-mutations.hook';
import { scheduleAssignmentNotification } from '@/features/push/components/PushProvider';

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
  
  return useOfflineMutation<{ workOrder: { id: string; title: string; status: string } }, CreateWorkOrderInput>({
    mutationFn: async (input) => {
      const result = await createWorkOrder(jobId, input);
      if (!result.success || !result.data) throw new Error(result.message ?? 'Failed to create work order');
      return result.data;
    },
    outboxType: 'status_change',
    getDescription: (input) => `Create work order: ${input.title}`,
    getPayload: (input) => ({ ...input, type: 'create', jobId }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jobs', jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['work-orders', 'my'] });
      showSuccess('Work order created successfully');
      
      // Schedule local notification for assignment
      if (data?.workOrder) {
        scheduleAssignmentNotification({
          id: data.workOrder.id,
          title: data.workOrder.title,
          status: data.workOrder.status,
        });
      }
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });
}