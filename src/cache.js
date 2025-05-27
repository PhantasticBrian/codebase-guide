import crypto from "crypto";
import { CONFIG } from "./config.js";

const cache = new Map();

export function generateCacheKey(...args) {
  const data = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join('|');
  return crypto.createHash('md5').update(data).digest('hex');
}

export function getCacheEntry(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

export function setCacheEntry(key, data, ttl = CONFIG.CACHE_TTL) {
  cache.set(key, {
    data,
    expiry: Date.now() + ttl
  });
}

export function clearCache() {
  cache.clear();
}