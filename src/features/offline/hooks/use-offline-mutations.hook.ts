"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addOutboxItem } from "@/features/offline/lib/outbox-store";
import { useOnlineStatus } from "./use-online-status.hook";
import { useFeedback } from "@/lib/feedback";

interface OfflineMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  outboxType: "status_change" | "call_outcome";
  getDescription: (variables: TVariables) => string;
  getPayload: (variables: TVariables) => Record<string, unknown>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
}

export function useOfflineMutation<TData, TVariables>({
  mutationFn,
  outboxType,
  getDescription,
  getPayload,
  onSuccess,
  onError,
}: OfflineMutationOptions<TData, TVariables>) {
  const { isOnline } = useOnlineStatus();
  const { showSuccess, showError } = useFeedback();

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      if (!isOnline) {
        // Queue for offline replay
        const outboxItem = {
          id: `outbox-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          type: outboxType,
          payload: getPayload(variables),
          description: getDescription(variables),
          state: "pending" as const,
          createdAt: new Date().toISOString(),
        };

        await addOutboxItem(outboxItem);
        showSuccess("Action queued for when online");

        // Return optimistic result
        return { success: true, offline: true } as TData;
      }

      return mutationFn(variables);
    },
    onSuccess: (data, variables) => {
      if (
        data &&
        typeof data === "object" &&
        "offline" in data &&
        data.offline
      ) {
        // Already showed success for offline
        return;
      }
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
