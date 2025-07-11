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
  private isLoggedIn: boolean = false;

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
    this.initializeAuth();
  }

  private async initializeAuth() {
    // 优先级：如果提供了projectToken，优先使用token认证
    if (this.config.projectToken) {
      this.logger.info('Using project token authentication');
      return;
    }
    
    // 如果没有token但有用户名密码，使用用户认证
    if (this.config.username && this.config.password) {
      this.logger.info('Using username/password authentication');
      try {
        await this.login();
      } catch (error) {
        this.logger.warn('Initial login failed, will retry on first API call');
      }
    }
  }

  private async login(): Promise<void> {
    if (this.isLoggedIn) {
      return;
    }

    this.logger.info('Attempting to login with username/password');
    
    try {
      const response = await this.http.post('/api/user/login', {
        email: this.config.username,
        password: this.config.password
      });

      if (response.data.errcode === 0) {
        this.isLoggedIn = true;
        this.logger.info('Successfully logged in to YApi');
        
        // 从响应头中提取cookie并设置到后续请求中
        const cookies = response.headers['set-cookie'];
        if (cookies) {
          const sessionCookie = cookies.join('; ');
          this.http.defaults.headers.Cookie = sessionCookie;
          this.config.sessionCookie = sessionCookie;
        }
      } else {
        throw new Error(`Login failed: ${response.data.errmsg}`);
      }
    } catch (error: any) {
      this.logger.error('Login failed:', error.message);
      throw new Error(`Failed to authenticate with YApi: ${error.message}`);
    }
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
    // 优先级：如果有token，直接使用token认证，不进行用户登录
    if (this.config.projectToken) {
      try {
        const requestParams: any = { ...params };
        requestParams.token = this.config.projectToken;

        const response = await this.http.get(endpoint, {
          params: requestParams
        });
        return response.data;
      } catch (error: any) {
        this.logger.error(`Token request failed for ${endpoint}:`, error.message);
        throw new Error(`YApi API request failed: ${error.message}`);
      }
    }

    // 如果没有token，使用用户名密码认证
    if (this.config.username && this.config.password && !this.isLoggedIn) {
      await this.login();
    }

    try {
      const requestParams: any = { ...params };

      const response = await this.http.get(endpoint, {
        params: requestParams
      });
      return response.data;
    } catch (error: any) {
      this.logger.error(`Request failed for ${endpoint}:`, error.message);
      
      // 如果是401错误且使用用户认证，尝试重新登录
      if (error.response?.status === 401 && this.config.username && this.config.password && !this.config.projectToken) {
        this.isLoggedIn = false;
        await this.login();
        
        // 重试请求
        const requestParams: any = { ...params };
        const retryResponse = await this.http.get(endpoint, { params: requestParams });
        return retryResponse.data;
      }
      
      throw new Error(`YApi API request failed: ${error.message}`);
    }
  }

  private async post<T>(endpoint: string, data?: any): Promise<YApiResponse<T>> {
    // 优先级：如果有token，直接使用token认证，不进行用户登录
    if (this.config.projectToken) {
      try {
        const requestData: any = { ...data };
        requestData.token = this.config.projectToken;

        const response = await this.http.post(endpoint, requestData);
        return response.data;
      } catch (error: any) {
        this.logger.error(`Token POST request failed for ${endpoint}:`, error.message);
        throw new Error(`YApi API request failed: ${error.message}`);
      }
    }

    // 如果没有token，使用用户名密码认证
    if (this.config.username && this.config.password && !this.isLoggedIn) {
      await this.login();
    }

    try {
      const requestData: any = { ...data };

      const response = await this.http.post(endpoint, requestData);
      return response.data;
    } catch (error: any) {
      this.logger.error(`POST request failed for ${endpoint}:`, error.message);
      
      // 如果是401错误且使用用户认证，尝试重新登录
      if (error.response?.status === 401 && this.config.username && this.config.password && !this.config.projectToken) {
        this.isLoggedIn = false;
        await this.login();
        
        // 重试请求
        const requestData: any = { ...data };
        const retryResponse = await this.http.post(endpoint, requestData);
        return retryResponse.data;
      }
      
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
    
    // 对于用户认证，先获取分组列表，然后获取每个分组的项目
    if (this.config.username && this.config.password) {
      try {
        const groupResponse = await this.request<any[]>('/api/group/list');
        if (groupResponse.errcode !== 0) {
          throw new Error(`Failed to get groups: ${groupResponse.errmsg}`);
        }
        
        const allProjects: YApiProject[] = [];
        
        // 遍历每个分组获取项目
        for (const group of groupResponse.data) {
          try {
            const projectResponse = await this.request<YApiProject[]>('/api/project/list', {
              group_id: group._id
            });
            
            if (projectResponse.errcode === 0 && projectResponse.data) {
              allProjects.push(...projectResponse.data);
            }
          } catch (error) {
            this.logger.warn(`Failed to get projects for group ${group.group_name}:`, error);
          }
        }
        
        this.cache.set(cacheKey, allProjects);
        return allProjects;
        
      } catch (error: any) {
        this.logger.warn('Failed to get projects via groups, trying direct method:', error.message);
      }
    }
    
    // 如果用户认证失败，回退到原来的方法
    try {
      const response = await this.request<YApiProject>('/api/project/get');
      
      if (response.errcode !== 0) {
        throw new Error(`Failed to get projects: ${response.errmsg}`);
      }

      // 将单个项目包装成数组格式以保持API一致性
      const projects = Array.isArray(response.data) ? response.data : [response.data];
      this.cache.set(cacheKey, projects);
      return projects;
    } catch (error: any) {
      throw new Error(`Failed to get projects: ${error.message}`);
    }
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

  async deleteInterface(interfaceId: number): Promise<boolean> {
    this.logger.info(`Deleting interface ${interfaceId}`);
    const response = await this.post<any>('/api/interface/del', {
      id: interfaceId
    });

    if (response.errcode !== 0) {
      throw new Error(`Failed to delete interface: ${response.errmsg}`);
    }

    // Clear related cache
    this.cache.delete(`interface_${interfaceId}`);
    
    return true;
  }

  async createCategory(params: { name: string; project_id: number; desc?: string }): Promise<YApiCategory> {
    this.logger.info('Creating category:', params.name);
    const response = await this.post<YApiCategory>('/api/interface/add_cat', params);

    if (response.errcode !== 0) {
      throw new Error(`Failed to create category: ${response.errmsg}`);
    }

    // Clear related cache
    this.cache.delete(`categories_${params.project_id}`);
    
    return response.data;
  }

  async getInterfaceMenu(projectId: number): Promise<any> {
    const cacheKey = `interface_menu_${projectId}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      this.logger.debug(`Returning cached interface menu for project ${projectId}`);
      return cached;
    }

    this.logger.info(`Fetching interface menu for project ${projectId}`);
    const response = await this.request<any>('/api/interface/list_menu', {
      project_id: projectId
    });

    if (response.errcode !== 0) {
      throw new Error(`Failed to get interface menu: ${response.errmsg}`);
    }

    this.cache.set(cacheKey, response.data);
    return response.data;
  }

  async listCategoryInterfaces(catid: number, page: number = 1, limit: number = 20): Promise<{
    list: YApiInterface[];
    count: number;
  }> {
    this.logger.info(`Fetching interfaces for category ${catid}`);
    const response = await this.request<{
      list: YApiInterface[];
      count: number;
    }>('/api/interface/list_cat', {
      catid,
      page,
      limit
    });

    if (response.errcode !== 0) {
      throw new Error(`Failed to get category interfaces: ${response.errmsg}`);
    }

    return response.data;
  }

  async importData(params: {
    type: string;
    project_id: number;
    catid: number;
    sync_mode: string;
    data_source: string;
  }): Promise<any> {
    this.logger.info('Importing data:', params.type);
    
    // Parse data_source if it's a JSON string
    let dataContent;
    try {
      dataContent = JSON.parse(params.data_source);
    } catch {
      // If not JSON, assume it's a URL or raw content
      dataContent = params.data_source;
    }

    const response = await this.post<any>('/api/open/import_data', {
      type: params.type,
      project_id: params.project_id,
      catid: params.catid,
      sync_mode: params.sync_mode,
      data: dataContent
    });

    if (response.errcode !== 0) {
      throw new Error(`Failed to import data: ${response.errmsg}`);
    }

    // Clear related cache
    this.cache.delete(`categories_${params.project_id}`);
    this.cache.delete(`interface_menu_${params.project_id}`);
    
    return response.data;
  }

  clearCache(): void {
    this.cache.clear();
    this.logger.info('Cache cleared');
  }
}