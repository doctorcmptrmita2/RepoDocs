/**
 * Cache Layer - Redis or In-Memory
 * 
 * Redis varsa Redis kullanır, yoksa in-memory cache kullanır.
 * REDIS_URL environment variable'ı ile kontrol edilir.
 * 
 * Cache Strategy:
 * - Write: On GitHub webhook (push event)
 * - Read: On every page visit (<10ms response)
 * - Invalidate: On webhook or manual refresh
 */

import type { ParsedDoc, NavItem, CachedProject, VersionsCache } from '@/types';
import { getProjectCacheKey, getDocCacheKey, getNavCacheKey, getVersionsCacheKey } from '@/lib/utils';

// ==================== CACHE MODE DETECTION ====================

const REDIS_ENABLED = !!process.env.REDIS_URL && process.env.REDIS_URL !== 'disabled';

// ==================== IN-MEMORY CACHE ====================

const memoryCache = new Map<string, { data: string; expiry: number }>();

function memoryGet(key: string): string | null {
  const item = memoryCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    memoryCache.delete(key);
    return null;
  }
  return item.data;
}

function memorySet(key: string, value: string, ttlSeconds: number): void {
  memoryCache.set(key, {
    data: value,
    expiry: Date.now() + ttlSeconds * 1000,
  });
}

function memoryDel(...keys: string[]): void {
  keys.forEach(key => memoryCache.delete(key));
}

function memoryExists(key: string): boolean {
  const item = memoryCache.get(key);
  if (!item) return false;
  if (Date.now() > item.expiry) {
    memoryCache.delete(key);
    return false;
  }
  return true;
}

// ==================== REDIS CLIENT ====================

let redisClient: any = null;

async function getRedis() {
  if (!REDIS_ENABLED) return null;
  
  if (!redisClient) {
    const Redis = (await import('ioredis')).default;
    const redisUrl = process.env.REDIS_URL!;
    
    let host = 'localhost';
    let port = 6379;
    let password: string | undefined;
    
    try {
      const url = new URL(redisUrl);
      host = url.hostname;
      port = parseInt(url.port) || 6379;
      password = url.password || undefined;
    } catch {
      console.error('Failed to parse REDIS_URL, using defaults');
    }
    
    console.log(`Connecting to Redis at ${host}:${port}`);
    
    redisClient = new Redis({
      host,
      port,
      password,
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        if (times > 3) return null; // Stop retrying
        return Math.min(times * 200, 2000);
      },
      connectTimeout: 5000,
      lazyConnect: true,
    });
    
    redisClient.on('error', (err: Error) => {
      console.error('Redis error:', err.message);
    });
    
    redisClient.on('ready', () => {
      console.log('Redis ready');
    });
    
    try {
      await redisClient.connect();
    } catch (err) {
      console.error('Redis connection failed, falling back to memory cache');
      redisClient = null;
    }
  }
  
  return redisClient;
}

// ==================== UNIFIED CACHE INTERFACE ====================

const CACHE_TTL = 60 * 60 * 24 * 7; // 7 days
const VERSIONS_CACHE_TTL = 60 * 60; // 1 hour

async function cacheGet(key: string): Promise<string | null> {
  if (REDIS_ENABLED) {
    try {
      const redis = await getRedis();
      if (redis) {
        return await redis.get(key);
      }
    } catch (err) {
      console.error('Redis get error:', err);
    }
  }
  return memoryGet(key);
}

async function cacheSet(key: string, value: string, ttl: number = CACHE_TTL): Promise<void> {
  if (REDIS_ENABLED) {
    try {
      const redis = await getRedis();
      if (redis) {
        await redis.setex(key, ttl, value);
        return;
      }
    } catch (err) {
      console.error('Redis set error:', err);
    }
  }
  memorySet(key, value, ttl);
}

async function cacheDel(...keys: string[]): Promise<void> {
  if (REDIS_ENABLED) {
    try {
      const redis = await getRedis();
      if (redis && keys.length > 0) {
        await redis.del(...keys);
        return;
      }
    } catch (err) {
      console.error('Redis del error:', err);
    }
  }
  memoryDel(...keys);
}

async function cacheExists(key: string): Promise<boolean> {
  if (REDIS_ENABLED) {
    try {
      const redis = await getRedis();
      if (redis) {
        return (await redis.exists(key)) === 1;
      }
    } catch (err) {
      console.error('Redis exists error:', err);
    }
  }
  return memoryExists(key);
}

