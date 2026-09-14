'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Capacitor } from '@capacitor/core';
import { CallMonitor, type CallState, type CallbackID } from 'call-monitor';
import { getContacts, getContact, saveCallOutcome } from '@/lib/client-actions';
import type { CallOutcomeInput, Note } from '@/lib/types';
import { useFeedback } from '@/lib/feedback';
import { useOfflineMutation } from '@/features/offline/hooks/use-offline-mutations.hook';
import { useState, useEffect, useCallback } from 'react';

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
  const [callState, setCallState] = useState<CallState | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [pendingCallOutcome, setPendingCallOutcome] = useState<CallOutcomeInput | null>(null);

  // Listen for call state changes on native platforms
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const setupListener = async () => {
      await CallMonitor.addListener('callState', (state: CallState) => {
        setCallState(state);
        
        if (state.state === 'ended' && pendingCallOutcome) {
          // Call ended, save the outcome
          saveCallOutcome(pendingCallOutcome)
            .then(result => {
              if (result.success) {
                queryClient.invalidateQueries({ queryKey: ['contacts'] });
                showSuccess('Call outcome saved');
              } else {
                showError(result.message ?? 'Failed to save call outcome');
              }
            })
            .catch((error: Error) => {
              showError(error.message);
            })
            .finally(() => {
              setPendingCallOutcome(null);
              setIsCallActive(false);
            });
        } else if (state.state === 'failed') {
          setPendingCallOutcome(null);
          setIsCallActive(false);
          showError('Call failed');
        } else if (state.state === 'started') {
          setIsCallActive(true);
        }
      });
    };

    setupListener();

    return () => {
      CallMonitor.removeAllListeners();
    };
  }, [queryClient, showSuccess, showError, pendingCallOutcome]);

  const startCall = useCallback(async (phoneNumber: string, contactId: string, note: string) => {
    const input: CallOutcomeInput = { contactId, note };

    if (Capacitor.isNativePlatform()) {
      // Native: use CallMonitor plugin
      setPendingCallOutcome(input);
      setIsCallActive(true);
      
      try {
        await CallMonitor.startCall({ phoneNumber });
      } catch (error) {
        setPendingCallOutcome(null);
        setIsCallActive(false);
        showError('Failed to start call');
        throw error;
      }
    } else {
      // Web: use tel: link with fallback
      window.location.href = `tel:${phoneNumber}`;
      
      // Simulate call ended after window regains focus
      const handleFocus = () => {
        window.removeEventListener('focus', handleFocus);
        setTimeout(() => {
          // Save call outcome via mutation
          saveCallOutcome(input)
            .then(result => {
              if (result.success) {
                queryClient.invalidateQueries({ queryKey: ['contacts'] });
                showSuccess('Call outcome saved');
              } else {
                showError(result.message ?? 'Failed to save call outcome');
              }
            })
            .catch((error: Error) => {
              showError(error.message);
            });
        }, 1000);
      };
      window.addEventListener('focus', handleFocus);
    }
  }, [queryClient, showSuccess, showError]);

  // Also provide the original mutation for manual save (if needed)
  const saveMutation = useOfflineMutation<{ note: Note }, CallOutcomeInput>({
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

  return {
    startCall,
    saveCallOutcome: saveMutation.mutate,
    saveCallOutcomeAsync: saveMutation.mutateAsync,
    isPending: saveMutation.isPending,
    isCallActive,
    callState,
  };
}