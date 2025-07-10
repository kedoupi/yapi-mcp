# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Core development workflow
npm run dev                    # Watch mode development with auto-reload
npm run build                  # TypeScript compilation to dist/
npm start                      # Start MCP server (requires build first)

# Testing commands
npm test                       # Run all tests (unit + integration)
npm run test:watch            # Run tests in watch mode
npm run test:coverage         # Generate coverage report (target: 80%+)
npm run test:unit             # Run only unit tests
npm run test:integration      # Run only integration tests

# Code quality
npm run lint                  # ESLint code checking
npm run lint:fix             # Auto-fix linting issues
npm run clean                # Clean build artifacts

# Utility commands
node dist/cli.js test-connection  # Test YApi connectivity (after build)
npx yapi-mcp-enhanced test-connection  # Test if installed globally
```

## Architecture Overview

### MCP Server Architecture
- **Entry Point**: `src/index.ts` handles process lifecycle and signal management
- **MCP Server Core**: `src/server.ts` defines 7 MCP tools and protocol handling
- **CLI Interface**: `src/cli.ts` provides command-line operations
- **Configuration**: `src/config.ts` manages environment-based configuration with validation

### Key Components

**YApiClient (`src/services/yapi-client.ts`)**:
- HTTP client wrapper for YApi API interactions
- Built-in caching with configurable TTL (default 5 minutes)
- Axios-based with request/response interceptors
- Comprehensive error handling and logging

**Cache System (`src/utils/cache.ts`)**:
- Simple in-memory TTL cache implementation
- Automatic cleanup of expired entries
- Cache keys follow pattern: `${method}:${url}:${JSON.stringify(params)}`

**Configuration Management**:
- Environment variable driven with `.env` support
- Runtime validation for all config values
- Required: `YAPI_BASE_URL`, `YAPI_PROJECT_TOKEN`
- Optional: `LOG_LEVEL` (debug/info/warn/error), `CACHE_TTL` (seconds)

### MCP Tools Registration
The server registers 7 tools in `src/server.ts`:
1. `yapi_get_projects` - List available projects
2. `yapi_get_categories` - Get project categories  
3. `yapi_get_interface` - Get specific interface details
4. `yapi_search_interfaces` - Search with filtering
5. `yapi_create_interface` - Create new API interface
6. `yapi_update_interface` - Update existing interface
7. `yapi_clear_cache` - Force cache invalidation

Each tool uses Zod schemas for parameter validation and comprehensive error handling.

## Testing Architecture

### Test Structure
- **Unit Tests** (`tests/unit/`): Test individual components in isolation
- **Integration Tests** (`tests/integration/`): Test complete workflows with HTTP mocking
- **Coverage Goals**: 80% statements, 75% branches, 80% functions

### Key Testing Patterns
- **HTTP Mocking**: Uses `nock` library for API response simulation
- **Environment Isolation**: Each test manages its own environment variables
- **Cache Testing**: Integration tests verify cache behavior with real timeouts
- **Error Scenarios**: Comprehensive testing of failure modes and edge cases

### Running Specific Tests
```bash
# Test specific file
npx jest tests/unit/utils/logger.test.ts

# Test with pattern matching
npx jest --testNamePattern="should cache"

# Verbose output with coverage
npx jest --coverage --verbose
```

## Configuration Patterns

### Environment Setup
```bash
# Copy template
cp .env.example .env

# Required configuration
YAPI_BASE_URL=https://your-yapi-domain.com
YAPI_PROJECT_TOKEN=your-project-token

# Optional settings
LOG_LEVEL=info                 # debug|info|warn|error
CACHE_TTL=300                 # Cache TTL in seconds (0-3600)
```

### MCP Integration Configuration
For AI tools (Claude Desktop, Cursor, etc.), the server is configured as:
```json
{
  "command": "npx",
  "args": ["yapi-mcp-enhanced"],
  "env": {
    "YAPI_BASE_URL": "https://your-yapi-domain.com",
    "YAPI_PROJECT_TOKEN": "your-project-token"
  }
}
```

## Code Patterns

### Error Handling
- All API calls wrapped in try-catch with specific error types
- YApi API errors distinguished from network errors
- Comprehensive logging at appropriate levels
- Cache failures are non-fatal (fall back to direct API calls)

### Type Safety
- Complete TypeScript coverage with strict mode
- Zod schemas for runtime validation of MCP tool parameters
- Interface definitions in `src/types/index.ts` for all YApi data structures
- No `any` types in production code

### Performance Considerations
- Intelligent caching reduces API load and improves response times
- Cache keys include all relevant parameters to ensure correctness
- TTL-based expiration prevents stale data
- HTTP client reuses connections and includes appropriate timeouts

## Build System

### TypeScript Configuration
- **Target**: ES2022 with Node.js 18+ compatibility
- **Module**: ESNext with `.js` extensions for imports
- **Output**: `dist/` directory with source maps
- **Strict Mode**: Enabled with comprehensive type checking

### ESM Module Structure
- All imports use `.js` extensions (TypeScript to JavaScript mapping)
- Package.json configured with `"type": "module"`
- Jest configured for ESM with ts-jest transformation

When adding new functionality:
1. Define types in `src/types/` first
2. Add comprehensive error handling
3. Include caching logic where appropriate
4. Write both unit and integration tests
5. Update tool registration in `src/server.ts` if adding MCP tools
6. Follow existing logging patterns for debugging