'use client';

import { useState, useEffect, ReactNode } from 'react';

interface ClientOnlyProps {
  children: (mounted: boolean) => ReactNode;
  fallback?: ReactNode;
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [mounted, setMounted] = useState(false);
  
  // This useEffect is intentional for client-only rendering to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return <>{fallback}</>;
  }
  
  return <>{children(true)}</>;
}