// ==================== PUBLIC API ====================

/**
 * Cache entire project data (nav + all docs)
 */
export async function cacheProject(
  projectSlug: string,
  version: string,
  nav: NavItem[],
  docs: Record<string, ParsedDoc>
): Promise<void> {
  const cached: CachedProject = {
    projectId: projectSlug,
    version,
    nav,
    docs,
    updatedAt: new Date().toISOString(),
  };

  // Cache full project
  await cacheSet(getProjectCacheKey(projectSlug, version), JSON.stringify(cached));
  
  // Cache nav separately for quick access
  await cacheSet(getNavCacheKey(projectSlug, version), JSON.stringify(nav));
  
  // Cache individual docs for granular access
  for (const [slug, doc] of Object.entries(docs)) {
    await cacheSet(getDocCacheKey(projectSlug, version, slug), JSON.stringify(doc));
  }
}

/**
 * Get cached project data
 */
export async function getCachedProject(
  projectSlug: string,
  version: string
): Promise<CachedProject | null> {
  const data = await cacheGet(getProjectCacheKey(projectSlug, version));
  return data ? JSON.parse(data) : null;
}

/**
 * Get cached navigation
 */
export async function getCachedNav(
  projectSlug: string,
  version: string
): Promise<NavItem[] | null> {
  const data = await cacheGet(getNavCacheKey(projectSlug, version));
  return data ? JSON.parse(data) : null;
}

/**
 * Get single cached document
 */
export async function getCachedDoc(
  projectSlug: string,
  version: string,
  docSlug: string
): Promise<ParsedDoc | null> {
  const data = await cacheGet(getDocCacheKey(projectSlug, version, docSlug));
  return data ? JSON.parse(data) : null;
}

/**
 * Invalidate all cache for a project version
 */
export async function invalidateProjectCache(
  projectSlug: string,
  version: string
): Promise<void> {
  const project = await getCachedProject(projectSlug, version);
  
  const keysToDelete = [
    getProjectCacheKey(projectSlug, version),
    getNavCacheKey(projectSlug, version),
  ];
  
  if (project) {
    for (const slug of Object.keys(project.docs)) {
      keysToDelete.push(getDocCacheKey(projectSlug, version, slug));
    }
  }
  
  await cacheDel(...keysToDelete);
}

/**
 * Check if project is cached
 */
export async function isProjectCached(
  projectSlug: string,
  version: string
): Promise<boolean> {
  return cacheExists(getProjectCacheKey(projectSlug, version));
}

/**
 * Get cache stats for dashboard
 */
export async function getCacheStats(projectSlug: string): Promise<{
  versions: string[];
  totalDocs: number;
  lastUpdated: string | null;
}> {
  const mainProject = await getCachedProject(projectSlug, 'main');
  
  return {
    versions: mainProject ? [mainProject.version] : [],
    totalDocs: mainProject ? Object.keys(mainProject.docs).length : 0,
    lastUpdated: mainProject?.updatedAt || null,
  };
}

/**
 * Health check for cache
 */
export async function checkRedisHealth(): Promise<boolean> {
  if (!REDIS_ENABLED) {
    return true; // Memory cache is always "healthy"
  }
  
  try {
    const redis = await getRedis();
    if (redis) {
      const pong = await redis.ping();
      return pong === 'PONG';
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Get cache mode info
 */
export function getCacheMode(): { mode: 'redis' | 'memory'; enabled: boolean } {
  return {
    mode: REDIS_ENABLED ? 'redis' : 'memory',
    enabled: REDIS_ENABLED,
  };
}

/**
 * Cache project versions (branches + tags)
 */
export async function cacheVersions(
  projectSlug: string,
  versions: VersionsCache
): Promise<void> {
  await cacheSet(getVersionsCacheKey(projectSlug), JSON.stringify(versions), VERSIONS_CACHE_TTL);
}

/**
 * Get cached versions
 */
export async function getCachedVersions(
  projectSlug: string
): Promise<VersionsCache | null> {
  const data = await cacheGet(getVersionsCacheKey(projectSlug));
  return data ? JSON.parse(data) : null;
}

/**
 * Invalidate versions cache
 */
export async function invalidateVersionsCache(
  projectSlug: string
): Promise<void> {
  await cacheDel(getVersionsCacheKey(projectSlug));
}
