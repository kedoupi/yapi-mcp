# YApi MCP Enhanced

<div align="center">

![Logo](https://img.shields.io/badge/YApi-MCP-blue?style=for-the-badge&logo=api&logoColor=white)

[![npm version](https://img.shields.io/npm/v/yapi-mcp-enhanced.svg?style=flat-square)](https://www.npmjs.com/package/yapi-mcp-enhanced)
[![Node.js Version](https://img.shields.io/node/v/yapi-mcp-enhanced.svg?style=flat-square)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Test Coverage](https://img.shields.io/badge/coverage-80%25-brightgreen.svg?style=flat-square)](./coverage)
[![GitHub Issues](https://img.shields.io/github/issues/kedoupi/yapi-mcp.svg?style=flat-square)](https://github.com/kedoupi/yapi-mcp/issues)
[![GitHub Stars](https://img.shields.io/github/stars/kedoupi/yapi-mcp.svg?style=flat-square)](https://github.com/kedoupi/yapi-mcp/stargazers)

**为 AI 工具量身定制的增强版 YApi MCP 服务器**

[English](./README.md) | 简体中文

让 Claude、Cursor 等 AI 工具无缝集成 YApi API 管理平台

</div>

## ✨ 特性

🔍 **智能 API 搜索** - 支持灵活过滤的接口搜索功能  
✏️ **接口管理** - 创建、读取、更新 API 接口  
🎯 **项目组织** - 管理项目和分类结构  
🚀 **增强用户体验** - 更好的错误处理和用户反馈  
⚡ **性能优化** - 智能缓存和优化请求  
🛡️ **稳定可靠** - 完善的错误处理和验证  
🌐 **多平台支持** - Claude Desktop、Cursor、Continue 等  

## 📦 快速开始

### 前提条件

- Node.js 18+ 
- YApi 服务器（需要 API 访问权限）
- YApi 项目令牌

### 安装

```bash
# 使用 npm
npm install -g yapi-mcp-enhanced

# 使用 yarn
yarn global add yapi-mcp-enhanced

# 或者克隆源码
git clone https://github.com/kedoupi/yapi-mcp.git
cd yapi-mcp
npm install
npm run build
```

### 快速配置

1. 复制环境变量模板：
```bash
cp .env.example .env
```

2. 编辑配置文件：
```bash
# YApi 配置
YAPI_BASE_URL=https://your-yapi-domain.com
YAPI_PROJECT_TOKEN=your-project-token

# 可选配置
LOG_LEVEL=info
CACHE_TTL=300
```

### 测试连接

```bash
# 测试与 YApi 服务器的连接
npx yapi-mcp test-connection

# 或源码方式
npm run build
node dist/cli.js test-connection
```

## 🔧 平台集成

### Claude Desktop

在 `claude_desktop_config.json` 中添加配置：

```json
{
  "mcpServers": {
    "yapi-mcp-enhanced": {
      "command": "npx",
      "args": ["yapi-mcp-enhanced"],
      "env": {
        "YAPI_BASE_URL": "https://your-yapi-domain.com",
        "YAPI_PROJECT_TOKEN": "your-project-token",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

**配置文件位置：**
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### Cursor IDE

1. 打开 Cursor 设置 (Cmd/Ctrl + ,)
2. 搜索 "MCP" 或转到 Extensions > MCP
3. 添加新的 MCP 服务器：

```json
{
  "name": "yapi-mcp-enhanced",
  "command": "npx",
  "args": ["yapi-mcp-enhanced"],
  "env": {
    "YAPI_BASE_URL": "https://your-yapi-domain.com",
    "YAPI_PROJECT_TOKEN": "your-project-token"
  }
}
```

### Continue (VS Code)

在 `.continue/config.json` 中配置：

```json
{
  "mcpServers": [
    {
      "name": "yapi-mcp-enhanced",
      "command": "npx",
      "args": ["yapi-mcp-enhanced"],
      "env": {
        "YAPI_BASE_URL": "https://your-yapi-domain.com",
        "YAPI_PROJECT_TOKEN": "your-project-token"
      }
    }
  ]
}
```

### Codeium

在 Codeium 设置中添加 MCP 服务器配置：

```json
{
  "mcp_servers": {
    "yapi": {
      "command": "npx",
      "args": ["yapi-mcp-enhanced"],
      "env": {
        "YAPI_BASE_URL": "https://your-yapi-domain.com",
        "YAPI_PROJECT_TOKEN": "your-project-token"
      }
    }
  }
}
```

## 🛠️ MCP 工具

服务器为 AI 交互提供以下工具：

### `yapi_get_projects`
获取可用的 YApi 项目列表

### `yapi_get_categories`  
获取指定项目的分类列表
- `project_id` (number): 项目 ID

### `yapi_get_interface`
获取特定 API 接口的详细信息
- `interface_id` (number): 接口 ID

### `yapi_search_interfaces`
使用过滤器搜索 API 接口
- `project_id` (number, 可选): 项目 ID
- `catid` (number, 可选): 分类 ID  
- `q` (string, 可选): 搜索关键词
- `page` (number, 可选): 页码
- `limit` (number, 可选): 每页结果数

### `yapi_create_interface`
创建新的 API 接口
- `title` (string): 接口名称
- `path` (string): API 端点路径
- `method` (string): HTTP 方法
- `project_id` (number): 项目 ID
- `catid` (number): 分类 ID
- 其他可选字段用于请求/响应规范

### `yapi_update_interface`
更新现有 API 接口
- `id` (number): 要更新的接口 ID
- 与 create_interface 相同的字段

### `yapi_clear_cache`
清除内部缓存以强制获取新数据

## 🚀 开发

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/kedoupi/yapi-mcp.git
cd yapi-mcp

# 安装依赖
npm install

# 开发模式（监视文件变化）
npm run dev

# 构建
npm run build

# 启动服务器
npm start
```

### 测试

```bash
# 运行所有测试
npm test

# 监视模式
npm run test:watch

# 生成覆盖率报告
npm run test:coverage

# 单元测试
npm run test:unit

# 集成测试  
npm run test:integration
```

### 代码质量

```bash
# 代码检查
npm run lint

# 自动修复
npm run lint:fix

# 清理构建产物
npm run clean
```

## 📁 项目结构

```
yapi-mcp/
├── src/
│   ├── services/          # YApi 客户端和业务逻辑
│   ├── types/            # TypeScript 类型定义
│   ├── utils/            # 工具类（日志、缓存等）
│   ├── server.ts         # MCP 服务器主文件
│   ├── config.ts         # 配置管理
│   ├── index.ts          # 入口文件
│   └── cli.ts            # 命令行工具
├── tests/
│   ├── unit/             # 单元测试
│   └── integration/      # 集成测试
├── docs/                 # 文档
└── dist/                 # 构建输出
```

## 🎯 架构设计

- **YApiClient** - YApi API 交互的 HTTP 客户端
- **MCP Server** - AI 工具集成的协议处理器  
- **缓存系统** - 性能优化的智能缓存
- **配置管理** - 基于环境变量的配置
- **错误处理** - 全面的错误管理机制

## 🤝 贡献

我们欢迎所有形式的贡献！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

详细信息请查看 [贡献指南](./CONTRIBUTING.md)。

## 📋 待办事项

- [ ] 支持更多 YApi 功能（测试用例、Mock 数据）
- [ ] 添加批量操作支持
- [ ] 实现 WebSocket 实时同步
- [ ] 支持多项目并行管理
- [ ] 添加图形化配置界面
- [ ] 支持自定义插件系统

## 🔗 相关项目

- [YApi](https://github.com/YMFE/yapi) - 可视化接口管理平台
- [Model Context Protocol](https://github.com/modelcontextprotocol) - AI 工具通信协议
- [Claude Desktop](https://claude.ai/download) - Anthropic 的桌面应用
- [Cursor](https://cursor.sh/) - AI 驱动的代码编辑器

## 📄 许可证

本项目使用 [MIT 许可证](./LICENSE)。

## 💡 问题反馈

遇到问题？欢迎提交 [Issue](https://github.com/kedoupi/yapi-mcp/issues)！

- 🐛 Bug 报告
- 💡 功能建议
- 📚 文档改进
- ❓ 使用疑问

## 🙏 致谢

感谢以下项目和社区的支持：

- YApi 团队提供的优秀 API 管理平台
- Anthropic 的 Model Context Protocol
- 所有贡献者和使用者

---

<div align="center">

**如果这个项目对你有帮助，请给我们一个 ⭐️**

Made with ❤️ by [kedoupi](https://github.com/kedoupi)

</div>