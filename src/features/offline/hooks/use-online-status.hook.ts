'use client';

import { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);
  const initializedRef = useRef(false);
  
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    
    const updateOnlineStatus = (online: boolean) => {
      if (online) {
        setIsOnline(true);
        setWasOffline(true);
      } else {
        setIsOnline(false);
      }
    };
    
    if (Capacitor.isNativePlatform()) {
      // Use Capacitor Network plugin on native platforms
      Network.getStatus().then((status) => {
        updateOnlineStatus(status.connected);
      });
      
      const listener = Network.addListener('networkStatusChange', (status) => {
        updateOnlineStatus(status.connected);
      });
      
      return () => {
        listener.then((callback) => callback.remove());
      };
    } else {
      // Web fallback using navigator.onLine
      updateOnlineStatus(navigator.onLine);
      
      const handleOnline = () => updateOnlineStatus(true);
      const handleOffline = () => updateOnlineStatus(false);
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);
  
  return { isOnline, wasOffline };
}