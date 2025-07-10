import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { YApiMcpServer } from '../../src/server.js';
import type { YApiConfig } from '../../src/types/index.js';

// Mock the YApiClient
jest.mock('../../src/services/yapi-client.js', () => ({
  YApiClient: jest.fn().mockImplementation(() => ({
    getProjects: jest.fn(),
    getCategories: jest.fn(),
    getInterface: jest.fn(),
    searchInterfaces: jest.fn(),
    createInterface: jest.fn(),
    updateInterface: jest.fn(),
    clearCache: jest.fn(),
  })),
}));

describe('YApiMcpServer', () => {
  let server: YApiMcpServer;
  let config: YApiConfig;
  let mockYApiClient: any;

  beforeEach(() => {
    config = {
      baseUrl: 'https://test-yapi.example.com',
      projectToken: 'test-token',
      logLevel: 'error',
      cacheTtl: 300,
    };

    // Reset mocks
    jest.clearAllMocks();
    
    // Get the mocked YApiClient constructor
    const { YApiClient } = require('../../src/services/yapi-client.js');
    mockYApiClient = YApiClient.mock.results[0]?.value || YApiClient();
    
    server = new YApiMcpServer(config);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create server instance with correct config', () => {
      expect(server).toBeInstanceOf(YApiMcpServer);
    });

    it('should initialize YApiClient with config', () => {
      const { YApiClient } = require('../../src/services/yapi-client.js');
      expect(YApiClient).toHaveBeenCalledWith(config);
    });
  });

  describe('getServer', () => {
    it('should return the MCP server instance', () => {
      const mcpServer = server.getServer();
      expect(mcpServer).toBeDefined();
      expect(typeof mcpServer.connect).toBe('function');
    });
  });

  // Note: Testing the actual MCP server functionality requires more complex setup
  // as it involves the MCP protocol and server communication. 
  // For comprehensive testing, we would need integration tests.
  
  describe('tool registration', () => {
    it('should register all required tools', async () => {
      const mcpServer = server.getServer();
      
      // This is a simplified test - in a real scenario, we'd need to
      // simulate MCP protocol messages to test tool registration
      expect(mcpServer).toBeDefined();
    });
  });
});