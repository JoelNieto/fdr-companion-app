'use client';

import { useEffect, useState, useRef } from 'react';

export function NotificationPermissionHint() {
  const [showHint, setShowHint] = useState(false);
  const initializedRef = useRef(false);
  
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    
    if (typeof window === 'undefined') return;
    
    // Check if notifications are supported and permission is denied
    if ('Notification' in window && Notification.permission === 'denied') {
      setShowHint(true);
    }
    
    // Also check if we should show hint on first load
    const hasSeenHint = localStorage.getItem('notification-hint-dismissed');
    if (!hasSeenHint && 'Notification' in window && Notification.permission === 'default') {
      // Show hint after a delay on first visit
      const timer = setTimeout(() => setShowHint(true), 5000);
      return () => clearTimeout(timer);
    }
  }, []);
  
  if (!showHint) return null;
  
  const handleDismiss = () => {
    setShowHint(false);
    localStorage.setItem('notification-hint-dismissed', 'true');
  };
  
  return (
    <div
      data-testid="notif-permission-hint"
      className="fixed bottom-20 left-4 right-4 md:bottom-24 md:left-auto md:right-4 md:w-96 z-40 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg shadow-lg p-4 animate-slide-up"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Enable notifications for work order assignments
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
            You&apos;ll get alerts when new work orders are assigned to you, even when the app is closed.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleDismiss}
            className="text-xs text-amber-700 dark:text-amber-300 hover:underline"
          >
            Not now
          </button>
          <button
            onClick={async () => {
              if ('Notification' in window) {
                await Notification.requestPermission();
                handleDismiss();
              }
            }}
            className="px-3 py-1 text-xs bg-amber-600 text-white rounded hover:bg-amber-700"
          >
            Enable
          </button>
        </div>
      </div>
    </div>
  );
}