// API Response Cache Utility
// Provides caching for admin API calls to reduce server load and improve performance

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class APICache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL

  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: {
      ttl?: number;
      forceRefresh?: boolean;
    }
  ): Promise<T> {
    const ttl = options?.ttl || this.defaultTTL;
    const now = Date.now();

    // Check cache (unless force refresh)
    if (!options?.forceRefresh) {
      const cached = this.cache.get(key);
      if (cached && (now - cached.timestamp) < cached.ttl) {
        return cached.data;
      }
    }

    // Fetch fresh data
    try {
      const data = await fetcher();
      
      // Store in cache
      this.cache.set(key, {
        data,
        timestamp: now,
        ttl,
      });

      return data;
    } catch (error) {
      // On error, return stale cache if available
      const cached = this.cache.get(key);
      if (cached) {
        console.warn(`[Cache] Using stale data for key: ${key}`);
        return cached.data;
      }
      
      throw error;
    }
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: RegExp): void {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  // Clean up expired entries
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if ((now - entry.timestamp) >= entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }
}

// Singleton instance
export const apiCache = new APICache();

// Auto-cleanup every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    const cleaned = apiCache.cleanup();
    if (cleaned > 0) {
      console.log(`[Cache] Cleaned up ${cleaned} expired entries`);
    }
  }, 10 * 60 * 1000);
}

// Predefined cache keys for common admin endpoints
export const CACHE_KEYS = {
  DASHBOARD_STATS: 'admin:dashboard:stats',
  USERS_LIST: 'admin:users:list',
  COMPANIES_LIST: 'admin:companies:list',
  CERTIFICATIONS_PENDING: 'admin:certifications:pending',
  CERTIFICATIONS_STATS: 'admin:certifications:stats',
  LOGS_LIST: 'admin:logs:list',
} as const;

// Helper function for fetching with caching
export async function fetchWithCache<T>(
  cacheKey: string,
  url: string,
  options?: RequestInit & {
    ttl?: number;
    forceRefresh?: boolean;
  }
): Promise<T> {
  const token = localStorage.getItem('auth_token');
  
  return apiCache.get<T>(cacheKey, async () => {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    return response.json();
  }, {
    ttl: options?.ttl,
    forceRefresh: options?.forceRefresh,
  });
}

export default apiCache;
