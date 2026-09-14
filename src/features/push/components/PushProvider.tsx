'use client';

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ClientOnly } from '@/components/ui/ClientOnly';
import { AssignmentBanner } from '@/features/push/components/AssignmentBanner';
import { NotificationPermissionHint } from '@/features/push/components/NotificationPermissionHint';

interface WorkOrderSummary {
  id: string;
  title: string;
  status: string;
}

export function PushProvider({ children }: { children: React.ReactNode }) {
  const [banner, setBanner] = useState<WorkOrderSummary | null>(null);
  
  useEffect(() => {
    const initializeNotifications = async () => {
      if (Capacitor.isNativePlatform()) {
        // Request permission for local notifications on native
        const perm = await LocalNotifications.requestPermissions();
        if (perm.display === 'granted') {
          console.log('Local notifications permission granted');
        } else {
          console.log('Local notifications permission denied');
        }
        
        // Handle notification action performed (deep link)
        const listener = await LocalNotifications.addListener(
          'localNotificationActionPerformed',
          (notification) => {
            const data = notification.notification.extra;
            if (data?.workOrderId) {
              // Navigate to work order detail
              window.location.href = `/work-orders/${data.workOrderId}`;
            }
          }
        );
        
        return () => {
          listener.remove();
        };
      }
    };
    
    initializeNotifications();
    
    // Web fallback: check for push data in localStorage
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
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);
  
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
                window.location.href = `/work-orders/${banner.id}`;
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