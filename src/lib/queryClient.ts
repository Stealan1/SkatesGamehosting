import { QueryClient, type DefaultOptions } from '@tanstack/react-query';
import { showToast } from '../utils/toast';

const queryConfig: DefaultOptions = {
  queries: {
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  },
  mutations: {
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'An error occurred';
      showToast.error(message);
    },
  },
};

export const queryClient = new QueryClient({ defaultOptions: queryConfig });
