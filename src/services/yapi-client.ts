import axios, { AxiosInstance } from 'axios';
import { Logger } from '../utils/logger.js';
import { SimpleCache } from '../utils/cache.js';
import {
  YApiConfig,
  YApiProject,
  YApiCategory,
  YApiInterface,
  YApiResponse,
  SearchApiParams,
  CreateApiParams,
  UpdateApiParams
} from '../types/index.js';

export class YApiClient {
  private http: AxiosInstance;
  private logger: Logger;
  private cache: SimpleCache<any>;
  private config: YApiConfig;

  constructor(config: YApiConfig) {
    this.config = config;
    this.logger = new Logger(config.logLevel || 'info');
    this.cache = new SimpleCache(config.cacheTtl || 300);

    this.http = axios.create({
      baseURL: config.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.http.interceptors.request.use(
      (config) => {
        this.logger.debug('HTTP Request:', {
          method: config.method,
          url: config.url,
          params: config.params
        });
        return config;
      },
      (error) => {
        this.logger.error('HTTP Request Error:', error);
        return Promise.reject(error);
      }
    );

    this.http.interceptors.response.use(
      (response) => {
        this.logger.debug('HTTP Response:', {
          status: response.status,
          url: response.config.url
        });
        return response;
      },
      (error) => {
        this.logger.error('HTTP Response Error:', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message
        });
        return Promise.reject(error);
      }
    );
  }

  private async request<T>(endpoint: string, params?: any): Promise<YApiResponse<T>> {
    try {
      const response = await this.http.get(endpoint, {
        params: {
          token: this.config.projectToken,
          ...params
        }
      });
      return response.data;
    } catch (error: any) {
      this.logger.error(`Request failed for ${endpoint}:`, error.message);
      throw new Error(`YApi API request failed: ${error.message}`);
    }
  }

  private async post<T>(endpoint: string, data?: any): Promise<YApiResponse<T>> {
    try {
      const response = await this.http.post(endpoint, {
        token: this.config.projectToken,
        ...data
      });
      return response.data;
    } catch (error: any) {
      this.logger.error(`POST request failed for ${endpoint}:`, error.message);
      throw new Error(`YApi API request failed: ${error.message}`);
    }
  }

  async getProjects(): Promise<YApiProject[]> {
    const cacheKey = 'projects';
    const cached = this.cache.get(cacheKey);
    if (cached) {
      this.logger.debug('Returning cached projects');
      return cached;
    }

    this.logger.info('Fetching projects from YApi');
    const response = await this.request<YApiProject[]>('/api/project/list');
    
    if (response.errcode !== 0) {
      throw new Error(`Failed to get projects: ${response.errmsg}`);
    }

    this.cache.set(cacheKey, response.data);
    return response.data;
  }

  async getCategories(projectId: number): Promise<YApiCategory[]> {
    const cacheKey = `categories_${projectId}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      this.logger.debug(`Returning cached categories for project ${projectId}`);
      return cached;
    }

    this.logger.info(`Fetching categories for project ${projectId}`);
    const response = await this.request<YApiCategory[]>('/api/interface/getCatMenu', {
      project_id: projectId
    });

    if (response.errcode !== 0) {
      throw new Error(`Failed to get categories: ${response.errmsg}`);
    }

    this.cache.set(cacheKey, response.data);
    return response.data;
  }

  async getInterface(interfaceId: number): Promise<YApiInterface> {
    const cacheKey = `interface_${interfaceId}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      this.logger.debug(`Returning cached interface ${interfaceId}`);
      return cached;
    }

    this.logger.info(`Fetching interface ${interfaceId}`);
    const response = await this.request<YApiInterface>('/api/interface/get', {
      id: interfaceId
    });

    if (response.errcode !== 0) {
      throw new Error(`Failed to get interface: ${response.errmsg}`);
    }

    this.cache.set(cacheKey, response.data);
    return response.data;
  }

  async searchInterfaces(params: SearchApiParams): Promise<{
    list: YApiInterface[];
    count: number;
  }> {
    this.logger.info('Searching interfaces with params:', params);
    const response = await this.request<{
      list: YApiInterface[];
      count: number;
    }>('/api/interface/list', params);

    if (response.errcode !== 0) {
      throw new Error(`Failed to search interfaces: ${response.errmsg}`);
    }

    return response.data;
  }

  async createInterface(params: CreateApiParams): Promise<YApiInterface> {
    this.logger.info('Creating interface:', params.title);
    const response = await this.post<YApiInterface>('/api/interface/add', params);

    if (response.errcode !== 0) {
      throw new Error(`Failed to create interface: ${response.errmsg}`);
    }

    // Clear related cache
    this.cache.delete(`categories_${params.project_id}`);
    
    return response.data;
  }

  async updateInterface(params: UpdateApiParams): Promise<YApiInterface> {
    this.logger.info('Updating interface:', params.id);
    const response = await this.post<YApiInterface>('/api/interface/up', params);

    if (response.errcode !== 0) {
      throw new Error(`Failed to update interface: ${response.errmsg}`);
    }

    // Clear related cache
    this.cache.delete(`interface_${params.id}`);
    this.cache.delete(`categories_${params.project_id}`);
    
    return response.data;
  }

  clearCache(): void {
    this.cache.clear();
    this.logger.info('Cache cleared');
  }
}