/**
 * Shared connectivity state.
 *
 * Real offline (DevTools Network Offline, iOS airplane mode) is unreliable if we
 * only trust a one-shot listener setup — so we:
 * 1. Attach window online/offline listeners synchronously (DevTools)
 * 2. Poll navigator.onLine on web as a backup
 * 3. On native, also use @capacitor/network + re-check on app resume and poll
 * 4. Expose refreshOnlineStatus() for mutations to re-query at invoke time
 */

type Listener = () => void;

type NetworkStatus = { connected: boolean };

let isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
/** Increments on each offline → online transition (drives outbox replay). */
let reconnectGeneration = 0;
let started = false;
let nativeMode = false;
/** When set, overrides real network for local testing. */
let simulatedOffline: boolean | null = null;

let networkGetStatus: (() => Promise<NetworkStatus>) | null = null;

const listeners = new Set<Listener>();

function effectiveOnline(): boolean {
  if (simulatedOffline === true) return false;
  if (simulatedOffline === false) return true;
  return isOnline;
}

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function applyNetworkOnline(online: boolean) {
  const prev = effectiveOnline();
  isOnline = online;
  const next = effectiveOnline();

  if (next && !prev) {
    reconnectGeneration += 1;
  }

  if (next !== prev) {
    emit();
  }
}

function attachWindowListeners() {
  window.addEventListener("online", () => {
    if (simulatedOffline !== null) return;
    // On native, Network plugin is authoritative; still record window signal as offline-only
    if (nativeMode) {
      if (!navigator.onLine) applyNetworkOnline(false);
      return;
    }
    applyNetworkOnline(true);
  });
  window.addEventListener("offline", () => {
    if (simulatedOffline !== null) return;
    applyNetworkOnline(false);
  });
}

async function setupNativeNetwork() {
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (!Capacitor.isNativePlatform()) return;

    const { Network } = await import("@capacitor/network");
    const { App } = await import("@capacitor/app");

    nativeMode = true;
    networkGetStatus = () => Network.getStatus();

    const status = await Network.getStatus();
    if (simulatedOffline === null) {
      applyNetworkOnline(status.connected);
    }

    await Network.addListener("networkStatusChange", (s) => {
      if (simulatedOffline !== null) return;
      applyNetworkOnline(s.connected);
    });

    // iOS often delivers path updates when returning to foreground
    await App.addListener("appStateChange", ({ isActive }) => {
      if (isActive) {
        void refreshOnlineStatus();
      }
    });

    // Poll — airplane mode toggles are sometimes missed by the plugin alone
    window.setInterval(() => {
      void refreshOnlineStatus();
    }, 2000);
  } catch {
    // Stay on window listeners / navigator.onLine
  }
}

export function startOnlineStatusListening(): void {
  if (started || typeof window === "undefined") return;
  started = true;

  // Critical: sync listeners before any async Capacitor work so DevTools Offline works
  attachWindowListeners();
  applyNetworkOnline(navigator.onLine);

  // Only push toward offline from navigator — never auto-promote to online.
  // DevTools Offline often fires `offline` while leaving navigator.onLine === true;
  // promoting from a poll would immediately undo the event.
  window.setInterval(() => {
    if (simulatedOffline !== null || nativeMode) return;
    if (!navigator.onLine) {
      applyNetworkOnline(false);
    }
  }, 1000);

  void setupNativeNetwork();
}

export function getIsOnline(): boolean {
  startOnlineStatusListening();

  if (simulatedOffline === true) return false;
  if (simulatedOffline === false) return true;

  // Mirror refreshOnlineStatus sync rules for mutation onMutate
  if (!isOnline) return false;
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    applyNetworkOnline(false);
    return false;
  }
  return true;
}

/** Pure snapshot for useSyncExternalStore — no side effects. */
export function getOnlineSnapshot(): boolean {
  return effectiveOnline();
}

/**
 * Re-query connectivity. Call before offline-capable mutations so we don't
 * rely solely on possibly-missed change events.
 *
 * Chrome DevTools "Offline" may fire `offline` while leaving navigator.onLine
 * true. Once we have observed offline, stay offline until an `online` event
 * (or native Network plugin) says otherwise.
 */
export async function refreshOnlineStatus(): Promise<boolean> {
  startOnlineStatusListening();

  if (simulatedOffline === true) return false;
  if (simulatedOffline === false) return true;

  if (nativeMode && networkGetStatus) {
    try {
      const status = await Promise.race([
        networkGetStatus(),
        new Promise<NetworkStatus>((_, reject) => {
          window.setTimeout(() => reject(new Error("Network.getStatus timeout")), 1500);
        }),
      ]);
      applyNetworkOnline(status.connected);
      return effectiveOnline();
    } catch {
      // Fall through to cached / navigator signals
    }
  }

  // Already offline from an event — trust that over a stale navigator.onLine
  if (!isOnline) {
    return false;
  }

  // Cache says online; navigator may still reveal DevTools/WebView offline
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    applyNetworkOnline(false);
    return false;
  }

  return true;
}

/** @internal test helper */
export function getOnlineStatusDebug() {
  return {
    isOnline,
    effectiveOnline: effectiveOnline(),
    simulatedOffline,
    nativeMode,
    navigatorOnLine: typeof navigator !== "undefined" ? navigator.onLine : null,
    reconnectGeneration,
  };
}

export function getReconnectGeneration(): number {
  return reconnectGeneration;
}

/** Dev/test helper — null clears the override. */
export function setSimulatedOffline(offline: boolean | null): void {
  startOnlineStatusListening();
  const prev = effectiveOnline();
  simulatedOffline = offline;
  const next = effectiveOnline();
  if (next && !prev) {
    reconnectGeneration += 1;
  }
  if (next !== prev) {
    emit();
  }
}

export function getSimulatedOffline(): boolean {
  return simulatedOffline === true;
}

export function subscribeOnlineStatus(listener: Listener): () => void {
  startOnlineStatusListening();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
