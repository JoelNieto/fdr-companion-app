'use client';

import { useEffect } from 'react';
import { Providers } from './providers';
import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';
import { SafeArea } from '@/components/layout/SafeArea';
import { OfflineIndicator } from '@/features/offline/components/OfflineIndicator';
import { OutboxIndicator } from '@/features/offline/components/OutboxIndicator';
import { PushProvider } from '@/features/push/components/PushProvider';
import { ReactNode } from 'react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { useRouter } from 'next/navigation';
import { workOrderDetailHref } from '@/features/work-orders/lib/work-order-routes';

export function LayoutClient({ children }: { children: ReactNode }) {
  const router = useRouter();
  
  useEffect(() => {
    // Handle deep links on native platforms
    if (Capacitor.isNativePlatform()) {
      const handleAppUrlOpen = (event: { url: string }) => {
        const url = event.url;
        // Handle fieldcompanion://work-orders/{id}
        if (url.startsWith('fieldcompanion://work-orders/')) {
          const workOrderId = url.replace('fieldcompanion://work-orders/', '').split(/[?#]/)[0];
          if (workOrderId) {
            router.push(workOrderDetailHref(workOrderId));
          }
        }
      };
      
      const listener = App.addListener('appUrlOpen', handleAppUrlOpen);
      
      return () => {
        listener.then((cb) => cb.remove());
      };
    }
  }, [router]);
  
  return (
    <Providers>
      <PushProvider>
        <Header />
        <OfflineIndicator />
        <main className="flex-1 min-h-0">
          <SafeArea className="pb-nav-safe md:pb-0 md:pt-0">
            {children}
          </SafeArea>
        </main>
        <Navigation />
        {/* Mobile: above bottom nav on the right; desktop: top-right */}
        <div className="fixed bottom-outbox-safe right-4 z-50 md:bottom-auto md:top-24">
          <OutboxIndicator />
        </div>
      </PushProvider>
    </Providers>
  );
}