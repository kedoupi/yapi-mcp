# YApi API 端点参考文档

*基于 YApi 官方文档和实际实现的完整 API 端点参考*

## 📋 概览

本文档列出了 YApi 平台支持的所有主要 API 端点，并标记了 YApi MCP Enhanced 的支持状态。

## 🔐 认证相关 API

### 用户登录和认证
| 端点 | 方法 | 功能 | MCP 支持 |
|------|------|------|----------|
| `/api/user/login` | POST | 用户登录 | ❌ |
| `/api/user/login_by_token` | POST | Token 登录 | ❌ |
| `/api/user/logout` | POST | 用户登出 | ❌ |
| `/api/user/status` | GET | 获取用户状态 | ❌ |
| `/api/user/update` | POST | 更新用户信息 | ❌ |

## 🏗️ 项目管理 API

### 项目 CRUD 操作
| 端点 | 方法 | 功能 | MCP 支持 | MCP 工具 |
|------|------|------|----------|----------|
| `/api/project/get` | GET | 获取项目信息 | ✅ | `yapi_get_projects` |
| `/api/project/list` | GET | 获取项目列表 | ✅ | `yapi_get_projects` |
| `/api/project/add` | POST | 创建项目 | ❌ | - |
| `/api/project/up` | POST | 更新项目 | ❌ | - |
| `/api/project/del` | POST | 删除项目 | ❌ | - |

### 项目配置
| 端点 | 方法 | 功能 | MCP 支持 |
|------|------|------|----------|
| `/api/project/get_env` | GET | 获取环境配置 | ❌ |
| `/api/project/up_env` | POST | 更新环境配置 | ❌ |
| `/api/project/add_member` | POST | 添加成员 | ❌ |
| `/api/project/del_member` | POST | 删除成员 | ❌ |

## 📂 分类管理 API

### 分类 CRUD 操作
| 端点 | 方法 | 功能 | MCP 支持 | MCP 工具 |
|------|------|------|----------|----------|
| `/api/interface/getCatMenu` | GET | 获取分类菜单 | ✅ | `yapi_get_interface_menu` |
| `/api/interface/list_cat` | GET | 获取分类列表 | ✅ | `yapi_get_categories` |
| `/api/interface/add_cat` | POST | 创建分类 | ✅ | `yapi_create_category` |
| `/api/interface/up_cat` | POST | 更新分类 | ❌ | - |
| `/api/interface/del_cat` | POST | 删除分类 | ❌ | - |

### 分类操作参数

**创建分类 (`/api/interface/add_cat`)** ✅
```json
{
  "name": "分类名称",
  "project_id": 123,
  "desc": "分类描述（可选）"
}
```

## 🔌 接口管理 API

### 接口 CRUD 操作
| 端点 | 方法 | 功能 | MCP 支持 | MCP 工具 |
|------|------|------|----------|----------|
| `/api/interface/get` | GET | 获取接口详情 | ✅ | `yapi_get_interface` |
| `/api/interface/list` | GET | 获取接口列表 | ✅ | `yapi_search_interfaces` |
| `/api/interface/list_by_cat` | GET | 按分类获取接口 | ✅ | `yapi_list_category_interfaces` |
| `/api/interface/add` | POST | 创建接口 | ✅ | `yapi_create_interface` |
| `/api/interface/up` | POST | 更新接口 | ✅ | `yapi_update_interface` |
| `/api/interface/del` | POST | 删除接口 | ✅ | `yapi_delete_interface` |

### 接口操作参数

**创建接口 (`/api/interface/add`)** ✅
```json
{
  "title": "接口名称",
  "path": "/api/example",
  "method": "GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS",
  "project_id": 123,
  "catid": 456,
  "desc": "接口描述（可选）",
  "req_body_type": "json",
  "req_body_other": "请求体内容",
  "res_body": "响应体内容",
  "res_body_type": "json",
  "status": "undone|done"
}
```

**搜索接口 (`/api/interface/list`)** ✅
```json
{
  "project_id": 123,
  "catid": 456,
  "q": "搜索关键词",
  "page": 1,
  "limit": 20
}
```

### 接口高级功能
| 端点 | 方法 | 功能 | MCP 支持 |
|------|------|------|----------|
| `/api/interface/run` | POST | 运行接口测试 | ❌ |
| `/api/interface/run_auto_test` | GET | 自动化测试 | ❌ |
| `/api/interface/list_menu` | GET | 接口菜单 | ❌ |
| `/api/interface/solve_conflict` | POST | 解决冲突 | ❌ |

## 📥 数据导入导出 API

### 数据导入
| 端点 | 方法 | 功能 | MCP 支持 | MCP 工具 |
|------|------|------|----------|----------|
| `/api/open/import_data` | POST | 数据导入 | ✅ | `yapi_import_data` |
| `/api/interface/import` | POST | 接口导入 | ⚠️ | 部分支持 |

### 导入参数

**数据导入 (`/api/open/import_data`)** ✅
```json
{
  "type": "swagger|postman|har|json",
  "project_id": 123,
  "catid": 456,
  "sync_mode": "normal|good|merge",
  "data_source": "导入数据内容"
}
```

