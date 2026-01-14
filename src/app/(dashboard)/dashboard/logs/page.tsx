'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Filter, AlertCircle, Info, AlertTriangle, Bug } from 'lucide-react';

interface LogEntry {
  id: string;
  level: string;
  category: string;
  message: string;
  details?: string;
  projectId?: string;
  duration?: number;
  error?: string;
  timestamp: string;
  createdAt?: string;
}

const LEVELS = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
const CATEGORIES = ['AUTH', 'CACHE', 'DATABASE', 'GITHUB', 'WEBHOOK', 'DOMAIN', 'API', 'PAGE', 'SYSTEM'];

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [source, setSource] = useState<'memory' | 'db'>('memory');
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams();
      params.set('source', source);
      params.set('limit', '200');
      if (levelFilter) params.set('level', levelFilter);
      if (categoryFilter) params.set('category', categoryFilter);

      const res = await fetch(`/api/logs?${params}`);
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [source, levelFilter, categoryFilter]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchLogs, 3000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, source, levelFilter, categoryFilter]);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'ERROR': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'WARN': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'DEBUG': return <Bug className="w-4 h-4 text-gray-400" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'bg-red-50 border-red-200 text-red-800';
      case 'WARN': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'DEBUG': return 'bg-gray-50 border-gray-200 text-gray-600';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3 
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">System Logs</h1>
        
        <div className="flex items-center gap-4">
          {/* Auto Refresh Toggle */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto-refresh (3s)
          </label>

          {/* Manual Refresh */}
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
        <Filter className="w-5 h-5 text-slate-400" />
        
        {/* Source */}
        <select
          value={source}
          onChange={(e) => setSource(e.target.value as 'memory' | 'db')}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="memory">Memory (Real-time)</option>
          <option value="db">Database (Persistent)</option>
        </select>

        {/* Level Filter */}
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="">All Levels</option>
          {LEVELS.map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <span className="text-sm text-slate-500 ml-auto">
          {logs.length} logs
        </span>
      </div>

      {/* Logs Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Time</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Level</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Category</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Message</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                      {formatTime(log.timestamp || log.createdAt || '')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getLevelColor(log.level)}`}>
                        {getLevelIcon(log.level)}
                        {log.level}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium">
                        {log.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-xl">
                        <p className="truncate">{log.message}</p>
                        {log.error && (
                          <p className="text-red-500 text-xs mt-1 truncate">
                            Error: {log.error}
                          </p>
                        )}
                        {log.details && (
                          <details className="mt-1">
                            <summary className="text-xs text-slate-400 cursor-pointer">
                              Details
                            </summary>
                            <pre className="text-xs bg-slate-100 p-2 rounded mt-1 overflow-auto max-h-32">
                              {typeof log.details === 'string' 
                                ? log.details 
                                : JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {log.duration ? `${log.duration}ms` : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
