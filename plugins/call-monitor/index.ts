import { registerPlugin } from '@capacitor/core';
import type { CallMonitorPlugin } from './definitions';

const CallMonitor = registerPlugin<CallMonitorPlugin>('CallMonitor', {
  web: () => import('./src/web').then(m => m.CallMonitor),
});

export * from './definitions';
export { CallMonitor };