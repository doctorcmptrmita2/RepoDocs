/**
 * Application Logger
 * 
 * Tüm işlemleri loglar ve database'e kaydeder.
 */

import { db } from '@/lib/db';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
export type LogCategory = 
  | 'AUTH' 
  | 'CACHE' 
  | 'DATABASE' 
  | 'GITHUB' 
  | 'WEBHOOK' 
  | 'DOMAIN' 
  | 'API' 
  | 'PAGE' 
  | 'SYSTEM';

interface LogEntry {
  level: LogLevel;
  category: LogCategory;
  message: string;
  details?: Record<string, any>;
  projectId?: string;
  userId?: string;
  duration?: number;
  error?: string;
}

// In-memory log buffer (son 1000 log)
const logBuffer: Array<LogEntry & { timestamp: Date; id: string }> = [];
const MAX_BUFFER_SIZE = 1000;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function log(entry: LogEntry): Promise<void> {
  const timestamp = new Date();
  const id = generateId();
  
  // Console'a yaz
  const prefix = `[${timestamp.toISOString()}] [${entry.level}] [${entry.category}]`;
  const msg = `${prefix} ${entry.message}`;
  
  switch (entry.level) {
    case 'ERROR':
      console.error(msg, entry.details || '', entry.error || '');
      break;
    case 'WARN':
      console.warn(msg, entry.details || '');
      break;
    case 'DEBUG':
      console.debug(msg, entry.details || '');
      break;
    default:
      console.log(msg, entry.details || '');
  }
  
  // Buffer'a ekle
  logBuffer.unshift({ ...entry, timestamp, id });
  if (logBuffer.length > MAX_BUFFER_SIZE) {
    logBuffer.pop();
  }
  
  // Database'e kaydet (async, hata olursa sessizce geç)
  try {
    await db.systemLog.create({
      data: {
        level: entry.level,
        category: entry.category,
        message: entry.message,
        details: entry.details ? JSON.stringify(entry.details) : null,
        projectId: entry.projectId,
        userId: entry.userId,
        duration: entry.duration,
        error: entry.error,
      },
    });
  } catch (err) {
    // Database hatası olursa sessizce geç
    console.error('Failed to save log to database:', err);
  }
}

// Shorthand functions
export const logger = {
  debug: (category: LogCategory, message: string, details?: Record<string, any>) =>
    log({ level: 'DEBUG', category, message, details }),
    
  info: (category: LogCategory, message: string, details?: Record<string, any>) =>
    log({ level: 'INFO', category, message, details }),
    
  warn: (category: LogCategory, message: string, details?: Record<string, any>) =>
    log({ level: 'WARN', category, message, details }),
    
  error: (category: LogCategory, message: string, error?: Error | string, details?: Record<string, any>) =>
    log({ 
      level: 'ERROR', 
      category, 
      message, 
      details,
      error: error instanceof Error ? error.message : error,
    }),
    
  // Timed operation
  async timed<T>(
    category: LogCategory, 
    message: string, 
    operation: () => Promise<T>,
    details?: Record<string, any>
  ): Promise<T> {
    const start = Date.now();
    try {
      const result = await operation();
      const duration = Date.now() - start;
      await log({ level: 'INFO', category, message: `${message} (${duration}ms)`, details, duration });
      return result;
    } catch (err) {
      const duration = Date.now() - start;
      await log({ 
        level: 'ERROR', 
        category, 
        message: `${message} FAILED (${duration}ms)`, 
        details,
        duration,
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  },
};

// Get logs from buffer
export function getRecentLogs(limit: number = 100): Array<LogEntry & { timestamp: Date; id: string }> {
  return logBuffer.slice(0, limit);
}

// Get logs from database
export async function getLogsFromDb(options: {
  limit?: number;
  level?: LogLevel;
  category?: LogCategory;
  projectId?: string;
  since?: Date;
}): Promise<any[]> {
  const { limit = 100, level, category, projectId, since } = options;
  
  try {
    return await db.systemLog.findMany({
      where: {
        ...(level && { level }),
        ...(category && { category }),
        ...(projectId && { projectId }),
        ...(since && { createdAt: { gte: since } }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  } catch (err) {
    console.error('Failed to fetch logs from database:', err);
    return [];
  }
}
