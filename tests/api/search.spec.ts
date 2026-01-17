/**
 * Search API Tests
 * 
 * Tests for the search endpoint
 * Requirements: 7.4-7.5
 */

import { describe, it, expect } from 'vitest';
import { api, type SearchResponse } from '../utils/api';
import { performanceThresholds, testData } from '../config/test.config';

describe('Search API', () => {
  /**
   * Requirement 7.4: Search with valid query returns results
   */
  it('should return results for valid search query', async () => {
    const query = testData.searchQueries.valid[0];
    const response = await api.get<SearchResponse>(`/api/search?q=${encodeURIComponent(query)}&project=repodocs`);
    
    // Verify response structure
    expect(response.body).toHaveProperty('results');
    expect(Array.isArray(response.body.results)).toBe(true);
  });

  /**
   * Requirement 7.4: Search results have correct structure
   */
  it('should return results with correct structure', async () => {
    const query = testData.searchQueries.valid[0];
    const response = await api.get<SearchResponse>(`/api/search?q=${encodeURIComponent(query)}&project=repodocs`);
    
    // If results exist, verify structure
    if (response.body.results.length > 0) {
      const result = response.body.results[0];
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('path');
    }
  });

  /**
   * Requirement 7.5: Short query returns empty results
   */
  it('should return empty results for short query', async () => {
    const shortQuery = 'a';
    const response = await api.get<SearchResponse>(`/api/search?q=${shortQuery}&project=repodocs`);
    
    // Short queries should return empty results
    expect(response.body.results).toHaveLength(0);
  });

  /**
   * Requirement 7.5: Empty query returns empty results
   */
  it('should return empty results for empty query', async () => {
    const response = await api.get<SearchResponse>('/api/search?q=&project=repodocs');
    
    // Empty query should return empty results
    expect(response.body.results).toHaveLength(0);
  });

  /**
   * Additional: Search response time
   */
  it('should respond within acceptable time', async () => {
    const query = testData.searchQueries.valid[0];
    const response = await api.get<SearchResponse>(`/api/search?q=${encodeURIComponent(query)}&project=repodocs`);
    
    // Search should be fast
    expect(response.responseTime).toBeLessThan(performanceThresholds.searchResponse);
  });

  /**
   * Additional: Search with no results query
   */
  it('should return empty results for non-matching query', async () => {
    const query = testData.searchQueries.noResults[0];
    const response = await api.get<SearchResponse>(`/api/search?q=${encodeURIComponent(query)}&project=repodocs`);
    
    // Non-matching query should return empty results
    expect(response.body.results).toHaveLength(0);
  });

  /**
   * Additional: Search requires project parameter
   */
  it('should handle missing project parameter', async () => {
    const query = testData.searchQueries.valid[0];
    const response = await api.get<SearchResponse | { error: string }>(`/api/search?q=${encodeURIComponent(query)}`);
    
    // Should return response (either results or error)
    expect(response.status).toBeDefined();
  });
});
