'use client';

import { useEffect, useState } from 'react';
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