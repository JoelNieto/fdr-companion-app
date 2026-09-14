'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWorkOrder, getWorkOrdersByJob, getMyWorkOrders, advanceWorkOrderStatus, blockWorkOrder, resumeWorkOrder, addPhotoToWorkOrder } from '@/features/work-orders/server/actions';
import type { WorkOrder, AdvanceStatusInput, BlockWorkOrderInput, ResumeWorkOrderInput } from '@/lib/types';
import { useFeedback } from '@/lib/feedback';

export function useWorkOrder(id: string) {
  return useQuery({
    queryKey: ['work-orders', id],
    queryFn: async () => {
      const result = await getWorkOrder(id);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!id,
  });
}

export function useWorkOrdersByJob(jobId: string) {
  return useQuery({
    queryKey: ['work-orders', 'job', jobId],
    queryFn: async () => {
      const result = await getWorkOrdersByJob(jobId);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!jobId,
  });
}

export function useMyWorkOrders(assignee: string = 'Casey Rivera') {
  return useQuery({
    queryKey: ['work-orders', 'my', assignee],
    queryFn: async () => {
      const result = await getMyWorkOrders(assignee);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
  });
}

export function useAdvanceStatus() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useFeedback();
  
  return useMutation({
    mutationFn: async (input: AdvanceStatusInput) => {
      const result = await advanceWorkOrderStatus(input);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['work-orders', 'my'] });
      showSuccess(`Status advanced to ${data!.status.replace('_', ' ')}`);
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });
}

export function useBlockWorkOrder() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useFeedback();
  
  return useMutation({
    mutationFn: async (input: BlockWorkOrderInput) => {
      const result = await blockWorkOrder(input);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['work-orders', 'my'] });
      showSuccess('Work order blocked');
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });
}

export function useResumeWorkOrder() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useFeedback();
  
  return useMutation({
    mutationFn: async (input: ResumeWorkOrderInput) => {
      const result = await resumeWorkOrder(input);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['work-orders', 'my'] });
      showSuccess('Work order resumed');
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });
}

export function useAddPhoto() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useFeedback();
  
  return useMutation({
    mutationFn: async ({ workOrderId, uri }: { workOrderId: string; uri: string }) => {
      const result = await addPhotoToWorkOrder(workOrderId, uri);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['work-orders', variables.workOrderId] });
      showSuccess('Photo added');
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });
}