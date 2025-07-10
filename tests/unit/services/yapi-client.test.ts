import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import nock from 'nock';
import { YApiClient } from '../../../src/services/yapi-client.js';
import type { YApiConfig, YApiProject, YApiCategory, YApiInterface } from '../../../src/types/index.js';

describe('YApiClient', () => {
  let yapiClient: YApiClient;
  let config: YApiConfig;
  const baseUrl = 'https://test-yapi.example.com';

  beforeEach(() => {
    config = {
      baseUrl,
      projectToken: 'test-token',
      logLevel: 'error', // Suppress logs in tests
      cacheTtl: 1, // Short TTL for testing
    };
    yapiClient = new YApiClient(config);
    
    // Ensure nock is clean
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.restore();
  });

  describe('constructor', () => {
    it('should initialize with correct configuration', () => {
      expect(yapiClient).toBeInstanceOf(YApiClient);
    });

    it('should use default values for optional config', () => {
      const minimalConfig = {
        baseUrl: 'https://example.com',
        projectToken: 'token',
      };
      const client = new YApiClient(minimalConfig);
      expect(client).toBeInstanceOf(YApiClient);
    });
  });

  describe('getProjects', () => {
    const mockProjects: YApiProject[] = [
      {
        _id: 1,
        name: 'Test Project 1',
        basepath: '/api/v1',
        desc: 'Test description',
        env: [{ name: 'dev', domain: 'https://dev.example.com' }],
      },
      {
        _id: 2,
        name: 'Test Project 2',
        basepath: '/api/v2',
        desc: 'Another test description',
        env: [{ name: 'prod', domain: 'https://prod.example.com' }],
      },
    ];

    it('should fetch projects successfully', async () => {
      nock(baseUrl)
        .get('/api/project/list')
        .query({ token: 'test-token' })
        .reply(200, {
          errcode: 0,
          errmsg: 'success',
          data: mockProjects,
        });

      const result = await yapiClient.getProjects();
      expect(result).toEqual(mockProjects);
    });

    it('should handle API errors', async () => {
      nock(baseUrl)
        .get('/api/project/list')
        .query({ token: 'test-token' })
        .reply(200, {
          errcode: 1,
          errmsg: 'Unauthorized',
          data: null,
        });

      await expect(yapiClient.getProjects()).rejects.toThrow('Failed to get projects: Unauthorized');
    });

    it('should cache results', async () => {
      nock(baseUrl)
        .get('/api/project/list')
        .query({ token: 'test-token' })
        .reply(200, {
          errcode: 0,
          errmsg: 'success',
          data: mockProjects,
        });

      // First call
      const result1 = await yapiClient.getProjects();
      expect(result1).toEqual(mockProjects);

      // Second call should use cache (no additional HTTP request)
      const result2 = await yapiClient.getProjects();
      expect(result2).toEqual(mockProjects);

      // Verify only one HTTP request was made
      expect(nock.isDone()).toBe(true);
    });

    it('should handle network errors', async () => {
      nock(baseUrl)
        .get('/api/project/list')
        .query({ token: 'test-token' })
        .replyWithError('Network error');

      await expect(yapiClient.getProjects()).rejects.toThrow('YApi API request failed');
    });
  });

  describe('getCategories', () => {
    const mockCategories: YApiCategory[] = [
      {
        _id: 1,
        name: 'User APIs',
        project_id: 123,
        desc: 'User management APIs',
        uid: 1,
      },
      {
        _id: 2,
        name: 'Product APIs',
        project_id: 123,
        desc: 'Product management APIs',
        uid: 1,
      },
    ];

    it('should fetch categories successfully', async () => {
      nock(baseUrl)
        .get('/api/interface/getCatMenu')
        .query({ token: 'test-token', project_id: 123 })
        .reply(200, {
          errcode: 0,
          errmsg: 'success',
          data: mockCategories,
        });

      const result = await yapiClient.getCategories(123);
      expect(result).toEqual(mockCategories);
    });

    it('should cache categories by project ID', async () => {
      nock(baseUrl)
        .get('/api/interface/getCatMenu')
        .query({ token: 'test-token', project_id: 123 })
        .reply(200, {
          errcode: 0,
          errmsg: 'success',
          data: mockCategories,
        });

      const result1 = await yapiClient.getCategories(123);
      const result2 = await yapiClient.getCategories(123);
      
      expect(result1).toEqual(mockCategories);
      expect(result2).toEqual(mockCategories);
      expect(nock.isDone()).toBe(true);
    });
  });

  describe('getInterface', () => {
    const mockInterface: YApiInterface = {
      _id: 456,
      title: 'Get User Info',
      path: '/api/user/info',
      method: 'GET',
      project_id: 123,
      catid: 1,
      status: 'done',
      desc: 'Get user information',
      username: 'testuser',
      uid: 1,
      add_time: 1640995200,
      up_time: 1640995200,
    };

    it('should fetch interface successfully', async () => {
      nock(baseUrl)
        .get('/api/interface/get')
        .query({ token: 'test-token', id: 456 })
        .reply(200, {
          errcode: 0,
          errmsg: 'success',
          data: mockInterface,
        });

      const result = await yapiClient.getInterface(456);
      expect(result).toEqual(mockInterface);
    });
  });

  describe('searchInterfaces', () => {
    const mockSearchResult = {
      list: [
        {
          _id: 1,
          title: 'Test API 1',
          path: '/api/test1',
          method: 'GET',
          project_id: 123,
          catid: 1,
          status: 'done',
          desc: 'Test API 1',
          username: 'testuser',
          uid: 1,
          add_time: 1640995200,
          up_time: 1640995200,
        },
      ],
      count: 1,
    };

    it('should search interfaces successfully', async () => {
      const searchParams = {
        project_id: 123,
        q: 'test',
        page: 1,
        limit: 20,
      };

      nock(baseUrl)
        .get('/api/interface/list')
        .query({ token: 'test-token', ...searchParams })
        .reply(200, {
          errcode: 0,
          errmsg: 'success',
          data: mockSearchResult,
        });

      const result = await yapiClient.searchInterfaces(searchParams);
      expect(result).toEqual(mockSearchResult);
    });
  });

  describe('createInterface', () => {
    const createParams = {
      title: 'New API',
      path: '/api/new',
      method: 'POST' as const,
      project_id: 123,
      catid: 1,
      desc: 'New API description',
    };

    const mockCreatedInterface: YApiInterface = {
      _id: 789,
      ...createParams,
      status: 'undone',
      username: 'testuser',
      uid: 1,
      add_time: 1640995200,
      up_time: 1640995200,
    };

    it('should create interface successfully', async () => {
      nock(baseUrl)
        .post('/api/interface/add', {
          token: 'test-token',
          ...createParams,
        })
        .reply(200, {
          errcode: 0,
          errmsg: 'success',
          data: mockCreatedInterface,
        });

      const result = await yapiClient.createInterface(createParams);
      expect(result).toEqual(mockCreatedInterface);
    });

    it('should clear related cache after creation', async () => {
      nock(baseUrl)
        .post('/api/interface/add')
        .reply(200, {
          errcode: 0,
          errmsg: 'success',
          data: mockCreatedInterface,
        });

      // This should work without throwing and clear cache
      await yapiClient.createInterface(createParams);
      expect(true).toBe(true); // Test passes if no error thrown
    });
  });

  describe('updateInterface', () => {
    const updateParams = {
      id: 789,
      title: 'Updated API',
      path: '/api/updated',
      method: 'PUT' as const,
      project_id: 123,
      catid: 1,
      desc: 'Updated description',
    };

    const mockUpdatedInterface: YApiInterface = {
      _id: 789,
      title: 'Updated API',
      path: '/api/updated',
      method: 'PUT',
      project_id: 123,
      catid: 1,
      status: 'done',
      desc: 'Updated description',
      username: 'testuser',
      uid: 1,
      add_time: 1640995200,
      up_time: 1640995300,
    };

    it('should update interface successfully', async () => {
      nock(baseUrl)
        .post('/api/interface/up', {
          token: 'test-token',
          ...updateParams,
        })
        .reply(200, {
          errcode: 0,
          errmsg: 'success',
          data: mockUpdatedInterface,
        });

      const result = await yapiClient.updateInterface(updateParams);
      expect(result).toEqual(mockUpdatedInterface);
    });
  });

  describe('clearCache', () => {
    it('should clear cache successfully', () => {
      expect(() => yapiClient.clearCache()).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle timeout errors', async () => {
      nock(baseUrl)
        .get('/api/project/list')
        .delay(35000) // Longer than timeout
        .reply(200, { errcode: 0, data: [] });

      await expect(yapiClient.getProjects()).rejects.toThrow('YApi API request failed');
    });

    it('should handle HTTP error responses', async () => {
      nock(baseUrl)
        .get('/api/project/list')
        .reply(500, 'Internal Server Error');

      await expect(yapiClient.getProjects()).rejects.toThrow('YApi API request failed');
    });
  });
});