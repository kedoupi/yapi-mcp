# YApi MCP Enhanced

An enhanced Model Context Protocol (MCP) server for YApi that provides AI tools with seamless access to API documentation management.

## Features

🔍 **Smart API Search** - Search interfaces with flexible filtering
✏️ **Interface Management** - Create, read, and update API interfaces
🎯 **Project Organization** - Manage projects and categories
🚀 **Enhanced UX** - Better error handling and user feedback
⚡ **Performance** - Intelligent caching and optimized requests
🛡️ **Reliability** - Robust error handling and validation

## Quick Start

### Prerequisites

- Node.js 18+ 
- YApi server with API access
- YApi project token

### Installation

```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Edit configuration
vim .env
```

### Configuration

Set the following environment variables in `.env`:

```bash
YAPI_BASE_URL=https://your-yapi-domain.com
YAPI_PROJECT_TOKEN=your-project-token
LOG_LEVEL=info
CACHE_TTL=300
```

### Usage

#### As MCP Server

```bash
# Build and run
npm run build
npm start
```

#### As CLI Tool

```bash
# Test connection
npm run build
node dist/cli.js test-connection

# Start server
node dist/cli.js start
```

#### Development Mode

```bash
# Watch mode
npm run dev
```

## MCP Tools

The server provides the following tools for AI interaction:

### `yapi_get_projects`
Get list of available YApi projects.

### `yapi_get_categories`
Get categories for a specific project.
- `project_id` (number): Project ID

### `yapi_get_interface`
Get detailed information about a specific API interface.
- `interface_id` (number): Interface ID

### `yapi_search_interfaces`
Search for API interfaces with filters.
- `project_id` (number, optional): Project ID
- `catid` (number, optional): Category ID  
- `q` (string, optional): Search query
- `page` (number, optional): Page number
- `limit` (number, optional): Results per page

### `yapi_create_interface`
Create a new API interface.
- `title` (string): Interface name
- `path` (string): API endpoint path
- `method` (string): HTTP method
- `project_id` (number): Project ID
- `catid` (number): Category ID
- Additional optional fields for request/response specs

### `yapi_update_interface`
Update an existing API interface.
- `id` (number): Interface ID to update
- Same fields as create_interface

### `yapi_clear_cache`
Clear internal cache to force fresh data retrieval.

## Integration

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "yapi-mcp-enhanced": {
      "command": "node",
      "args": ["/path/to/yapi-mcp-enhanced/dist/index.js"],
      "env": {
        "YAPI_BASE_URL": "https://your-yapi-domain.com",
        "YAPI_PROJECT_TOKEN": "your-project-token"
      }
    }
  }
}
```

### Cursor IDE

Configure in your workspace settings.

## Development

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build
npm run build

# Lint
npm run lint

# Test connection
npm run build && node dist/cli.js test-connection
```

## Architecture

- **YApiClient** - HTTP client for YApi API interactions
- **MCP Server** - Protocol handler for AI tool integration  
- **Caching** - Intelligent caching for performance
- **Configuration** - Environment-based configuration
- **Error Handling** - Comprehensive error management

## License

MIT