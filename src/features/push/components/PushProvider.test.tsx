import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Hoist mocks - use vi.hoisted for all mocks
const { mockLocalNotifications, mockCapacitor, mockDateNow } = vi.hoisted(() => ({
  mockLocalNotifications: {
    schedule: vi.fn().mockResolvedValue(undefined),
    requestPermissions: vi.fn().mockResolvedValue({ display: 'granted' }),
    checkPermissions: vi.fn().mockResolvedValue({ display: 'granted' }),
    addListener: vi.fn().mockResolvedValue({ remove: vi.fn() }),
  },
  mockCapacitor: {
    isNativePlatform: false,
  },
  mockDateNow: {
    current: Date.now(),
    increment: 0,
  },
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: () => mockCapacitor.isNativePlatform,
  },
}));

vi.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: mockLocalNotifications,
}));

// Mock Date.now for unique IDs
let dateNowCallCount = 0;
const originalDateNow = Date.now;
vi.spyOn(global.Date, 'now').mockImplementation(() => {
  dateNowCallCount++;
  return mockDateNow.current + (dateNowCallCount * 1000);
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

// Import after mocks
const { scheduleAssignmentNotification } = await import('@/features/push/components/PushProvider');

describe('PushProvider Notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    mockCapacitor.isNativePlatform = false;
    dateNowCallCount = 0;
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe('scheduleAssignmentNotification', () => {
    it('schedules local notification on native', async () => {
      mockCapacitor.isNativePlatform = true;
      
      await scheduleAssignmentNotification({
        id: 'wo-1',
        title: 'Roof Repair',
        status: 'scheduled',
      });
      
      expect(mockLocalNotifications.schedule).toHaveBeenCalledWith({
        notifications: [{
          title: 'New Work Order Assigned',
          body: 'Roof Repair',
          id: expect.any(Number),
          extra: { workOrderId: 'wo-1' },
          schedule: { at: expect.any(Date) },
        }],
      });
    });

    it('uses localStorage fallback on web', async () => {
      mockCapacitor.isNativePlatform = false;
      
      await scheduleAssignmentNotification({
        id: 'wo-1',
        title: 'Roof Repair',
        status: 'scheduled',
      });
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'field-companion-push',
        JSON.stringify({ id: 'wo-1', title: 'Roof Repair', status: 'scheduled' })
      );
    });

    it('generates unique notification ID', async () => {
      mockCapacitor.isNativePlatform = true;
      
      await scheduleAssignmentNotification({ id: 'wo-1', title: 'Test', status: 'scheduled' });
      await scheduleAssignmentNotification({ id: 'wo-2', title: 'Test 2', status: 'scheduled' });
      
      const calls = mockLocalNotifications.schedule.mock.calls;
      expect(calls[0][0].notifications[0].id).not.toBe(calls[1][0].notifications[0].id);
    });

    it('sets schedule to fire in ~1 second', async () => {
      mockCapacitor.isNativePlatform = true;
      
      const before = Date.now();
      await scheduleAssignmentNotification({ id: 'wo-1', title: 'Test', status: 'scheduled' });
      const after = Date.now();
      
      const scheduledAt = mockLocalNotifications.schedule.mock.calls[0][0].notifications[0].schedule.at;
      expect(scheduledAt.getTime()).toBeGreaterThanOrEqual(before + 1000);
      expect(scheduledAt.getTime()).toBeLessThanOrEqual(after + 1000);
    });
  });

  describe('Deep link handling', () => {
    it('includes workOrderId in notification extra', async () => {
      mockCapacitor.isNativePlatform = true;
      
      await scheduleAssignmentNotification({ id: 'wo-123', title: 'Test', status: 'scheduled' });
      
      const extra = mockLocalNotifications.schedule.mock.calls[0][0].notifications[0].extra;
      expect(extra.workOrderId).toBe('wo-123');
    });
  });
});