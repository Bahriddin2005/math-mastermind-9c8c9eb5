import { useState, useEffect, useCallback } from 'react';

interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface UseOfflineCacheOptions {
  key: string;
  ttl?: number; // Time to live in milliseconds (default: 5 minutes)
}

export const useOfflineCache = <T>({ key, ttl = 5 * 60 * 1000 }: UseOfflineCacheOptions) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedData, setCachedData] = useState<T | null>(null);
  const [isCached, setIsCached] = useState(false);

  // Listen for online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load cached data on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`cache_${key}`);
      if (stored) {
        const parsed: CachedData<T> = JSON.parse(stored);
        const now = Date.now();
        
        // Check if cache is still valid
        if (parsed.expiresAt > now) {
          setCachedData(parsed.data);
          setIsCached(true);
        } else {
          // Remove expired cache
          localStorage.removeItem(`cache_${key}`);
        }
      }
    } catch (error) {
      console.error('Error loading cache:', error);
    }
  }, [key]);

  // Save data to cache
  const saveToCache = useCallback((data: T) => {
    try {
      const cacheEntry: CachedData<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl
      };
      localStorage.setItem(`cache_${key}`, JSON.stringify(cacheEntry));
      setCachedData(data);
      setIsCached(true);
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }, [key, ttl]);

  // Clear cache
  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(`cache_${key}`);
      setCachedData(null);
      setIsCached(false);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }, [key]);

  // Get cached data or fetch new
  const getDataWithCache = useCallback(async (
    fetchFn: () => Promise<T>
  ): Promise<T | null> => {
    // If offline, return cached data
    if (!isOnline) {
      console.log('Offline mode: returning cached data');
      return cachedData;
    }

    try {
      const freshData = await fetchFn();
      saveToCache(freshData);
      return freshData;
    } catch (error) {
      console.error('Fetch error, returning cached data:', error);
      return cachedData;
    }
  }, [isOnline, cachedData, saveToCache]);

  return {
    isOnline,
    isCached,
    cachedData,
    saveToCache,
    clearCache,
    getDataWithCache
  };
};

// Hook for caching user profile
export const useOfflineProfile = () => {
  return useOfflineCache({
    key: 'user_profile',
    ttl: 10 * 60 * 1000 // 10 minutes
  });
};

// Hook for caching game sessions
export const useOfflineGameSessions = () => {
  return useOfflineCache({
    key: 'game_sessions',
    ttl: 5 * 60 * 1000 // 5 minutes
  });
};

// Hook for caching courses
export const useOfflineCourses = () => {
  return useOfflineCache({
    key: 'courses',
    ttl: 30 * 60 * 1000 // 30 minutes
  });
};
