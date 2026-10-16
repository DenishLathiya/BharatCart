const cache = new Map();

// Cache middleware — caches GET responses in memory
const cacheResponse = (duration = 60) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") return next();

    const key = `${req.originalUrl}`;
    const cached = cache.get(key);

    if (cached && Date.now() - cached.timestamp < duration * 1000) {
      return res.json(cached.data);
    }

    // Override res.json to capture and cache the response
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      cache.set(key, { data, timestamp: Date.now() });
      return originalJson(data);
    };

    next();
  };
};

// Clear specific cache entry
const clearCache = (pattern) => {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) cache.delete(key);
  }
};

// Clear all cache
const clearAllCache = () => cache.clear();

// Cache stats
const getCacheStats = () => ({
  size:  cache.size,
  keys:  Array.from(cache.keys()),
});

module.exports = { cacheResponse, clearCache, clearAllCache, getCacheStats };