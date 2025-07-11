import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { YApiClient } from './services/yapi-client.js';
import { Logger } from './utils/logger.js';
import { YApiConfig } from './types/index.js';

const SearchApiParamsSchema = z.object({
  project_id: z.number().optional(),
  catid: z.number().optional(),
  q: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

const CreateApiParamsSchema = z.object({
  title: z.string(),
  path: z.string(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']),
  project_id: z.number(),
  catid: z.number(),
  desc: z.string().optional(),
  req_body_type: z.string().optional(),
  req_body_other: z.string().optional(),
  res_body: z.string().optional(),
  res_body_type: z.string().optional(),
  status: z.string().optional(),
});

const UpdateApiParamsSchema = CreateApiParamsSchema.extend({
  id: z.number(),
});

export class YApiMcpServer {
  private server: Server;
  private yapiClient: YApiClient;
  private logger: Logger;

  constructor(config: YApiConfig) {
    this.logger = new Logger(config.logLevel || 'info');
    this.yapiClient = new YApiClient(config);
    
    this.server = new Server(
      {
        name: 'yapi-mcp-enhanced',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Tool[] = [
        {
          name: 'yapi_get_projects',
          description: 'Get list of available YApi projects',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'yapi_get_categories',
          description: 'Get categories for a specific project',
          inputSchema: {
            type: 'object',
            properties: {
              project_id: {
                type: 'number',
                description: 'Project ID to get categories for',
              },
            },
            required: ['project_id'],
          },
        },
        {
          name: 'yapi_get_interface',
          description: 'Get detailed information about a specific API interface',
          inputSchema: {
            type: 'object',
            properties: {
              interface_id: {
                type: 'number',
                description: 'Interface ID to retrieve',
              },
            },
            required: ['interface_id'],
          },
        },
        {
          name: 'yapi_search_interfaces',
          description: 'Search for API interfaces with various filters',
          inputSchema: {
            type: 'object',
            properties: {
              project_id: {
                type: 'number',
                description: 'Project ID to search in',
              },
              catid: {
                type: 'number',
                description: 'Category ID to filter by',
              },
              q: {
                type: 'string',
                description: 'Search query string',
              },
              page: {
                type: 'number',
                description: 'Page number (default: 1)',
                minimum: 1,
              },
              limit: {
                type: 'number',
                description: 'Number of results per page (default: 20, max: 100)',
                minimum: 1,
                maximum: 100,
              },
            },
          },
        },
        {
          name: 'yapi_create_interface',
          description: 'Create a new API interface',
          inputSchema: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Interface title/name',
              },
              path: {
                type: 'string',
                description: 'API path/endpoint',
              },
              method: {
                type: 'string',
                enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
                description: 'HTTP method',
              },
              project_id: {
                type: 'number',
                description: 'Project ID',
              },
              catid: {
                type: 'number',
                description: 'Category ID',
              },
              desc: {
                type: 'string',
                description: 'Interface description',
              },
              req_body_type: {
                type: 'string',
                description: 'Request body type',
              },
              req_body_other: {
                type: 'string',
                description: 'Request body content (JSON schema or example)',
              },
              res_body: {
                type: 'string',
                description: 'Response body content (JSON schema or example)',
              },
              res_body_type: {
                type: 'string',
                description: 'Response body type',
              },
              status: {
                type: 'string',
                description: 'Interface status',
              },
            },
            required: ['title', 'path', 'method', 'project_id', 'catid'],
          },
        },
        {
          name: 'yapi_update_interface',
          description: 'Update an existing API interface',
          inputSchema: {
            type: 'object',
            properties: {
              id: {
                type: 'number',
                description: 'Interface ID to update',
              },
              title: {
                type: 'string',
                description: 'Interface title/name',
              },
              path: {
                type: 'string',
                description: 'API path/endpoint',
              },
              method: {
                type: 'string',
                enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
                description: 'HTTP method',
              },
              project_id: {
                type: 'number',
                description: 'Project ID',
              },
              catid: {
                type: 'number',
                description: 'Category ID',
              },
              desc: {
                type: 'string',
                description: 'Interface description',
              },
              req_body_type: {
                type: 'string',
                description: 'Request body type',
              },
              req_body_other: {
                type: 'string',
                description: 'Request body content (JSON schema or example)',
              },
              res_body: {
                type: 'string',
                description: 'Response body content (JSON schema or example)',
              },
              res_body_type: {
                type: 'string',
                description: 'Response body type',
              },
              status: {
                type: 'string',
                description: 'Interface status',
              },
            },
            required: ['id', 'title', 'path', 'method', 'project_id', 'catid'],
          },
        },
        {
          name: 'yapi_delete_interface',
          description: 'Delete an API interface by ID',
          inputSchema: {
            type: 'object',
            properties: {
              interface_id: {
                type: 'number',
                description: 'Interface ID to delete',
              },
            },
            required: ['interface_id'],
          },
        },
        {
          name: 'yapi_create_category',
          description: 'Create a new API category',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Category name',
              },
              project_id: {
                type: 'number',
                description: 'Project ID',
              },
              desc: {
                type: 'string',
                description: 'Category description',
              },
            },
            required: ['name', 'project_id'],
          },
        },
        {
          name: 'yapi_get_interface_menu',
          description: 'Get interface menu list with category structure',
          inputSchema: {
            type: 'object',
            properties: {
              project_id: {
                type: 'number',
                description: 'Project ID',
              },
            },
            required: ['project_id'],
          },
        },
        {
          name: 'yapi_list_category_interfaces',
          description: 'Get interfaces within a specific category',
          inputSchema: {
            type: 'object',
            properties: {
              catid: {
                type: 'number',
                description: 'Category ID',
              },
              page: {
                type: 'number',
                description: 'Page number (default: 1)',
                minimum: 1,
              },
              limit: {
                type: 'number',
                description: 'Number of results per page (default: 20)',
                minimum: 1,
                maximum: 100,
              },
            },
            required: ['catid'],
          },
        },
        {
          name: 'yapi_import_data',
          description: 'Import interface data from external sources',
          inputSchema: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['swagger', 'postman', 'har', 'json'],
                description: 'Import data type',
              },
              project_id: {
                type: 'number',
                description: 'Target project ID',
              },
              catid: {
                type: 'number',
                description: 'Target category ID',
              },
              sync_mode: {
                type: 'string',
                enum: ['normal', 'good', 'merge'],
                description: 'Sync mode: normal (normal), good (intelligent merge), merge (completely overwrite)',
              },
              data_source: {
                type: 'string',
                description: 'Import data source (JSON string or URL)',
              },
            },
            required: ['type', 'project_id', 'catid', 'data_source'],
          },
        },
        {
          name: 'yapi_clear_cache',
          description: 'Clear the internal cache to force fresh data retrieval',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ];

      return { tools };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case 'yapi_get_projects': {
            const projects = await this.yapiClient.getProjects();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(projects, null, 2),
                },
              ],
            };
          }

          case 'yapi_get_categories': {
            const { project_id } = args as { project_id: number };
            const categories = await this.yapiClient.getCategories(project_id);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(categories, null, 2),
                },
              ],
            };
          }

          case 'yapi_get_interface': {
            const { interface_id } = args as { interface_id: number };
            const interface_data = await this.yapiClient.getInterface(interface_id);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(interface_data, null, 2),
                },
              ],
            };
          }

          case 'yapi_search_interfaces': {
            const params = SearchApiParamsSchema.parse(args);
            const result = await this.yapiClient.searchInterfaces(params);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'yapi_create_interface': {
            const params = CreateApiParamsSchema.parse(args);
            const result = await this.yapiClient.createInterface(params);
            return {
              content: [
                {
                  type: 'text',
                  text: `Interface created successfully: ${JSON.stringify(result, null, 2)}`,
                },
              ],
            };
          }

          case 'yapi_update_interface': {
            const params = UpdateApiParamsSchema.parse(args);
            const result = await this.yapiClient.updateInterface(params);
            return {
              content: [
                {
                  type: 'text',
                  text: `Interface updated successfully: ${JSON.stringify(result, null, 2)}`,
                },
              ],
            };
          }

          case 'yapi_delete_interface': {
            const { interface_id } = args as { interface_id: number };
            const success = await this.yapiClient.deleteInterface(interface_id);
            return {
              content: [
                {
                  type: 'text',
                  text: success 
                    ? `Interface ${interface_id} deleted successfully`
                    : `Failed to delete interface ${interface_id}`,
                },
              ],
            };
          }

          case 'yapi_create_category': {
            const { name, project_id, desc } = args as { name: string; project_id: number; desc?: string };
            const result = await this.yapiClient.createCategory({ name, project_id, desc });
            return {
              content: [
                {
                  type: 'text',
                  text: `Category created successfully: ${JSON.stringify(result, null, 2)}`,
                },
              ],
            };
          }

          case 'yapi_get_interface_menu': {
            const { project_id } = args as { project_id: number };
            const menu = await this.yapiClient.getInterfaceMenu(project_id);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(menu, null, 2),
                },
              ],
            };
          }

          case 'yapi_list_category_interfaces': {
            const { catid, page, limit } = args as { catid: number; page?: number; limit?: number };
            const result = await this.yapiClient.listCategoryInterfaces(catid, page, limit);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'yapi_import_data': {
            const { type, project_id, catid, sync_mode, data_source } = args as { 
              type: string; 
              project_id: number; 
              catid: number; 
              sync_mode?: string; 
              data_source: string 
            };
            const result = await this.yapiClient.importData({
              type,
              project_id,
              catid,
              sync_mode: sync_mode || 'normal',
              data_source
            });
            return {
              content: [
                {
                  type: 'text',
                  text: `Data imported successfully: ${JSON.stringify(result, null, 2)}`,
                },
              ],
            };
          }

          case 'yapi_clear_cache': {
            this.yapiClient.clearCache();
            return {
              content: [
                {
                  type: 'text',
                  text: 'Cache cleared successfully',
                },
              ],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error: any) {
        this.logger.error(`Tool execution error for ${request.params.name}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    this.logger.info('YApi MCP Server running on stdio');
  }

  getServer() {
    return this.server;
  }
}