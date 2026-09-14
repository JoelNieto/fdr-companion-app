import { registerPlugin } from '@capacitor/core';
import type { CallMonitorPlugin, CallState, CallbackID } from './definitions';

const CallMonitor = registerPlugin<CallMonitorPlugin>('CallMonitor', {
  web: () => import('./src/web').then(m => m.CallMonitor),
});

export type { CallMonitorPlugin, CallState, CallbackID };
export { CallMonitor };