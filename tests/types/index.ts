/**
 * Test Type Definitions
 */

export interface PricingPlan {
  name: string;
  price: string;
  features: string[];
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  repoFullName: string;
  branch: string;
  docsPath: string;
  customDomain?: string;
}

export interface NavItem {
  title: string;
  slug: string;
  path: string;
  order?: number;
  icon?: string;
  children?: NavItem[];
}

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  services: {
    database: ServiceStatus;
    redis: ServiceStatus;
    app: ServiceStatus;
  };
  responseTime: number;
}

export interface ServiceStatus {
  status: 'up' | 'down' | 'degraded';
  latency?: number;
  error?: string;
}

export interface SearchResult {
  title: string;
  description?: string;
  slug: string;
  path: string;
  snippet: string;
}

export interface ApiError {
  error: string;
  message?: string;
  status?: number;
}
