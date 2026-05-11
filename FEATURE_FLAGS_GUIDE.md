# AntiGrind 特性开关使用指南

## 🎯 快速开始

### 1. 查看当前特性状态

访问 API 端点查看所有特性的启用状态：

```bash
# 查看所有特性
GET http://localhost:8000/api/features/

# 查看特定特性
GET http://localhost:8000/api/features/admin_dashboard

# 仅查看启用的特性
GET http://localhost:8000/api/features/enabled/list

# 仅查看禁用的特性
GET http://localhost:8000/api/features/disabled/list
```

### 2. 修改特性配置

#### 方法一：直接编辑配置文件（推荐用于开发环境）

```bash
# 复制示例配置文件
cp feature_flags.example.json feature_flags.local.json

# 编辑配置文件，修改 enabled 字段
{
  "version": "1.0.0",
  "features": {
    "admin_dashboard": {
      "enabled": false,  // 改为 false 禁用该功能
      "description": "管理后台面板",
      "category": "admin"
    }
  }
}

# 重启后端服务使配置生效
```

#### 方法二：使用环境变量覆盖（适用于生产环境）

在 `.env` 文件中添加：

```bash
# 禁用特定功能
FEATURE_ADMIN_DASHBOARD=false
FEATURE_PERFORMANCE_MONITORING=true

# 启用基础设施功能（需要相应服务）
FEATURE_REDIS_CACHE=true
FEATURE_NEO4J_GRAPH=true
```

### 3. 在代码中使用特性开关

#### 后端 (Python/FastAPI)

**基本用法：**

```python
from app.feature_flags import feature_flags, require_feature

# 方式 1：检查特性是否启用
if feature_flags.is_enabled('admin_dashboard'):
    # 执行管理员面板相关逻辑
    pass

# 方式 2：使用装饰器保护路由
@require_feature('analytics_dashboard')
async def get_analytics():
    # 如果 analytics_dashboard 未启用，自动返回 503 错误
    return {"data": [...]}

# 方式 3：获取特性信息
info = feature_flags.get_feature_info('dark_mode')
print(info)  # {'enabled': True, 'description': '暗黑模式主题', 'category': 'ui'}
```

**条件执行示例：**

```python
from app.feature_flags import feature_flags

async def get_company_data(company_id: int):
    base_query = "SELECT * FROM companies WHERE id = :id"

    # 如果启用了性能监控，添加查询日志
    if feature_flags.is_enabled('performance_monitoring'):
        start_time = time.time()
        result = await db.execute(base_query, {"id": company_id})
        duration = time.time() - start_time
        logger.info(f"Query took {duration:.2f}s")
    else:
        result = await db.execute(base_query, {"id": company_id})

    return result
```

#### 前端 (React/TypeScript)

**使用 React Hooks：**

```tsx
import { useFeatureFlag, useFeatureFlags, FeatureGate } from '../utils/featureFlags';

function AdminPanel() {
  const isAdminEnabled = useFeatureFlag('admin_dashboard');

  if (!isAdminEnabled) {
    return <div>功能开发中...</div>;
  }

  return (
    <div>
      <h1>管理后台</h1>
      {/* 管理面板内容 */}
    </div>
  );
}
```

**检查多个特性：**

```tsx
function Dashboard() {
  const flags = useFeatureFlags(['analytics_dashboard', 'report_export', 'dark_mode']);

  return (
    <div className={flags.dark_mode ? 'dark-theme' : 'light-theme'}>
      <h1>仪表盘</h1>

      {flags.analytics_dashboard && <AnalyticsWidget />}
      {flags.report_export && <ExportButton />}

      {!flags.report_export && (
        <span style={{color: 'gray'}}>报告导出功能即将上线</span>
      )}
    </div>
  );
}
```

**使用 FeatureGate 组件：**

```tsx
import { FeatureGate } from '../utils/featureFlags';

function App() {
  return (
    <div>
      {/* 始终显示的内容 */}

      <FeatureGate featureName="qa_system">
        <QAModule />
      </FeatureGate>

      <FeatureGate
        featureName="mobile_app_support"
        fallback={<div>移动端版本即将推出</div>}
      >
        <MobileAppPromo />
      </FeatureGate>
    </div>
  );
}
```

**服务方式调用（非组件内）：**

```typescript
import { featureFlags } from '../utils/featureFlags';

// 在任何地方使用
async function fetchData() {
  if (featureFlags.isEnabled('redis_cache')) {
    // 从缓存获取数据
    return await cache.get('data');
  } else {
    // 直接从数据库查询
    return await db.query('SELECT ...');
  }
}
```

## 📋 特性分类说明

### 核心功能 (core)
- `authentication` - 用户认证系统 ⚠️ **必需**
- `company_management` - 公司信息管理
- `work_hours_tracking` - 工时记录与追踪
- `certification_system` - 反内卷认证系统
- `ranking_system` - 公司排名系统

### 扩展功能
- `attendance_checkin` - 员工考勤打卡
- `evidence_upload` - 证据上传与管理
- `scan_verification` - 扫码验证功能
- `qa_system` - 问答系统

### 管理功能 (admin)
- `admin_dashboard` - 管理后台面板
- `analytics_dashboard` - 数据分析仪表盘
- `report_export` - 报告导出功能

### 安全功能 (security)
- `captcha_verification` - 验证码验证
- `rate_limiting` - API 限流保护

### 基础设施 (infrastructure)
⚠️ 这些功能需要相应的服务运行：

- `redis_cache` - Redis 缓存支持
  - 需要启动 Redis 服务
  - 配置 REDIS_URL 环境变量
