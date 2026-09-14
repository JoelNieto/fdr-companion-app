export interface CallMonitorPlugin {
  startCall(options: { phoneNumber: string }): Promise<void>;
  addListener(eventName: 'callState', listenerFunc: (state: CallState) => void): Promise<CallbackID>;
  removeAllListeners(): Promise<void>;
}

export type CallState = { state: 'started' | 'ended' | 'failed'; phoneNumber?: string };

export type CallbackID = string;