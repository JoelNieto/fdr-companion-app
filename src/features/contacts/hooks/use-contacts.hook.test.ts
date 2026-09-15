import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useContacts, useContact, useCallOutcome } from '@/features/contacts/hooks/use-contacts.hook';
import { useWorkOrder, useMyWorkOrders, useAdvanceStatus, useBlockWorkOrder } from '@/features/work-orders/hooks/use-work-orders.hook';

// Mock client actions
vi.mock('@/lib/client-actions', () => ({
  getContacts: vi.fn().mockResolvedValue({ success: true, data: [{ id: 'c-1', name: 'John', phone: '555-1234', email: 'john@test.com', address: '123 Main St' }] }),
  getContact: vi.fn().mockResolvedValue({ success: true, data: { id: 'c-1', name: 'John', phone: '555-1234', email: 'john@test.com', address: '123 Main St' } }),
  saveCallOutcome: vi.fn().mockResolvedValue({ success: true, data: { id: 'note-1', text: 'Test note', timestamp: '2024-01-01T00:00:00Z' }, message: 'Saved' }),
  getWorkOrder: vi.fn().mockResolvedValue({ success: true, data: { id: 'wo-1', title: 'Test', status: 'scheduled', assignee: 'Casey', scheduledDate: '2024-01-01', jobId: 'job-1', notes: [], photos: [] } }),
  getMyWorkOrders: vi.fn().mockResolvedValue({ success: true, data: [{ id: 'wo-1', title: 'Test', status: 'scheduled', assignee: 'Casey', scheduledDate: '2024-01-01', jobId: 'job-1', notes: [], photos: [] }] }),
  advanceWorkOrderStatus: vi.fn().mockResolvedValue({ success: true, data: { id: 'wo-1', title: 'Test', status: 'en_route', assignee: 'Casey', scheduledDate: '2024-01-01', jobId: 'job-1', notes: [], photos: [] } }),
  blockWorkOrder: vi.fn().mockResolvedValue({ success: true, data: { id: 'wo-1', title: 'Test', status: 'blocked', assignee: 'Casey', scheduledDate: '2024-01-01', jobId: 'job-1', notes: [], photos: [], blockedReason: 'Test', blockedFromStatus: 'en_route' } }),
  resumeWorkOrder: vi.fn().mockResolvedValue({ success: true, data: { id: 'wo-1', title: 'Test', status: 'en_route', assignee: 'Casey', scheduledDate: '2024-01-01', jobId: 'job-1', notes: [], photos: [] } }),
}));

// Mock Capacitor
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: () => false,
  },
}));

// Mock CallMonitor
vi.mock('call-monitor', () => ({
  CallMonitor: {
    addListener: vi.fn().mockResolvedValue('web-123'),
    removeAllListeners: vi.fn().mockResolvedValue(undefined),
    startCall: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock feedback
vi.mock('@/lib/feedback', () => ({
  useFeedback: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}));

// Mock useOfflineMutation
vi.mock('@/features/offline/hooks/use-offline-mutations.hook', () => ({
  useOfflineMutation: (options: any) => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue({ success: true }),
    isPending: false,
    isError: false,
    isSuccess: false,
  }),
}));

// Create wrapper for react-query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
};

describe('Contact Hooks', () => {
  const wrapper = createWrapper();

  describe('useContacts', () => {
    it('fetches contacts list', async () => {
      const { result } = renderHook(() => useContacts(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      
      expect(result.current.data).toHaveLength(1);
      expect(result.current.data[0].name).toBe('John');
    });
  });

  describe('useContact', () => {
    it('fetches single contact', async () => {
      const { result } = renderHook(() => useContact('c-1'), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      
      expect(result.current.data?.name).toBe('John');
    });

    it('does not fetch when id is empty', async () => {
      const { result } = renderHook(() => useContact(''), { wrapper });
      
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useCallOutcome', () => {
    it('returns startCall function', async () => {
      const { result } = renderHook(() => useCallOutcome(), { wrapper });
      
      expect(typeof result.current.startCall).toBe('function');
      expect(typeof result.current.saveCallOutcome).toBe('function');
      expect(typeof result.current.saveCallOutcomeAsync).toBe('function');
    });

    it('has isCallActive and callState', async () => {
      const { result } = renderHook(() => useCallOutcome(), { wrapper });
      
      expect(result.current.isCallActive).toBe(false);
      expect(result.current.callState).toBeNull();
    });
  });
});

describe('Work Order Hooks', () => {
  const wrapper = createWrapper();

  describe('useWorkOrder', () => {
    it('fetches work order', async () => {
      const { result } = renderHook(() => useWorkOrder('wo-1'), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      
      expect(result.current.data?.title).toBe('Test');
    });

    it('does not fetch when id is empty', async () => {
      const { result } = renderHook(() => useWorkOrder(''), { wrapper });
      
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useMyWorkOrders', () => {
    it('fetches my work orders', async () => {
      const { result } = renderHook(() => useMyWorkOrders('Casey Rivera'), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      
      expect(result.current.data).toHaveLength(1);
    });

    it('uses default assignee', async () => {
      const { result } = renderHook(() => useMyWorkOrders(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  describe('useAdvanceStatus', () => {
    it('returns mutate function', async () => {
      const { result } = renderHook(() => useAdvanceStatus(), { wrapper });
      
      expect(typeof result.current.mutate).toBe('function');
      expect(typeof result.current.mutateAsync).toBe('function');
    });

    it('has isPending state', async () => {
      const { result } = renderHook(() => useAdvanceStatus(), { wrapper });
      
      expect(result.current.isPending).toBe(false);
    });
  });

  describe('useBlockWorkOrder', () => {
    it('returns mutate function', async () => {
      const { result } = renderHook(() => useBlockWorkOrder(), { wrapper });
      
      expect(typeof result.current.mutate).toBe('function');
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });
});