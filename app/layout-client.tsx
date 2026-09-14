'use client';

import { Providers } from './providers';
import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';
import { SafeArea } from '@/components/layout/SafeArea';
import { ReactNode } from 'react';

export function LayoutClient({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <Header />
      <main className="flex-1">
        <SafeArea className="md:pt-16">
          {children}
        </SafeArea>
      </main>
      <Navigation />
    </Providers>
  );
}