import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { loadConfig, validateConfig } from '../../src/config.js';
import type { YApiConfig } from '../../src/types/index.js';

describe('config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('loadConfig', () => {
    it('should load config from environment variables', () => {
      process.env.YAPI_BASE_URL = 'https://test.example.com';
      process.env.YAPI_PROJECT_TOKEN = 'test-token';
      process.env.LOG_LEVEL = 'debug';
      process.env.CACHE_TTL = '600';

      const config = loadConfig();

      expect(config).toEqual({
        baseUrl: 'https://test.example.com',
        projectToken: 'test-token',
        logLevel: 'debug',
        cacheTtl: 600,
      });
    });

    it('should use default values for optional config', () => {
      process.env.YAPI_BASE_URL = 'https://test.example.com';
      process.env.YAPI_PROJECT_TOKEN = 'test-token';

      const config = loadConfig();

      expect(config).toEqual({
        baseUrl: 'https://test.example.com',
        projectToken: 'test-token',
        logLevel: 'info',
        cacheTtl: 300,
      });
    });

    it('should remove trailing slash from base URL', () => {
      process.env.YAPI_BASE_URL = 'https://test.example.com/';
      process.env.YAPI_PROJECT_TOKEN = 'test-token';

      const config = loadConfig();

      expect(config.baseUrl).toBe('https://test.example.com');
    });

    it('should throw error when YAPI_BASE_URL is missing', () => {
      process.env.YAPI_PROJECT_TOKEN = 'test-token';
      delete process.env.YAPI_BASE_URL;

      expect(() => loadConfig()).toThrow('YAPI_BASE_URL environment variable is required');
    });

    it('should throw error when YAPI_PROJECT_TOKEN is missing', () => {
      process.env.YAPI_BASE_URL = 'https://test.example.com';
      delete process.env.YAPI_PROJECT_TOKEN;

      expect(() => loadConfig()).toThrow('YAPI_PROJECT_TOKEN environment variable is required');
    });

    it('should handle invalid CACHE_TTL gracefully', () => {
      process.env.YAPI_BASE_URL = 'https://test.example.com';
      process.env.YAPI_PROJECT_TOKEN = 'test-token';
      process.env.CACHE_TTL = 'invalid';

      const config = loadConfig();

      expect(config.cacheTtl).toBeNaN();
    });
  });

  describe('validateConfig', () => {
    let validConfig: YApiConfig;

    beforeEach(() => {
      validConfig = {
        baseUrl: 'https://test.example.com',
        projectToken: 'test-token',
        logLevel: 'info',
        cacheTtl: 300,
      };
    });

    it('should pass validation for valid config', () => {
      expect(() => validateConfig(validConfig)).not.toThrow();
    });

    it('should throw error for missing base URL', () => {
      const config = { ...validConfig, baseUrl: '' };
      expect(() => validateConfig(config)).toThrow('Base URL is required');
    });

    it('should throw error for missing project token', () => {
      const config = { ...validConfig, projectToken: '' };
      expect(() => validateConfig(config)).toThrow('Project token is required');
    });

    it('should throw error for invalid base URL format', () => {
      const config = { ...validConfig, baseUrl: 'not-a-url' };
      expect(() => validateConfig(config)).toThrow('Base URL must start with http:// or https://');
    });

    it('should throw error for invalid log level', () => {
      const config = { ...validConfig, logLevel: 'invalid' as any };
      expect(() => validateConfig(config)).toThrow('Invalid log level. Must be one of: debug, info, warn, error');
    });

    it('should allow valid log levels', () => {
      const validLevels = ['debug', 'info', 'warn', 'error'] as const;
      
      validLevels.forEach(level => {
        const config = { ...validConfig, logLevel: level };
        expect(() => validateConfig(config)).not.toThrow();
      });
    });

    it('should throw error for negative cache TTL', () => {
      const config = { ...validConfig, cacheTtl: -1 };
      expect(() => validateConfig(config)).toThrow('Cache TTL must be between 0 and 3600 seconds');
    });

    it('should throw error for too large cache TTL', () => {
      const config = { ...validConfig, cacheTtl: 4000 };
      expect(() => validateConfig(config)).toThrow('Cache TTL must be between 0 and 3600 seconds');
    });

    it('should allow valid cache TTL range', () => {
      const validTtls = [0, 300, 1800, 3600];
      
      validTtls.forEach(ttl => {
        const config = { ...validConfig, cacheTtl: ttl };
        expect(() => validateConfig(config)).not.toThrow();
      });
    });

    it('should handle undefined optional values', () => {
      const config = {
        baseUrl: 'https://test.example.com',
        projectToken: 'test-token',
      };
      expect(() => validateConfig(config)).not.toThrow();
    });

    it('should accept http URLs', () => {
      const config = { ...validConfig, baseUrl: 'http://localhost:3000' };
      expect(() => validateConfig(config)).not.toThrow();
    });

    it('should accept https URLs', () => {
      const config = { ...validConfig, baseUrl: 'https://example.com' };
      expect(() => validateConfig(config)).not.toThrow();
    });
  });
});