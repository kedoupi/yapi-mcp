#!/usr/bin/env node

import { YApiMcpServer } from './server.js';
import { loadConfig, validateConfig } from './config.js';
import { Logger } from './utils/logger.js';

async function main() {
  try {
    const config = loadConfig();
    validateConfig(config);

    const logger = new Logger(config.logLevel);
    logger.info('Starting YApi MCP Enhanced Server...');
    logger.debug('Configuration:', { 
      baseUrl: config.baseUrl, 
      logLevel: config.logLevel,
      cacheTtl: config.cacheTtl
    });

    const server = new YApiMcpServer(config);
    await server.run();
  } catch (error: any) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

// Handle process signals gracefully
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down gracefully...');
  process.exit(0);
});

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});