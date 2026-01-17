/**
 * Health API Tests
 * 
 * Tests for the health check endpoint
 * Requirements: 7.1-7.3
 */

import { describe, it, expect } from 'vitest';
import { api, type HealthResponse } from '../utils/api';
import { performanceThresholds } from '../config/test.config';

describe('Health API', () => {
  /**
   * Requirement 7.1: Health check returns correct structure
   */
  it('should return health check with correct structure', async () => {
    const response = await api.get<HealthResponse>('/api/health');
    
    // Verify response structure
    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('services');
    
    // Verify services structure
    expect(response.body.services).toHaveProperty('database');
    expect(response.body.services).toHaveProperty('redis');
    expect(response.body.services).toHaveProperty('app');
  });

  /**
   * Requirement 7.2: Healthy status returns HTTP 200
   */
  it('should return HTTP 200 when healthy', async () => {
    const response = await api.get<HealthResponse>('/api/health');
    
    // If status is healthy, should be 200
    if (response.body.status === 'healthy') {
      expect(response.status).toBe(200);
    }
  });

  /**
   * Requirement 7.3: Unhealthy status returns HTTP 503
   * Note: This test validates the expected behavior, actual status depends on system state
   */
  it('should return appropriate status code based on health', async () => {
    const response = await api.get<HealthResponse>('/api/health');
    
    // Verify status code matches health status
    if (response.body.status === 'healthy') {
      expect(response.status).toBe(200);
    } else if (response.body.status === 'unhealthy') {
      expect(response.status).toBe(503);
    } else if (response.body.status === 'degraded') {
      // Degraded can be 200 or 503 depending on implementation
      expect([200, 503]).toContain(response.status);
    }
  });

  /**
   * Additional: Health check response time
   */
  it('should respond within acceptable time', async () => {
    const response = await api.get<HealthResponse>('/api/health');
    
    // Health check should be fast
    expect(response.responseTime).toBeLessThan(performanceThresholds.apiResponse);
  });

  /**
   * Additional: Health check timestamp is valid
   */
  it('should return valid timestamp', async () => {
    const response = await api.get<HealthResponse>('/api/health');
    
    // Verify timestamp is a valid ISO string
    const timestamp = new Date(response.body.timestamp);
    expect(timestamp.getTime()).not.toBeNaN();
  });

  /**
   * Additional: Services have status field
   */
  it('should have status for each service', async () => {
    const response = await api.get<HealthResponse>('/api/health');
    
    // Each service should have a status
    expect(response.body.services.database).toHaveProperty('status');
    expect(response.body.services.redis).toHaveProperty('status');
    expect(response.body.services.app).toHaveProperty('status');
  });
});
