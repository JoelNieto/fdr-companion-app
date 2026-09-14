'use client';

import { ReactNode } from 'react';

interface SafeAreaProps {
  children: ReactNode;
  className?: string;
}

export function SafeArea({ children, className = '' }: SafeAreaProps) {
  return (
    <div
      className={`
        min-h-screen
        pt-safe-area pb-safe-area
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function SafeAreaTop({ children, className = '' }: SafeAreaProps) {
  return (
    <div
      className={`
        pt-safe-area
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function SafeAreaBottom({ children, className = '' }: SafeAreaProps) {
  return (
    <div
      className={`
        pb-safe-area
        ${className}
      `}
    >
      {children}
    </div>
  );
}