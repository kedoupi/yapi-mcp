import { YApiConfig } from './types/index.js';

export function loadConfig(): YApiConfig {
  const baseUrl = process.env.YAPI_BASE_URL;
  const projectToken = process.env.YAPI_PROJECT_TOKEN;
  const username = process.env.YAPI_USERNAME;
  const password = process.env.YAPI_PASSWORD;

  if (!baseUrl) {
    throw new Error('YAPI_BASE_URL environment variable is required');
  }

  // 要么提供projectToken，要么提供username+password
  if (!projectToken && (!username || !password)) {
    throw new Error('Either YAPI_PROJECT_TOKEN or both YAPI_USERNAME and YAPI_PASSWORD must be provided');
  }

  return {
    baseUrl: baseUrl.replace(/\/$/, ''), // Remove trailing slash
    projectToken,
    username,
    password,
    logLevel: (process.env.LOG_LEVEL as any) || 'info',
    cacheTtl: process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL) : 300,
  };
}

export function validateConfig(config: YApiConfig): void {
  if (!config.baseUrl) {
    throw new Error('Base URL is required');
  }

  // 验证认证方式
  if (!config.projectToken && (!config.username || !config.password)) {
    throw new Error('Either project token or username/password is required');
  }

  if (!config.baseUrl.startsWith('http')) {
    throw new Error('Base URL must start with http:// or https://');
  }

  const validLogLevels = ['debug', 'info', 'warn', 'error'];
  if (config.logLevel && !validLogLevels.includes(config.logLevel)) {
    throw new Error(`Invalid log level. Must be one of: ${validLogLevels.join(', ')}`);
  }

  if (config.cacheTtl && (config.cacheTtl < 0 || config.cacheTtl > 3600)) {
    throw new Error('Cache TTL must be between 0 and 3600 seconds');
  }
}