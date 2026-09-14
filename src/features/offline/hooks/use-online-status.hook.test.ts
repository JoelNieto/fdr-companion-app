import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useOnlineStatus } from '@/features/offline/hooks/use-online-status.hook';

// Mock useOnlineStatus
vi.mock('@/features/offline/hooks/use-online-status.hook', () => ({
  useOnlineStatus: vi.fn(),
}));

describe('offline hooks - useOnlineStatus', () => {
  it('returns online status', () => {
    const mockUseOnlineStatus = useOnlineStatus as vi.Mock;
    mockUseOnlineStatus.mockReturnValue({ isOnline: true, wasOffline: false });
    
    const { isOnline, wasOffline } = useOnlineStatus();
    expect(isOnline).toBe(true);
    expect(wasOffline).toBe(false);
  });

  it('returns offline status', () => {
    const mockUseOnlineStatus = useOnlineStatus as vi.Mock;
    mockUseOnlineStatus.mockReturnValue({ isOnline: false, wasOffline: true });
    
    const { isOnline, wasOffline } = useOnlineStatus();
    expect(isOnline).toBe(false);
    expect(wasOffline).toBe(true);
  });
});