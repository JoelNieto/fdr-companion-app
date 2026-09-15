import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: () => false,
  },
}));

vi.mock('@capacitor/network', () => ({
  Network: {
    getStatus: vi.fn().mockResolvedValue({ connected: true }),
    addListener: vi.fn().mockResolvedValue({ remove: vi.fn() }),
  },
}));

describe('useOnlineStatus', () => {
  beforeEach(async () => {
    vi.resetModules();
  });

  it('returns online status on web', async () => {
    const { setSimulatedOffline } = await import('@/features/offline/lib/online-status');
    setSimulatedOffline(null);

    const { useOnlineStatus } = await import('@/features/offline/hooks/use-online-status.hook');
    const { result } = renderHook(() => useOnlineStatus());

    await waitFor(() => {
      expect(result.current.isOnline).toBe(true);
    });
  });

  it('detects simulated offline', async () => {
    const { setSimulatedOffline } = await import('@/features/offline/lib/online-status');
    setSimulatedOffline(null);

    const { useOnlineStatus } = await import('@/features/offline/hooks/use-online-status.hook');
    const { result } = renderHook(() => useOnlineStatus());

    await waitFor(() => {
      expect(result.current.isOnline).toBe(true);
    });

    act(() => {
      setSimulatedOffline(true);
    });

    await waitFor(() => {
      expect(result.current.isOnline).toBe(false);
      expect(result.current.simulatedOffline).toBe(true);
    });
  });

  it('increments reconnect generation when coming back online', async () => {
    const { setSimulatedOffline } = await import('@/features/offline/lib/online-status');
    setSimulatedOffline(true);

    const { useOnlineStatus } = await import('@/features/offline/hooks/use-online-status.hook');
    const { result } = renderHook(() => useOnlineStatus());

    await waitFor(() => {
      expect(result.current.isOnline).toBe(false);
    });

    const before = result.current.reconnectGeneration;

    act(() => {
      setSimulatedOffline(null);
    });

    await waitFor(() => {
      expect(result.current.isOnline).toBe(true);
      expect(result.current.reconnectGeneration).toBeGreaterThan(before);
    });
  });
});
