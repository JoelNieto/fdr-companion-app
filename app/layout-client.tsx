'use client';

import { Providers } from './providers';
import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';
import { SafeArea } from '@/components/layout/SafeArea';
import { OfflineIndicator } from '@/features/offline/components/OfflineIndicator';
import { OutboxIndicator } from '@/features/offline/components/OutboxIndicator';
import { PushProvider } from '@/features/push/components/PushProvider';
import { ReactNode } from 'react';

export function LayoutClient({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <PushProvider>
        <Header />
        <OfflineIndicator />
        <main className="flex-1">
          <SafeArea className="md:pt-16">
            {children}
          </SafeArea>
        </main>
        <Navigation />
        {/* Mobile: Floating outbox indicator above bottom nav */}
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 md:hidden z-50">
          <OutboxIndicator />
        </div>
        {/* Desktop: Fixed top-right outbox indicator */}
        <div className="fixed top-20 right-4 md:top-24 md:right-4 z-50 hidden md:block">
          <OutboxIndicator />
        </div>
      </PushProvider>
    </Providers>
  );
}