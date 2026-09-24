/**
 * API In-Memory Cache & Request Deduplication Utility
 * - Prevents duplicate concurrent fetches for identical endpoints (e.g. Navbar + Home fetching categories simultaneously)
 * - Caches GET responses in memory with configurable TTL (default: 60 seconds)
 * - Zero external dependencies, ultra-lightweight, and fully production-safe
 */

const cache = new Map();
const inFlightRequests = new Map();

export async function cachedFetch(url, options = {}, ttlMs = 60000) {
  const method = (options.method || 'GET').toUpperCase();
  
  // Only cache GET requests
  if (method !== 'GET') {
    return fetch(url, options).then(async (res) => {
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Request failed with status ${res.status}`);
      }
      return res.json();
    });
  }

  const cacheKey = url;
  const now = Date.now();

  // Check valid cache entry
  if (cache.has(cacheKey)) {
    const entry = cache.get(cacheKey);
    if (now - entry.timestamp < (entry.ttl || ttlMs)) {
      return entry.data;
    } else {
      cache.delete(cacheKey);
    }
  }

  // Deduplicate in-flight concurrent requests
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  const fetchPromise = (async () => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Request failed with status ${response.status}`);
      }
      const data = await response.json();
      cache.set(cacheKey, { data, timestamp: Date.now(), ttl: ttlMs });
      return data;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
}

export function invalidateApiCache(prefix = '') {
  if (!prefix) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(prefix)) {
      cache.delete(key);
    }
  }
}

export function clearApiCache() {
  cache.clear();
}
