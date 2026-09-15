import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOnlineStatus } from '@/features/offline/hooks/use-online-status.hook';

// Mock Capacitor
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: () => false,
  },
}));

// Mock Network plugin
const mockNetworkListener = vi.fn();
vi.mock('@capacitor/network', () => ({
  Network: {
    getStatus: vi.fn().mockResolvedValue({ connected: true }),
    addListener: vi.fn().mockResolvedValue({ remove: vi.fn() }),
  },
}));

describe('useOnlineStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, 'onLine', { writable: true, value: true });
  });

  it('returns online status on web', async () => {
    const { result } = renderHook(() => useOnlineStatus());
    
    await waitFor(() => {
      expect(result.current.isOnline).toBe(true);
    });
  });

  it('detects offline event on web', async () => {
    const { result } = renderHook(() => useOnlineStatus());
    
    await waitFor(() => {
      expect(result.current.isOnline).toBe(true);
    });

    // Simulate offline
    act(() => {
      Object.defineProperty(navigator, 'onLine', { writable: true, value: false });
      window.dispatchEvent(new Event('offline'));
    });

    await waitFor(() => {
      expect(result.current.isOnline).toBe(false);
    });
  });

  it('detects online event on web', async () => {
    Object.defineProperty(navigator, 'onLine', { writable: true, value: false });
    
    const { result } = renderHook(() => useOnlineStatus());
    
    await waitFor(() => {
      expect(result.current.isOnline).toBe(false);
    });

    // Simulate online
    act(() => {
      Object.defineProperty(navigator, 'onLine', { writable: true, value: true });
      window.dispatchEvent(new Event('online'));
    });

    await waitFor(() => {
      expect(result.current.isOnline).toBe(true);
    });
  });
});