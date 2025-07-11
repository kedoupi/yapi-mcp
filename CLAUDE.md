# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Model Context Protocol (MCP) server for YApi that enables AI tools like Claude Desktop and Cursor to interact with YApi API management platform. The server supports dual authentication methods and provides comprehensive API management capabilities.

## Core Commands

### Development
```bash
# Install dependencies
npm install

# Development with file watching
npm run dev

# Build the project
npm run build

# Start the server
npm start

# Clean build artifacts
npm run clean
```

### Testing
```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Test coverage report
npm run test:coverage

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration
```

### Code Quality
```bash
# Lint TypeScript code
npm run lint

# Fix linting issues automatically
npm run lint:fix
```

### Authentication Testing
```bash
# Test user authentication
YAPI_BASE_URL=http://localhost:40001 YAPI_USERNAME=user@example.com YAPI_PASSWORD=password npx tsx tests/auth-test.ts

# Test authentication priority (token vs user)
npx tsx tests/auth-priority-test.ts
```

## Architecture

### Core Components

**YApiMcpServer** (`src/server.ts`)
- Main MCP server implementation using `@modelcontextprotocol/sdk`
- Handles tool registration and request routing
- Integrates with YApiClient for API operations

**YApiClient** (`src/services/yapi-client.ts`)
- HTTP client for YApi API interactions using axios
- Implements dual authentication system with priority logic:
  1. **Priority 1**: Project token authentication (`YAPI_PROJECT_TOKEN`)
  2. **Priority 2**: User authentication (`YAPI_USERNAME` + `YAPI_PASSWORD`)
- Features smart caching, session management, and 401 retry logic

**Configuration System** (`src/config.ts`)
- Environment-based configuration loading
- Validates authentication requirements (either token OR username+password)
- Supports flexible configuration options

### Authentication Architecture

The system supports two authentication methods with clear priority:

1. **Token Authentication** (Higher Priority)
   - Uses `YAPI_PROJECT_TOKEN` in API requests
   - Direct API access without session management
   - Bypasses user authentication even when credentials are provided

2. **User Authentication** (Fallback)
   - Uses `YAPI_USERNAME` and `YAPI_PASSWORD`
   - Performs login via `/api/user/login` endpoint
   - Manages session cookies for subsequent requests
   - Provides access to user-level APIs (groups, cross-project operations)

### Data Flow

```
AI Tool → MCP Protocol → YApiMcpServer → YApiClient → YApi Server
                                      ↓
                                   Cache Layer
```

## Configuration

### Environment Variables
```bash
# Required - YApi server URL
YAPI_BASE_URL=https://your-yapi-domain.com

# Authentication (choose one method)
# Method 1: Project Token (higher priority)
YAPI_PROJECT_TOKEN=your_project_token

# Method 2: User credentials (lower priority, enables more APIs)
YAPI_USERNAME=user@example.com
YAPI_PASSWORD=password

# Optional settings
LOG_LEVEL=info|debug|warn|error
CACHE_TTL=300
```

### MCP Server Configuration
For AI tools, configure the MCP server with:
```json
{
  "command": "npx",
  "args": ["@kedoupi/yapi-mcp"],
  "env": {
    "YAPI_BASE_URL": "https://your-yapi.com",
    "YAPI_PROJECT_TOKEN": "token_or_username_password"
  }
}
```

## Available Tools

The MCP server exposes these tools for AI interaction:

- `yapi_get_projects` - List available projects
- `yapi_get_categories` - Get project categories  
- `yapi_get_interface` - Get API interface details
- `yapi_search_interfaces` - Search APIs with filters
- `yapi_create_interface` - Create new API interface
- `yapi_update_interface` - Update existing interface
- `yapi_delete_interface` - Delete interface
- `yapi_create_category` - Create new category
- `yapi_clear_cache` - Clear internal cache

## Testing Strategy

### Test Structure
- **Unit Tests** (`tests/unit/`): Component-level testing with mocks
- **Integration Tests** (`tests/integration/`): Real API interaction tests
- **Authentication Tests** (`tests/`): Authentication system validation

### Key Test Files
- `auth-test.ts` - Authentication system testing
- `auth-priority-test.ts` - Validates token vs user auth priority

### Running Tests with Real Environment
Most tests support real environment testing:
```bash
YAPI_BASE_URL=http://localhost:40001 YAPI_USERNAME=user@example.com YAPI_PASSWORD=password npm test
```

## Key Implementation Details

### Authentication Priority Logic
When both token and user credentials are provided, the system:
1. Always uses token authentication first
2. Logs "Using project token authentication"
3. Never attempts user login
4. This ensures predictable behavior and optimal performance

### Caching Strategy
- **Memory-based caching** with configurable TTL (default 5 minutes)
- **Cache invalidation** on write operations (create, update, delete)
- **Smart cache keys** per resource type and project

### Error Handling
- **Comprehensive error catching** with user-friendly messages
- **401 retry logic** for user authentication sessions
- **Graceful fallbacks** between authentication methods

### Project Structure
- `src/` - Main source code organized by component type
  - `services/` - YApi HTTP client and API interaction logic
  - `types/` - TypeScript interface definitions
  - `utils/` - Shared utilities (logger, cache)
- `tests/` - Test suite with unit, integration, and authentication tests
- `docs/` - Core documentation including API reference
- `dist/` - Compiled JavaScript output

## Development Notes

### Code Organization
The codebase follows a modular structure:
- **MCP Server** (`server.ts`) - Protocol handler and tool registration
- **YApi Client** (`services/yapi-client.ts`) - HTTP client with dual authentication
- **Configuration** (`config.ts`) - Environment-based config with validation
- **Types** (`types/index.ts`) - Comprehensive TypeScript definitions

### Authentication Implementation
The dual authentication system supports:
1. **Project Token** - Direct API access (higher priority)
2. **User Credentials** - Session-based access (more API coverage)

When both are provided, token authentication is always used for predictable behavior.

### Key Features
- **Smart Caching** - Memory cache with TTL and invalidation
- **Error Handling** - Comprehensive error catching with 401 retry logic
- **Type Safety** - Full TypeScript coverage with Zod validation
- **Testing** - Unit, integration, and authentication test coverage

### Working with Tests
Authentication tests provide examples of expected behavior:
- `auth-test.ts` - Demonstrates user authentication flow
- `auth-priority-test.ts` - Shows token vs user authentication priority

Always test both authentication methods when making changes to the authentication system.