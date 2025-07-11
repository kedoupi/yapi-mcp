import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { YApiMcpServer } from '../../src/server.js';
import type { YApiConfig } from '../../src/types/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Mock the YApiClient
const mockYApiClient = {
  getProjects: jest.fn() as jest.MockedFunction<any>,
  getCategories: jest.fn() as jest.MockedFunction<any>,
  getInterface: jest.fn() as jest.MockedFunction<any>,
  searchInterfaces: jest.fn() as jest.MockedFunction<any>,
  createInterface: jest.fn() as jest.MockedFunction<any>,
  updateInterface: jest.fn() as jest.MockedFunction<any>,
  clearCache: jest.fn() as jest.MockedFunction<any>,
};

jest.mock('../../src/services/yapi-client.js', () => ({
  YApiClient: jest.fn().mockImplementation(() => mockYApiClient),
}));

// Mock the Logger
const mockLogger = {
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  setLevel: jest.fn(),
};

jest.mock('../../src/utils/logger.js', () => ({
  Logger: jest.fn().mockImplementation(() => mockLogger),
}));

describe('YApiMcpServer', () => {
  let server: YApiMcpServer;
  let config: YApiConfig;

  beforeEach(() => {
    config = {
      baseUrl: 'https://test-yapi.example.com',
      projectToken: 'test-token',
      logLevel: 'error',
      cacheTtl: 300,
    };

    // Reset all mocks
    jest.clearAllMocks();
    
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

    it('should initialize Logger with correct log level', () => {
      const { Logger } = require('../../src/utils/logger.js');
      expect(Logger).toHaveBeenCalledWith('error');
    });
  });

  describe('getServer', () => {
    it('should return the MCP server instance', () => {
      const mcpServer = server.getServer();
      expect(mcpServer).toBeDefined();
      expect(typeof mcpServer.connect).toBe('function');
    });
  });

  describe('ListTools handler', () => {
    it('should return all registered tools', async () => {
      const mcpServer = server.getServer();
      
      // Get the registered ListTools handler
      const handlers = (mcpServer as any)._handlers;
      const listToolsHandler = handlers.get(ListToolsRequestSchema);
      
      expect(listToolsHandler).toBeDefined();
      
      const result = await listToolsHandler({});
      
      expect(result.tools).toHaveLength(7);
      
      const toolNames = result.tools.map((tool: any) => tool.name);
      expect(toolNames).toEqual([
        'yapi_get_projects',
        'yapi_get_categories',
        'yapi_get_interface',
        'yapi_search_interfaces',
        'yapi_create_interface',
        'yapi_update_interface',
        'yapi_clear_cache',
      ]);
    });

    it('should include correct tool schemas', async () => {
      const mcpServer = server.getServer();
      const handlers = (mcpServer as any)._handlers;
      const listToolsHandler = handlers.get(ListToolsRequestSchema);
      
      const result = await listToolsHandler({});
      const tools = result.tools;
      
      // Check yapi_get_categories tool schema
      const getCategoriesToolSchema = tools.find((t: any) => t.name === 'yapi_get_categories');
      expect(getCategoriesToolSchema.inputSchema.required).toEqual(['project_id']);
      expect(getCategoriesToolSchema.inputSchema.properties.project_id.type).toBe('number');
      
      // Check yapi_create_interface tool schema
      const createInterfaceToolSchema = tools.find((t: any) => t.name === 'yapi_create_interface');
      expect(createInterfaceToolSchema.inputSchema.required).toEqual(['title', 'path', 'method', 'project_id', 'catid']);
    });
  });

  describe('CallTool handler - yapi_get_projects', () => {
    it('should call YApiClient.getProjects and return formatted result', async () => {
      const mockProjects = [
        { _id: 1, name: 'Test Project 1', basepath: '/api/v1' },
        { _id: 2, name: 'Test Project 2', basepath: '/api/v2' },
      ];
      
      mockYApiClient.getProjects.mockResolvedValue(mockProjects);
      
      const mcpServer = server.getServer();
      const handlers = (mcpServer as any)._handlers;
      const callToolHandler = handlers.get(CallToolRequestSchema);
      
      const request = {
        params: {
          name: 'yapi_get_projects',
          arguments: {},
        },
      };
      
      const result = await callToolHandler(request);
      
      expect(mockYApiClient.getProjects).toHaveBeenCalledTimes(1);
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(JSON.parse(result.content[0].text)).toEqual(mockProjects);
    });

    it('should handle errors and return error response', async () => {
      const errorMessage = 'Failed to fetch projects';
      mockYApiClient.getProjects.mockRejectedValue(new Error(errorMessage));
      
      const mcpServer = server.getServer();
      const handlers = (mcpServer as any)._handlers;
      const callToolHandler = handlers.get(CallToolRequestSchema);
      
      const request = {
        params: {
          name: 'yapi_get_projects',
          arguments: {},
        },
      };
      
      const result = await callToolHandler(request);
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe(`Error: ${errorMessage}`);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Tool execution error for yapi_get_projects:',
        expect.any(Error)
      );
    });
  });

  describe('CallTool handler - yapi_get_categories', () => {
    it('should call YApiClient.getCategories with correct project_id', async () => {
      const mockCategories = [
        { _id: 1, name: 'User APIs', project_id: 123 },
        { _id: 2, name: 'Product APIs', project_id: 123 },
      ];
      
      mockYApiClient.getCategories.mockResolvedValue(mockCategories);
      
      const mcpServer = server.getServer();
      const handlers = (mcpServer as any)._handlers;
      const callToolHandler = handlers.get(CallToolRequestSchema);
      
      const request = {
        params: {
          name: 'yapi_get_categories',
          arguments: { project_id: 123 },
        },
      };
      
      const result = await callToolHandler(request);
      
      expect(mockYApiClient.getCategories).toHaveBeenCalledWith(123);
      expect(result.content).toHaveLength(1);
      expect(JSON.parse(result.content[0].text)).toEqual(mockCategories);
    });
  });

  describe('CallTool handler - yapi_get_interface', () => {
    it('should call YApiClient.getInterface with correct interface_id', async () => {
      const mockInterface = {
        _id: 456,
        title: 'Get User Info',
        path: '/api/user/info',
        method: 'GET',
      };
      
      mockYApiClient.getInterface.mockResolvedValue(mockInterface);
      
      const mcpServer = server.getServer();
      const handlers = (mcpServer as any)._handlers;
      const callToolHandler = handlers.get(CallToolRequestSchema);
      
      const request = {
        params: {
          name: 'yapi_get_interface',
          arguments: { interface_id: 456 },
        },
      };
      
      const result = await callToolHandler(request);
      
      expect(mockYApiClient.getInterface).toHaveBeenCalledWith(456);
      expect(JSON.parse(result.content[0].text)).toEqual(mockInterface);
    });
  });

  describe('CallTool handler - yapi_search_interfaces', () => {
    it('should validate search parameters with Zod schema', async () => {
      const mockSearchResult = {
        list: [{ _id: 1, title: 'Test API', path: '/api/test' }],
        count: 1,
      };
      
      mockYApiClient.searchInterfaces.mockResolvedValue(mockSearchResult);
      
      const mcpServer = server.getServer();
      const handlers = (mcpServer as any)._handlers;
      const callToolHandler = handlers.get(CallToolRequestSchema);
      
      const validParams = {
        project_id: 123,
        q: 'test',
        page: 1,
        limit: 20,
      };
      
      const request = {
        params: {
          name: 'yapi_search_interfaces',
          arguments: validParams,
        },
      };
      
      const result = await callToolHandler(request);
      
      expect(mockYApiClient.searchInterfaces).toHaveBeenCalledWith(validParams);
      expect(JSON.parse(result.content[0].text)).toEqual(mockSearchResult);
    });

    it('should reject invalid search parameters', async () => {
      const mcpServer = server.getServer();
      const handlers = (mcpServer as any)._handlers;
      const callToolHandler = handlers.get(CallToolRequestSchema);
      
      const invalidParams = {
        page: 0, // Invalid: page must be >= 1
        limit: 150, // Invalid: limit must be <= 100
      };
      
      const request = {
        params: {
          name: 'yapi_search_interfaces',
          arguments: invalidParams,
        },
      };
      
      const result = await callToolHandler(request);
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error:');
      expect(mockYApiClient.searchInterfaces).not.toHaveBeenCalled();
    });
  });

  describe('CallTool handler - yapi_create_interface', () => {
    it('should validate create parameters and call YApiClient.createInterface', async () => {
      const createParams = {
        title: 'New API',
        path: '/api/new',
        method: 'POST',
        project_id: 123,
        catid: 1,
        desc: 'New API description',
      };
      
      const mockCreatedInterface = {
        _id: 789,
        ...createParams,
        status: 'undone',
      };
      
      mockYApiClient.createInterface.mockResolvedValue(mockCreatedInterface);
      
      const mcpServer = server.getServer();
      const handlers = (mcpServer as any)._handlers;
      const callToolHandler = handlers.get(CallToolRequestSchema);
      
      const request = {
        params: {
          name: 'yapi_create_interface',
          arguments: createParams,
        },
      };
      
      const result = await callToolHandler(request);
      
      expect(mockYApiClient.createInterface).toHaveBeenCalledWith(createParams);
      expect(result.content[0].text).toContain('Interface created successfully:');
      expect(result.content[0].text).toContain(JSON.stringify(mockCreatedInterface, null, 2));
    });

    it('should reject create parameters with invalid method', async () => {
      const mcpServer = server.getServer();
      const handlers = (mcpServer as any)._handlers;
      const callToolHandler = handlers.get(CallToolRequestSchema);
      
      const invalidParams = {
        title: 'New API',
        path: '/api/new',
        method: 'INVALID_METHOD',
        project_id: 123,
        catid: 1,
      };
      
      const request = {
        params: {
          name: 'yapi_create_interface',
          arguments: invalidParams,
        },
      };
      
      const result = await callToolHandler(request);
      
      expect(result.isError).toBe(true);
      expect(mockYApiClient.createInterface).not.toHaveBeenCalled();
    });
  });

  describe('CallTool handler - yapi_update_interface', () => {
    it('should validate update parameters and call YApiClient.updateInterface', async () => {
      const updateParams = {
        id: 789,
        title: 'Updated API',
        path: '/api/updated',
        method: 'PUT',
        project_id: 123,
        catid: 1,
      };
      
      const mockUpdatedInterface = {
        ...updateParams,
        _id: 789,
        status: 'done',
      };
      
      mockYApiClient.updateInterface.mockResolvedValue(mockUpdatedInterface);
      
      const mcpServer = server.getServer();
      const handlers = (mcpServer as any)._handlers;
      const callToolHandler = handlers.get(CallToolRequestSchema);
      
      const request = {
        params: {
          name: 'yapi_update_interface',
          arguments: updateParams,
        },
      };
      
      const result = await callToolHandler(request);
      
      expect(mockYApiClient.updateInterface).toHaveBeenCalledWith(updateParams);
      expect(result.content[0].text).toContain('Interface updated successfully:');
    });
  });

  describe('CallTool handler - yapi_clear_cache', () => {
    it('should call YApiClient.clearCache', async () => {
      const mcpServer = server.getServer();
      const handlers = (mcpServer as any)._handlers;
      const callToolHandler = handlers.get(CallToolRequestSchema);
      
      const request = {
        params: {
          name: 'yapi_clear_cache',
          arguments: {},
        },
      };
      
      const result = await callToolHandler(request);
      
      expect(mockYApiClient.clearCache).toHaveBeenCalledTimes(1);
      expect(result.content[0].text).toBe('Cache cleared successfully');
    });
  });

  describe('CallTool handler - unknown tool', () => {
    it('should return error for unknown tool', async () => {
      const mcpServer = server.getServer();
      const handlers = (mcpServer as any)._handlers;
      const callToolHandler = handlers.get(CallToolRequestSchema);
      
      const request = {
        params: {
          name: 'unknown_tool',
          arguments: {},
        },
      };
      
      const result = await callToolHandler(request);
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe('Error: Unknown tool: unknown_tool');
    });
  });
});