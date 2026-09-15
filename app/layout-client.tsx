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

export function LayoutClient({ children }: { children: ReactNode }) {
  const router = useRouter();
  
  useEffect(() => {
    // Handle deep links on native platforms
    if (Capacitor.isNativePlatform()) {
      const handleAppUrlOpen = (event: { url: string }) => {
        const url = event.url;
        // Handle fieldcompanion://work-orders/{id}
        if (url.startsWith('fieldcompanion://work-orders/')) {
          const workOrderId = url.replace('fieldcompanion://work-orders/', '');
          router.push(`/work-orders/detail?id=${workOrderId}`);
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
          <SafeArea className="md:pt-16">
            {children}
          </SafeArea>
        </main>
        <Navigation />
        {/* One instance only — duplicate mounts raced IndexedDB and wedged writes */}
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 md:bottom-auto md:left-auto md:right-4 md:top-24">
          <OutboxIndicator />
        </div>
      </PushProvider>
    </Providers>
  );
}