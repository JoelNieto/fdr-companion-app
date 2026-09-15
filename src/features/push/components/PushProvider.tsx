'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ClientOnly } from '@/components/ui/ClientOnly';
import { AssignmentBanner } from '@/features/push/components/AssignmentBanner';
import { NotificationPermissionHint } from '@/features/push/components/NotificationPermissionHint';
import { workOrderDetailHref } from '@/features/work-orders/lib/work-order-routes';

interface WorkOrderSummary {
  id: string;
  title: string;
  status: string;
}

export function PushProvider({ children }: { children: React.ReactNode }) {
  const [banner, setBanner] = useState<WorkOrderSummary | null>(null);
  const router = useRouter();

  useEffect(() => {
    let removeListener: (() => void) | undefined;

    const initializeNotifications = async () => {
      if (!Capacitor.isNativePlatform()) return;

      const perm = await LocalNotifications.requestPermissions();
      if (perm.display === 'granted') {
        console.log('Local notifications permission granted');
      } else {
        console.log('Local notifications permission denied');
      }

      const listener = await LocalNotifications.addListener(
        'localNotificationActionPerformed',
        (notification) => {
          const data = notification.notification.extra;
          if (data?.workOrderId) {
            router.push(workOrderDetailHref(String(data.workOrderId)));
          }
        }
      );

      removeListener = () => {
        void listener.remove();
      };
    };

    void initializeNotifications();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // App came to foreground - could check for new assignments
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const checkForPush = () => {
      const pushData = localStorage.getItem('field-companion-push');
      if (pushData) {
        try {
          const wo = JSON.parse(pushData);
          setBanner(wo);
          localStorage.removeItem('field-companion-push');
        } catch {
          localStorage.removeItem('field-companion-push');
        }
      }
    };

    checkForPush();
    const interval = setInterval(checkForPush, 5000);

    return () => {
      removeListener?.();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [router]);

  return (
    <ClientOnly fallback={<>{children}</>}>
      {() => (
        <>
          {children}
          {banner && (
            <AssignmentBanner
              workOrder={banner}
              onDismiss={() => setBanner(null)}
              onNavigate={() => {
                setBanner(null);
                router.push(workOrderDetailHref(banner.id));
              }}
            />
          )}
          <NotificationPermissionHint />
        </>
      )}
    </ClientOnly>
  );
}

// Export helper function to schedule assignment notification
export async function scheduleAssignmentNotification(workOrder: WorkOrderSummary) {
  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'New Work Order Assigned',
            body: workOrder.title,
            id: Date.now(),
            extra: {
              workOrderId: workOrder.id,
            },
            schedule: { at: new Date(Date.now() + 1000) }, // Fire in 1 second
          },
        ],
      });
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  } else {
    // Web fallback: store in localStorage for PushProvider to pick up
    localStorage.setItem('field-companion-push', JSON.stringify(workOrder));
  }
}
