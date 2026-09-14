import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    return createQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = createQueryClient();
    setupPersistence(browserQueryClient);
  }
  return browserQueryClient;
}

function setupPersistence(queryClient: QueryClient): void {
  if (typeof window === 'undefined') return;

  const persister = createSyncStoragePersister({
    storage: window.localStorage,
  });

  persistQueryClient({
    queryClient,
    persister,
    maxAge: 1000 * 60 * 60 * 24,
    buster: 'v1',
  });
}

export const queryClient = getQueryClient();