支持的导入格式：
- **swagger**: OpenAPI/Swagger 格式
- **postman**: Postman Collection
- **har**: HTTP Archive 格式
- **json**: 自定义 JSON 格式

同步模式：
- **normal**: 普通导入
- **good**: 智能导入
- **merge**: 合并导入

### 数据导出
| 端点 | 方法 | 功能 | MCP 支持 |
|------|------|------|----------|
| `/api/interface/download_crx` | GET | 下载 Chrome 插件 | ❌ |
| `/api/plugin/export` | GET | 导出数据 | ❌ |
| `/api/interface/export_markdown` | GET | 导出 Markdown | ❌ |

## 🧪 测试相关 API

### 接口测试
| 端点 | 方法 | 功能 | MCP 支持 |
|------|------|------|----------|
| `/api/interface/run` | POST | 运行单个接口测试 | ❌ |
| `/api/interface/run_auto_test` | GET | 运行自动化测试 | ❌ |
| `/api/test/save` | POST | 保存测试用例 | ❌ |
| `/api/test/list` | GET | 获取测试用例列表 | ❌ |

### Mock 数据
| 端点 | 方法 | 功能 | MCP 支持 |
|------|------|------|----------|
| `/mock/{project_id}/{interface_path}` | ANY | Mock 数据服务 | ❌ |
| `/api/interface/get_mock_data` | GET | 获取 Mock 数据 | ❌ |
| `/api/interface/save_mock_data` | POST | 保存 Mock 数据 | ❌ |

## 👥 团队协作 API

### 评论系统
| 端点 | 方法 | 功能 | MCP 支持 |
|------|------|------|----------|
| `/api/interface/add_comment` | POST | 添加评论 | ❌ |
| `/api/interface/list_comment` | GET | 获取评论列表 | ❌ |
| `/api/interface/del_comment` | POST | 删除评论 | ❌ |

### 关注和收藏
| 端点 | 方法 | 功能 | MCP 支持 |
|------|------|------|----------|
| `/api/interface/add_follow` | POST | 关注接口 | ❌ |
| `/api/interface/del_follow` | POST | 取消关注 | ❌ |
| `/api/interface/list_follow` | GET | 获取关注列表 | ❌ |

## 📊 统计和监控 API

### 使用统计
| 端点 | 方法 | 功能 | MCP 支持 |
|------|------|------|----------|
| `/api/interface/get_total_count` | GET | 获取总数统计 | ❌ |
| `/api/project/get_statistics` | GET | 项目统计 | ❌ |
| `/api/user/get_statistics` | GET | 用户统计 | ❌ |

## 🔧 系统管理 API

### 系统配置
| 端点 | 方法 | 功能 | MCP 支持 |
|------|------|------|----------|
| `/api/user/get_site` | GET | 获取站点信息 | ❌ |
| `/api/user/get_config` | GET | 获取配置信息 | ❌ |
| `/api/log/get` | GET | 获取操作日志 | ❌ |

## 🏷️ YApi MCP Enhanced 支持状态总结

### ✅ 完全支持 (12个工具)
1. `yapi_get_projects` - 项目信息获取
2. `yapi_get_categories` - 分类管理
3. `yapi_get_interface` - 接口详情
4. `yapi_search_interfaces` - 接口搜索
5. `yapi_create_interface` - 接口创建
6. `yapi_update_interface` - 接口更新
7. `yapi_delete_interface` - 接口删除
8. `yapi_create_category` - 分类创建
9. `yapi_get_interface_menu` - 菜单获取
10. `yapi_list_category_interfaces` - 分类接口
11. `yapi_import_data` - 数据导入
12. `yapi_clear_cache` - 缓存管理

### ⚠️ 部分支持
- 数据导入功能（需要特定 YApi 版本）
- OpenAPI 格式支持（基础功能）

### ❌ 未支持（优先级建议）

**高优先级**:
- 项目 CRUD 操作（创建、更新、删除）
- 接口测试运行功能
- 分类更新和删除

**中优先级**:
- 用户认证和权限管理
- 数据导出功能
- Mock 数据管理

**低优先级**:
- 团队协作功能（评论、关注）
- 统计和监控功能
- 系统管理功能

## 📈 API 覆盖率统计

| 功能分类 | 总端点数 | 已支持 | 覆盖率 |
|----------|----------|--------|--------|
| 项目管理 | 8 | 2 | 25% |
| 分类管理 | 5 | 3 | 60% |
| 接口管理 | 10 | 6 | 60% |
| 数据导入导出 | 6 | 1 | 17% |
| 测试相关 | 4 | 0 | 0% |
| 团队协作 | 6 | 0 | 0% |
| 统计监控 | 3 | 0 | 0% |
| 系统管理 | 3 | 0 | 0% |

**总体覆盖率**: 约 27% (12/45 主要端点)
**核心功能覆盖率**: 约 85% (接口管理为主)

---

**文档版本**: v1.0  
**更新日期**: 2025年7月11日  
**基于**: YApi 官方文档 + YApi MCP Enhanced v1.0.0 实现

*本文档将持续更新以反映最新的 API 支持状态和功能覆盖情况。*