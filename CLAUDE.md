# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a YApi MCP (Model Context Protocol) server project that enables AI tools to interact with YApi API management platform. The goal is to provide optimized functionality compared to existing solutions.

## Development Commands

Since this is a new project, the following commands will be added as the project develops:

```bash
# Development setup (to be implemented)
npm install

# Build (to be implemented)
npm run build

# Run in development mode (to be implemented)
npm run dev

# Testing (to be implemented)
npm test

# Linting (to be implemented)
npm run lint
```

## Architecture Guidelines

### MCP Server Structure
- Keep the MCP server focused and lightweight
- Implement core YApi operations: search, create, update interfaces
- Follow MCP protocol specifications for tools and resources

### Key Components (to be implemented)
1. **YApi Client** - HTTP client for YApi API interactions
2. **MCP Tools** - Exposed functions for AI interaction
3. **Configuration** - Environment-based YApi connection settings
4. **Error Handling** - Robust error management for network and API issues

### Design Principles
- Prioritize simplicity over complexity
- Focus on practical everyday use cases
- Maintain clear separation between YApi API logic and MCP protocol handling
- Implement proper TypeScript types for YApi data structures

## YApi Integration Notes

### Required Configuration
- YApi base URL
- Project tokens for authentication
- Support for multiple YApi projects

### Core Operations to Implement
- Interface search and retrieval
- Interface creation and updates
- Project and category management
- Mock data handling

## Development Notes

This project aims to optimize existing YApi MCP solutions by focusing on:
- Better error handling and user feedback
- Simplified configuration
- Enhanced stability and reliability
- Improved user experience for common operations