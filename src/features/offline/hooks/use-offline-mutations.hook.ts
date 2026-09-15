"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addOutboxItem } from "@/features/offline/lib/outbox-store";
import { getIsOnline, refreshOnlineStatus } from "@/features/offline/lib/online-status";
import { useFeedback } from "@/lib/feedback";

interface OfflineMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  outboxType: "status_change" | "call_outcome" | "create";
  getDescription: (variables: TVariables) => string;
  getPayload: (variables: TVariables) => Record<string, unknown>;
  /** Required so offline mutations resolve with a typed result and clear isPending. */
  getOptimisticData: (variables: TVariables) => TData;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
}

export function useOfflineMutation<TData, TVariables>({
  mutationFn,
  outboxType,
  getDescription,
  getPayload,
  getOptimisticData,
  onSuccess,
  onError,
}: OfflineMutationOptions<TData, TVariables>) {
  const { showSuccess, showError } = useFeedback();

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      const online = await refreshOnlineStatus();

      if (!online) {
        const outboxItem = {
          id: `outbox-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          type: outboxType,
          payload: getPayload(variables),
          description: getDescription(variables),
          state: "pending" as const,
          createdAt: new Date().toISOString(),
        };

        try {
          await addOutboxItem(outboxItem);
          showSuccess("Action queued for when online");
        } catch (err) {
          console.error("Failed to queue outbox item", err);
          showError("Could not save offline action — please retry");
          throw err;
        }

        return getOptimisticData(variables);
      }

      return mutationFn(variables);
    },
    // Sync — async onMutate + connectivity emit re-renders raced isPending in testing
    onMutate: () => ({ queuedOffline: !getIsOnline() }),
    onSuccess: (data, variables, context) => {
      if (context?.queuedOffline) return;
      onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      onError?.(error as Error, variables);
      showError((error as Error).message);
    },
  });
}

export function useOptimisticUpdate<TData, TVariables>({
  mutationFn,
  queryKey,
  getOptimisticData,
  onSuccess,
  onError,
}: {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKey: string[];
  getOptimisticData: (variables: TVariables) => TData;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
}) {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useFeedback();

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<TData>(queryKey);

      queryClient.setQueryData(queryKey, getOptimisticData(variables));

      return { previousData };
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      onError?.(error as Error, variables);
      showError((error as Error).message);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey });
      onSuccess?.(data, variables);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
