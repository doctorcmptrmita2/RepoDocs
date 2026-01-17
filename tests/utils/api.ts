/**
 * API Test Utilities
 * 
 * HTTP client for API testing with timing measurement
 */

import { config } from '../config/test.config';

export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
}

export interface ApiResponse<T = unknown> {
  status: number;
  body: T;
  headers: Headers;
  responseTime: number;
  ok: boolean;
}

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || config.baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  withAuth(token: string): ApiClient {
    const client = new ApiClient(this.baseUrl);
    client.defaultHeaders = {
      ...this.defaultHeaders,
      'Authorization': `Bearer ${token}`,
      'Cookie': `next-auth.session-token=${token}`,
    };
    return client;
  }

  async get<T = unknown>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('GET', path, undefined, options);
  }

  async post<T = unknown>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, body, options);
  }

  async put<T = unknown>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', path, body, options);
  }

  async delete<T = unknown>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', path, undefined, options);
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${path}`;
    const startTime = performance.now();

    const response = await fetch(url, {
      method,
      headers: {
        ...this.defaultHeaders,
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: options?.timeout 
        ? AbortSignal.timeout(options.timeout) 
        : undefined,
    });

    const responseTime = performance.now() - startTime;

    let responseBody: T;
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      responseBody = await response.json() as T;
    } else {
      responseBody = await response.text() as unknown as T;
    }

    return {
      status: response.status,
      body: responseBody,
      headers: response.headers,
      responseTime,
      ok: response.ok,
    };
  }
}

// Singleton instance
export const api = new ApiClient();

// Type definitions for API responses
export interface HealthResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  services: {
    database: { status: string; latency?: number };
    redis: { status: string; latency?: number };
    app: { status: string };
  };
  responseTime: number;
}

export interface SearchResponse {
  results: SearchResult[];
}

export interface SearchResult {
  title: string;
  description?: string;
  slug: string;
  path: string;
  snippet: string;
}

export interface ProjectResponse {
  id: string;
  name: string;
  slug: string;
  repoFullName: string;
  branch: string;
  docsPath: string;
  customDomain?: string;
}

export interface ErrorResponse {
  error: string;
  message?: string;
}