- `neo4j_graph` - Neo4j 图数据库集成
  - 需要启动 Neo4j 服务
  - 配置 NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD
- `meilisearch_search` - Meilisearch 全文搜索引擎
  - 需要启动 Meilisearch 服务
  - 配置 MEILISEARCH_URL
- `minio_storage` - MinIO 对象存储
  - 需要启动 MinIO 服务
  - 配置 MINIO_ENDPOINT, MINIO_ACCESS_KEY 等

### UI/UX 功能
- `i18n_support` - 国际化支持（中英文）
- `search_suggestions` - 搜索建议功能
- `dark_mode` - 暗黑模式主题
- `virtual_scroll` - 虚拟滚动列表优化
- `mobile_app_support` - 移动端应用支持
- `performance_monitoring` - 性能监控中间件

## 🔧 常见场景示例

### 场景 1：禁用管理员后台（节省资源）

编辑 `feature_flags.local.json`：

```json
{
  "features": {
    "admin_dashboard": { "enabled": false },
    "analytics_dashboard": { "enabled": false },
    "report_export": { "enabled": false }
  }
}
```

重启后端服务后，访问 `/api/admin/*` 路由将返回 503 功能不可用。

### 场景 2：仅启用核心功能（最小化部署）

```json
{
  "features": {
    "authentication": { "enabled": true },
    "company_management": { "enabled": true },
    "work_hours_tracking": { "enabled": true },
    "certification_system": { "enabled": true },
    "ranking_system": { "enabled": true },

    "attendance_checkin": { "enabled": false },
    "evidence_upload": { "enabled": false },
    "scan_verification": { "enabled": false },
    "qa_system": { "enabled": false },

    "admin_dashboard": { "enabled": false },
    "analytics_dashboard": { "enabled": false },
    "report_export": { "enabled": false },

    "redis_cache": { "enabled": false },
    "neo4j_graph": { "enabled": false },
    "meilisearch_search": { "enabled": false },
    "minio_storage": { "enabled": false }
  }
}
```

### 场景 3：启用全部基础设施（完整部署）

确保已启动 Docker Compose 中的所有服务：

```bash
docker-compose up -d db redis neo4j meilisearch minio
```

然后修改配置：

```json
{
  "features": {
    "redis_cache": { "enabled": true },
    "neo4j_graph": { "enabled": true },
    "meilisearch_search": { "enabled": true },
    "minio_storage": { "enabled": true },
    "performance_monitoring": { "enabled": true }
  }
}
```

### 场景 4：渐进式发布新功能

假设你要上线一个新的实验性功能：

**步骤 1**：先在代码中实现功能，但默认禁用

```json
{
  "features": {
    "new_experimental_feature": { "enabled": false }
  }
}
```

**步骤 2**：为内部测试人员启用

创建 `feature_flags.testers.json`：

```json
{
  "features": {
    "new_experimental_feature": { "enabled": true }
  }
}
```

**步骤 3**：逐步向更多用户开放

根据反馈决定是否全面启用或回滚。

## 🚨 最佳实践

### 1. 不要硬编码特性检查

❌ **错误做法**：
```python
if os.environ.get('ENABLE_ADMIN') == 'true':
    admin_logic()
```

✅ **正确做法**：
```python
if feature_flags.is_enabled('admin_dashboard'):
    admin_logic()
```

### 2. 为新功能添加特性开关

开发新功能时，始终考虑添加特性开关：

```python
@router.post("/api/new-feature")
@require_feature('new_feature_name')
async def new_feature_endpoint(request: Request):
    # 实现新功能
    pass
```

前端组件：

```tsx
<FeatureGate featureName="new_feature_name">
  <NewFeatureComponent />
</FeatureGate>
```

### 3. 使用有意义的命名

好的特性名称应该清晰表达功能的用途：

✅ **好的命名**：
- `analytics_dashboard`
- `two_factor_authentication`
- `advanced_search_filters`

❌ **不好的命名**：
- `feature1`
- `new_stuff`
- `flag_abc123`

### 4. 记录禁用的原因

当禁用一个功能时，在代码注释中说明原因：

```python
# TODO: 性能优化完成后重新启用 (Issue #456)
if feature_flags.is_enabled('real_time_notifications'):
    send_realtime_notification(user, message)
else:
    # 降级为邮件通知
    send_email_notification(user, message)
```

### 5. 定期清理废弃的特性开关

每个版本发布时，审查并移除不再需要的特性开关。

## 🐛 故障排查

### 问题：特性开关不生效

**检查清单**：
1. ✅ 配置文件路径正确
2. ✅ JSON 格式无误（注意逗号、引号）
3. ✅ 已重启后端服务
4. ✅ 特性名称拼写正确
5. ✅ 没有被其他配置覆盖

**调试命令**：

```bash
# 检查后端加载的配置
curl http://localhost:8000/api/features/ | python -m json.tool

# 查看后端日志中的警告信息
grep -i "feature" logs/app.log
```

### 问题：前端特性状态不同步

**解决方案**：
1. 清除浏览器缓存
2. 检查网络请求 `/api/features/` 是否成功
3. 确认后端服务正常运行

## 📚 相关文档

- [VERSION_MANAGEMENT.md](./VERSION_MANAGEMENT.md) - 版本管理策略
- [feature_flags.example.json](./feature_flags.example.json) - 配置文件示例
- [backend/app/feature_flags.py](./backend/app/feature_flags.py) - 后端实现
- [frontend/src/utils/featureFlags.ts](./frontend/src/utils/featureFlags.ts) - 前端实现

---

**最后更新**: 2026-05-11
**适用版本**: v0.1.0+
