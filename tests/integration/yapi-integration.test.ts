import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import nock from 'nock';
import { YApiClient } from '../../src/services/yapi-client.js';
import { YApiMcpServer } from '../../src/server.js';
import type { YApiConfig } from '../../src/types/index.js';

describe('YApi Integration Tests', () => {
  let yapiClient: YApiClient;
  let mcpServer: YApiMcpServer;
  let config: YApiConfig;
  const baseUrl = 'https://integration-test.example.com';

  beforeAll(() => {
    config = {
      baseUrl,
      projectToken: 'integration-test-token',
      logLevel: 'error',
      cacheTtl: 5,
    };
    
    yapiClient = new YApiClient(config);
    mcpServer = new YApiMcpServer(config);
  });

  afterAll(() => {
    nock.cleanAll();
  });

  describe('End-to-End Workflow', () => {
    it('should handle complete API lifecycle', async () => {
      // Mock project list
      nock(baseUrl)
        .get('/api/project/list')
        .query({ token: 'integration-test-token' })
        .reply(200, {
          errcode: 0,
          errmsg: 'success',
          data: [
            {
              _id: 100,
              name: 'Integration Test Project',
              basepath: '/api/v1',
              desc: 'Test project for integration',
              env: [{ name: 'test', domain: 'https://test.example.com' }],
            },
          ],
        });

      // Mock categories
      nock(baseUrl)
        .get('/api/interface/getCatMenu')
        .query({ token: 'integration-test-token', project_id: 100 })
        .reply(200, {
          errcode: 0,
          errmsg: 'success',
          data: [
            {
              _id: 10,
              name: 'Test Category',
              project_id: 100,
              desc: 'Test category',
              uid: 1,
            },
          ],
        });

      // Mock interface creation
      nock(baseUrl)
        .post('/api/interface/add', body => {
          return body.title === 'Test Integration API';
        })
        .reply(200, {
          errcode: 0,
          errmsg: 'success',
          data: {
            _id: 999,
            title: 'Test Integration API',
            path: '/api/test',
            method: 'GET',
            project_id: 100,
            catid: 10,
            status: 'undone',
            desc: 'Integration test API',
            username: 'testuser',
            uid: 1,
            add_time: Date.now(),
            up_time: Date.now(),
          },
        });

      // Mock interface retrieval
      nock(baseUrl)
        .get('/api/interface/get')
        .query({ token: 'integration-test-token', id: 999 })
        .reply(200, {
          errcode: 0,
          errmsg: 'success',
          data: {
            _id: 999,
            title: 'Test Integration API',
            path: '/api/test',
            method: 'GET',
            project_id: 100,
            catid: 10,
            status: 'undone',
            desc: 'Integration test API',
            username: 'testuser',
            uid: 1,
            add_time: Date.now(),
            up_time: Date.now(),
          },
        });

      // Mock search
      nock(baseUrl)
        .get('/api/interface/list')
        .query({ token: 'integration-test-token', project_id: 100, q: 'test' })
        .reply(200, {
          errcode: 0,
          errmsg: 'success',
          data: {
            list: [
              {
                _id: 999,
                title: 'Test Integration API',
                path: '/api/test',
                method: 'GET',
                project_id: 100,
                catid: 10,
                status: 'undone',
                desc: 'Integration test API',
                username: 'testuser',
                uid: 1,
                add_time: Date.now(),
                up_time: Date.now(),
              },
            ],
            count: 1,
          },
        });

      // Execute the workflow
      const projects = await yapiClient.getProjects();
      expect(projects).toHaveLength(1);
      expect(projects[0].name).toBe('Integration Test Project');

      const categories = await yapiClient.getCategories(100);
      expect(categories).toHaveLength(1);
      expect(categories[0].name).toBe('Test Category');

      const createdInterface = await yapiClient.createInterface({
        title: 'Test Integration API',
        path: '/api/test',
        method: 'GET',
        project_id: 100,
        catid: 10,
        desc: 'Integration test API',
      });
      expect(createdInterface._id).toBe(999);

      const retrievedInterface = await yapiClient.getInterface(999);
      expect(retrievedInterface.title).toBe('Test Integration API');

      const searchResults = await yapiClient.searchInterfaces({
        project_id: 100,
        q: 'test',
      });
      expect(searchResults.list).toHaveLength(1);
      expect(searchResults.count).toBe(1);
    });

    it('should handle error scenarios gracefully', async () => {
      // Mock authentication error
      nock(baseUrl)
        .get('/api/project/list')
        .query({ token: 'integration-test-token' })
        .reply(200, {
          errcode: 40011,
          errmsg: 'Token is invalid',
          data: null,
        });

      await expect(yapiClient.getProjects()).rejects.toThrow('Failed to get projects: Token is invalid');
    });

    it('should handle network failures', async () => {
      // Mock network failure
      nock(baseUrl)
        .get('/api/project/list')
        .replyWithError('ENOTFOUND');

      await expect(yapiClient.getProjects()).rejects.toThrow('YApi API request failed');
    });
  });

  describe('Cache Integration', () => {
    it('should cache and expire data correctly', async () => {
      const mockData = [
        {
          _id: 200,
          name: 'Cache Test Project',
          basepath: '/api/cache',
          desc: 'Cache test',
          env: [],
        },
      ];

      // First request
      nock(baseUrl)
        .get('/api/project/list')
        .query({ token: 'integration-test-token' })
        .reply(200, {
          errcode: 0,
          errmsg: 'success',
          data: mockData,
        });

      const result1 = await yapiClient.getProjects();
      expect(result1).toEqual(mockData);

      // Second request should use cache (no additional HTTP call)
      const result2 = await yapiClient.getProjects();
      expect(result2).toEqual(mockData);

      // Wait for cache expiration (TTL is 5 seconds)
      await new Promise(resolve => setTimeout(resolve, 6000));

      // Third request should make new HTTP call
      nock(baseUrl)
        .get('/api/project/list')
        .query({ token: 'integration-test-token' })
        .reply(200, {
          errcode: 0,
          errmsg: 'success',
          data: mockData,
        });

      const result3 = await yapiClient.getProjects();
      expect(result3).toEqual(mockData);
    }, 15000); // Increase timeout for this test
  });

  describe('MCP Server Integration', () => {
    it('should initialize server without errors', () => {
      expect(mcpServer).toBeInstanceOf(YApiMcpServer);
      expect(mcpServer.getServer()).toBeDefined();
    });

    it('should handle server configuration', () => {
      const server = mcpServer.getServer();
      expect(server).toBeDefined();
      // More detailed MCP server testing would require
      // setting up actual MCP protocol communication
    });
  });
});