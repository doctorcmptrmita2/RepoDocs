/**
 * Logs API Endpoint
 * 
 * GET /api/logs - Son logları getir
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getRecentLogs, getLogsFromDb, LogLevel, LogCategory } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Auth check - sadece login olmuş kullanıcılar görebilir
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const source = searchParams.get('source') || 'memory'; // memory veya db
  const limit = parseInt(searchParams.get('limit') || '100');
  const level = searchParams.get('level') as LogLevel | null;
  const category = searchParams.get('category') as LogCategory | null;
  const projectId = searchParams.get('projectId');
  const since = searchParams.get('since');

  if (source === 'db') {
    const logs = await getLogsFromDb({
      limit,
      level: level || undefined,
      category: category || undefined,
      projectId: projectId || undefined,
      since: since ? new Date(since) : undefined,
    });
    return NextResponse.json({ source: 'database', count: logs.length, logs });
  }

  // Memory logs
  let logs = getRecentLogs(limit);
  
  // Filter
  if (level) {
    logs = logs.filter(l => l.level === level);
  }
  if (category) {
    logs = logs.filter(l => l.category === category);
  }
  if (projectId) {
    logs = logs.filter(l => l.projectId === projectId);
  }

  return NextResponse.json({ source: 'memory', count: logs.length, logs });
}
