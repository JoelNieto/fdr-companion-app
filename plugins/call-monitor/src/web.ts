import { Capacitor } from "@capacitor/core";
import type { CallMonitorPlugin, CallState, CallbackID } from "../definitions";

const webImplementation: CallMonitorPlugin = {
  async startCall(options: { phoneNumber: string }) {
    if (Capacitor.isNativePlatform()) {
      return;
    }
    window.location.href = `tel:${options.phoneNumber}`;

    // Simulate call ended event when window regains focus
    const handleFocus = () => {
      window.removeEventListener("focus", handleFocus);
      setTimeout(() => {
        // Emit simulated ended event
        const event = new CustomEvent("capacitorCallState", {
          detail: {
            state: "ended",
            phoneNumber: options.phoneNumber,
          } as CallState,
        });
        window.dispatchEvent(event);
      }, 1000);
    };
    window.addEventListener("focus", handleFocus);
  },

  async addListener(
    event: "callState",
    callback: (state: CallState) => void,
  ): Promise<CallbackID> {
    if (Capacitor.isNativePlatform()) {
      return "" as CallbackID;
    }

    const handler = (e: CustomEvent<CallState>) => {
      if (e.detail) {
        callback(e.detail);
      }
    };

    window.addEventListener("capacitorCallState", handler as EventListener);

    const callbackId = `web-${Date.now()}`;

    // Store callback for removal
    (window as any).__callMonitorCallbacks =
      (window as any).__callMonitorCallbacks || new Map();
    (window as any).__callMonitorCallbacks.set(callbackId, handler);

    return callbackId;
  },

  async removeAllListeners(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      return;
    }

    const callbacks = (window as any).__callMonitorCallbacks;
    if (callbacks) {
      callbacks.forEach((handler: EventListener) => {
        window.removeEventListener("capacitorCallState", handler);
      });
      callbacks.clear();
    }
  },
};

export const CallMonitor = webImplementation;
