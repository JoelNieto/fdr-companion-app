/** Custom event so outbox UI can react when IndexedDB changes. */
export const OUTBOX_CHANGED_EVENT = "outbox-changed";

export function notifyOutboxChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OUTBOX_CHANGED_EVENT));
  }
}
