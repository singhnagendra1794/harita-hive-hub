import { useCallback, useEffect, useState } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class InMemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 100;

  set<T>(key: string, data: T, ttl: number = 300000): void { // 5 minutes default
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
}

const globalCache = new InMemoryCache();

export const useQueryCache = <T>(
  queryKey: string,
  queryFn: () => Promise<T>,
  options: {
    staleTime?: number;
    cacheTime?: number;
    enabled?: boolean;
  } = {}
) => {
  const { staleTime = 300000, cacheTime = 600000, enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    // Check cache first
    const cachedData = globalCache.get<T>(queryKey);
    if (cachedData) {
      setData(cachedData);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await queryFn();
      globalCache.set(queryKey, result, cacheTime);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [queryKey, queryFn, enabled, cacheTime]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    globalCache.clear(); // Clear cache for fresh data
    return fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch };
};

export { globalCache };