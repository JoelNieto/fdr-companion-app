import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

export interface SecureStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

export function createSecureStore(): SecureStore {
  if (typeof window === 'undefined') {
    // Server-side: return noop implementation
    return {
      get: async () => null,
      set: async () => {},
      remove: async () => {},
      clear: async () => {},
    };
  }
  
  if (Capacitor.isNativePlatform()) {
    return new NativeSecureStore();
  }
  
  return new WebSecureStore();
}

class WebSecureStore implements SecureStore {
  async get(key: string): Promise<string | null> {
    return localStorage.getItem(key);
  }
  
  async set(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
  }
  
  async remove(key: string): Promise<void> {
    localStorage.removeItem(key);
  }
  
  async clear(): Promise<void> {
    localStorage.clear();
  }
}

class NativeSecureStore implements SecureStore {
  async get(key: string): Promise<string | null> {
    const result = await Preferences.get({ key });
    return result.value ?? null;
  }
  
  async set(key: string, value: string): Promise<void> {
    await Preferences.set({ key, value });
  }
  
  async remove(key: string): Promise<void> {
    await Preferences.remove({ key });
  }
  
  async clear(): Promise<void> {
    await Preferences.clear();
  }
}