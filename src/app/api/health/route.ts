/**
 * Health Check API Endpoint
 * 
 * GET /api/health - Tüm servislerin durumunu kontrol eder
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkRedisHealth } from '@/lib/cache';

export const dynamic = 'force-dynamic';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  services: {
    database: ServiceStatus;
    redis: ServiceStatus;
    app: ServiceStatus;
  };
  responseTime: number;
}

interface ServiceStatus {
  status: 'up' | 'down';
  latency?: number;
  error?: string;
}

export async function GET() {
  const startTime = Date.now();
  
  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: { status: 'down' },
      redis: { status: 'down' },
      app: { status: 'up' },
    },
    responseTime: 0,
  };

  // Database check
  try {
    const dbStart = Date.now();
    await db.$queryRaw`SELECT 1`;
    health.services.database = {
      status: 'up',
      latency: Date.now() - dbStart,
    };
  } catch (error: any) {
    health.services.database = {
      status: 'down',
      error: error.message,
    };
    health.status = 'unhealthy';
  }

  // Redis check
  try {
    const redisStart = Date.now();
    const redisOk = await checkRedisHealth();
    health.services.redis = {
      status: redisOk ? 'up' : 'down',
      latency: Date.now() - redisStart,
    };
    if (!redisOk) {
      health.status = health.status === 'unhealthy' ? 'unhealthy' : 'degraded';
    }
  } catch (error: any) {
    health.services.redis = {
      status: 'down',
      error: error.message,
    };
    health.status = health.status === 'unhealthy' ? 'unhealthy' : 'degraded';
  }

  health.responseTime = Date.now() - startTime;

  const statusCode = health.status === 'healthy' ? 200 : 
                     health.status === 'degraded' ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}
