#!/usr/bin/env node

import { Command } from 'commander';
import { YApiMcpServer } from './server.js';
import { loadConfig, validateConfig } from './config.js';
import { Logger } from './utils/logger.js';

const program = new Command();

program
  .name('yapi-mcp')
  .description('YApi MCP Enhanced Server - AI-friendly API management')
  .version('1.0.0');

program
  .command('start')
  .description('Start the MCP server')
  .option('--base-url <url>', 'YApi base URL')
  .option('--token <token>', 'YApi project token')
  .option('--log-level <level>', 'Log level (debug, info, warn, error)', 'info')
  .option('--cache-ttl <seconds>', 'Cache TTL in seconds', '300')
  .action(async (options) => {
    try {
      const config = {
        ...loadConfig(),
        ...(options.baseUrl && { baseUrl: options.baseUrl }),
        ...(options.token && { projectToken: options.token }),
        ...(options.logLevel && { logLevel: options.logLevel }),
        ...(options.cacheTtl && { cacheTtl: parseInt(options.cacheTtl) }),
      };

      validateConfig(config);

      const logger = new Logger(config.logLevel);
      logger.info('Starting YApi MCP Enhanced Server via CLI...');

      const server = new YApiMcpServer(config);
      await server.run();
    } catch (error: any) {
      console.error('Failed to start server:', error.message);
      process.exit(1);
    }
  });

program
  .command('test-connection')
  .description('Test connection to YApi server')
  .option('--base-url <url>', 'YApi base URL')
  .option('--token <token>', 'YApi project token')
  .action(async (options) => {
    try {
      const config = {
        ...loadConfig(),
        ...(options.baseUrl && { baseUrl: options.baseUrl }),
        ...(options.token && { projectToken: options.token }),
      };

      validateConfig(config);

      // Import YApiClient dynamically to avoid circular dependencies
      const { YApiClient } = await import('./services/yapi-client.js');
      const client = new YApiClient(config);
      
      console.log('Testing connection to YApi...');
      const projects = await client.getProjects();
      
      console.log('✅ Connection successful!');
      console.log(`Found ${projects.length} projects:`);
      projects.forEach(project => {
        console.log(`  - ${project.name} (ID: ${project._id})`);
      });
    } catch (error: any) {
      console.error('❌ Connection failed:', error.message);
      process.exit(1);
    }
  });

program.parse();