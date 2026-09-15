'use client';

import { ReactNode } from 'react';

interface SafeAreaProps {
  children: ReactNode;
  className?: string;
}

/** Content shell — does not apply insets (header/nav own those for fixed/sticky bars). */
export function SafeArea({ children, className = '' }: SafeAreaProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

/** Prefer applying pt-safe-area directly on sticky/fixed headers. */
export function SafeAreaTop({ children, className = '' }: SafeAreaProps) {
  return (
    <div className={`pt-safe-area ${className}`}>
      {children}
    </div>
  );
}

/** Prefer applying pb-safe-area directly on fixed bottom bars. */
export function SafeAreaBottom({ children, className = '' }: SafeAreaProps) {
  return (
    <div className={`pb-safe-area ${className}`}>
      {children}
    </div>
  );
}
