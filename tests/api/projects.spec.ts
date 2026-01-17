/**
 * Projects API Tests
 * 
 * Tests for the projects endpoint
 * Requirements: 7.6
 */

import { describe, it, expect } from 'vitest';
import { api, type ErrorResponse } from '../utils/api';
import { testData } from '../config/test.config';

describe('Projects API', () => {
  /**
   * Requirement 7.6: POST without auth returns 401
   */
  it('should return 401 for unauthenticated POST', async () => {
    const response = await api.post<ErrorResponse>('/api/projects', testData.validProject);
    
    // Should return 401 Unauthorized
    expect(response.status).toBe(401);
  });

  /**
   * Additional: GET without auth returns 401
   */
  it('should return 401 for unauthenticated GET', async () => {
    const response = await api.get<ErrorResponse>('/api/projects');
    
    // Should return 401 Unauthorized
    expect(response.status).toBe(401);
  });

  /**
   * Additional: Error response has correct structure
   */
  it('should return error with message', async () => {
    const response = await api.post<ErrorResponse>('/api/projects', testData.validProject);
    
    // Should have error field
    expect(response.body).toHaveProperty('error');
  });
});
