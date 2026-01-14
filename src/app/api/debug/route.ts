/**
 * Debug API Endpoint
 * 
 * GET /api/debug - Detaylı debug bilgisi
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCachedNav, checkRedisHealth, getCacheMode } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  const debug: Record<string, any> = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      DATABASE_URL: process.env.DATABASE_URL ? '***SET***' : 'NOT SET',
      REDIS_URL: process.env.REDIS_URL ? '***SET***' : 'NOT SET',
    },
    database: {},
    redis: {},
    projects: [],
  };

  // Database
  try {
    const projectCount = await db.project.count();
    const userCount = await db.user.count();
    debug.database = {
      status: 'connected',
      projectCount,
      userCount,
    };
  } catch (error: any) {
    debug.database = {
      status: 'error',
      error: error.message,
    };
  }

  // Redis
  try {
    const cacheMode = getCacheMode();
    const redisOk = await checkRedisHealth();
    debug.redis = {
      mode: cacheMode.mode,
      enabled: cacheMode.enabled,
      status: redisOk ? 'connected' : 'disconnected',
    };
  } catch (error: any) {
    debug.redis = {
      status: 'error',
      error: error.message,
    };
  }

  // Projects with cache status
  try {
    const projects = await db.project.findMany({
      select: {
        slug: true,
        name: true,
        branch: true,
        customDomain: true,
        updatedAt: true,
      },
      take: 10,
    });

    for (const project of projects) {
      const nav = await getCachedNav(project.slug, project.branch);
      debug.projects.push({
        slug: project.slug,
        name: project.name,
        branch: project.branch,
        customDomain: project.customDomain,
        cached: nav !== null,
        cachedDocsCount: nav?.length || 0,
        updatedAt: project.updatedAt,
      });
    }
  } catch (error: any) {
    debug.projects = { error: error.message };
  }

  return NextResponse.json(debug, { status: 200 });
}
