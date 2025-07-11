# YApi MCP Enhanced 文档中心

YApi MCP Enhanced 项目的技术文档集合，提供完整的API参考和开发指南。

## 📚 文档导航

### 🚀 快速开始
- [项目主页](../README.md) - 项目概述和快速安装
- [开发指南](../CLAUDE.md) - Claude Code 完整工作指南

### 🔌 API 参考
- [YApi 端点参考](./api/yapi-endpoints-reference.md) - 完整的 YApi API 端点文档
  - 45+ YApi API 端点详细说明
  - MCP 工具支持状态标记
  - 请求参数和响应格式

## 📁 目录结构
```
docs/
├── README.md                          # 本文档索引
└── api/                              # API 参考文档
    └── yapi-endpoints-reference.md  # YApi 端点参考
```

## 🎯 核心功能

### MCP 工具支持
项目提供以下 MCP 工具：
- `yapi_get_projects` - 获取项目列表
- `yapi_get_categories` - 获取分类列表
- `yapi_get_interface` - 获取接口详情
- `yapi_search_interfaces` - 搜索接口
- `yapi_create_interface` - 创建接口
- `yapi_update_interface` - 更新接口
- `yapi_delete_interface` - 删除接口
- `yapi_create_category` - 创建分类
- `yapi_import_data` - 导入数据
- `yapi_clear_cache` - 清除缓存

### 认证支持
- **项目Token认证**: 使用 `YAPI_PROJECT_TOKEN`（优先级更高）
- **用户认证**: 使用 `YAPI_USERNAME` + `YAPI_PASSWORD`（支持更多API）

## 🛠️ 开发参考

### 配置方式
```bash
# 方式1: Token认证（推荐）
YAPI_BASE_URL=https://your-yapi.com
YAPI_PROJECT_TOKEN=your_token

# 方式2: 用户认证（更多功能）
YAPI_BASE_URL=https://your-yapi.com
YAPI_USERNAME=user@example.com
YAPI_PASSWORD=password
```

### 测试命令
```bash
# 单元测试
npm run test:unit

# 集成测试
npm run test:integration

# 认证测试
npx tsx tests/auth-test.ts
```

## 📞 获取帮助

- **GitHub Issues**: [项目问题追踪](https://github.com/kedoupi/yapi-mcp/issues)
- **项目文档**: [完整文档](../README.md)

---

**最后更新**: 2025年7月11日