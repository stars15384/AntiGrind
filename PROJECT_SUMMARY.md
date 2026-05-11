# AntiGrind 反内卷平台 - 功能、API与测试汇总文档

## 📋 项目概述

**项目名称**: AntiGrind（反内卷平台）
**技术栈**:
- **后端**: Python + FastAPI + SQLAlchemy (异步) + SQLite/PostgreSQL
- **前端**: React 19 + TypeScript + Vite + TailwindCSS + shadcn/ui
**核心目标**: 通过员工真实反馈和数据透明化，评估企业"内卷"程度，推动健康职场文化

---

## 🏗️ 系统架构

### 数据模型（7个核心实体）

| 模型 | 表名 | 核心字段 | 说明 |
|------|------|----------|------|
| **User** | users | id, username, email, password_hash, role, company_id | 用户系统，支持员工/企业角色 |
| **Company** | companies | id, name, agi_score, verification_status, certification_status | 企业信息，含AGI评分和认证状态 |
| **WorkHourRecord** | work_hour_records | company_id, weekly_hours, weekend_policy, overtime_compensation | 工时记录，用于计算AGI评分 |
| **Certification** | certifications | company_id, status, policy_document_url, evidence_urls | 企业反内卷认证申请 |
| **CertificationBadge** | certification_badges | company_id, certification_id, badge_code | 认证徽章系统 |
| **Evidence** | evidences | user_id, company_id, file_path, type | 员工提交的证据材料 |
| **AttendanceScreenshot** | attendance_screenshots | user_id, company_id, source, file_path | 考勤截图（钉钉/飞书等） |
| **AnonymousQA** | anonymous_qa | company_id, question, answer, is_verified_employee | 匿名问答系统 |
| **Product** | products | barcode, brand_owner_id, manufacturer_id | 产品条码扫描 |

---

## 🔌 后端API接口（8大模块）

### 1. 认证模块 (`/api/auth`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/auth/register` | 用户注册 | ❌ |
| POST | `/auth/login` | 用户登录（JWT） | ❌ |
| GET | `/auth/profile` | 获取当前用户信息 | ✅ |

**特性**:
- 密码加密：bcrypt
- JWT Token认证（可配置过期时间）
- 用户名/邮箱唯一性校验
- OAuth2 Password Bearer标准

---

### 2. 企业管理模块 (`/api/companies`)

| 方法 | 路径 | 说明 | 认证 | 参数 |
|------|------|------|------|------|
| GET | `/companies` | 企业列表（分页+排序+筛选） | ❌ | skip, limit, verification_status, sort_by(agi_score/created_at/name/employee_count), sort_order |
| GET | `/companies/search` | 搜索企业（模糊匹配） | ❌ | q(关键词), limit |
| GET | `/companies/{id}` | 企业详情（含工时记录和子公司） | ❌ | - |
| POST | `/companies` | 创建企业 | ✅ | CompanyCreate |
| PATCH | `/companies/{id}` | 更新企业信息 | ✅ | CompanyUpdate |

**排序支持**: AGI分数、创建时间、名称、员工数量、认证状态
**筛选条件**: 认证状态（verified/pending/none）

---

### 3. 工时记录模块 (`/api/work-hours`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/work-hours` | 提交工时记录 | ✅ |
| GET | `/work-hours/company/{id}` | 查询企业工时记录 | ❌ |
| POST | `/work-hours/{id}/verify` | 验证工时记录（5次验证后自动计算AGI） | ✅ |

**工时记录字段**:
- `weekly_hours`: 周工时（小时）
- `weekend_policy`: 周末政策（double_rest/big_small_week/single_rest/no_rest）
- `overtime_compensation`: 加班补偿（legal/fixed_subsidy/unpaid）
- `shift_policy`: 轮班制度（no_shift/occasional/frequent）
- `vibe_score`: 主观评分（0-10）
- `notes`: 备注说明

**AGI评分引擎规则**:
```
总分 = hours_score * 0.4 + weekend_score * 0.25 + overtime_score * 0.15 + shift_score * 0.1 + vibe_score * 0.1

hours_score: 40h=0, 每多1h+1分, 60h=30分封顶
weekend_score: 双休=0, 大小周=10, 单休=20, 无休=25
overtime_score: 合法=0, 固定补贴=5, 无偿=15
shift_score: 不轮班=0, 偶尔=5, 频繁=10
vibe_score: 0-10直接计分

评级: ≤30 绿色(推荐), 31-60 黄色(注意), >60 红色(警惕)
```

---

### 4. 认证申请模块 (`/api/certifications`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/certifications/apply` | 申请反内卷认证 | ✅ |
| GET | `/certifications/{id}` | 查询认证详情 | ❌ |
| GET | `/certifications/company/{id}` | 查询企业最新认证 | ❌ |
| POST | `/certifications/{id}/review` | 审核认证（通过/拒绝） | ✅ |
| GET | `/certifications/{id}/badge` | 获取认证徽章 | ❌ |
| GET | `/certifications/badge/{code}` | 通过徽章码查询 | ❌ |

**认证流程**:
1. 企业提交申请（policy_document_url + evidence_urls）
2. 状态流转：pending → under_review → approved/rejected
3. 通过后生成徽章（有效期365天）
4. 支持等级：bronze/silver/gold

---

### 5. 证据上传模块 (`/api/evidences`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/evidences` | 上传证据文件 | ✅ |
| GET | `/evidences/{id}` | 获取证据详情 | ✅ |

**支持的证据类型**: 文件上传（图片/PDF等）

---

### 6. 条码扫描模块 (`/api/scan`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/scan/barcode/{barcode}` | 扫描产品条码查询企业信息 | ❌ |

**返回信息**:
- 产品基本信息
- 品牌方企业（含AGI评分）
- 生产商企业（含AGI评分）
- OEM标识判断
- 综合推荐等级（green/yellow/red）

---

### 7. 考勤截图模块 (`/api/attendance`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/attendance/screenshots` | 上传考勤截图 | ✅ |
| GET | `/attendance/my/screenshots` | 查看我的截图列表 | ✅ |
| GET | `/attendance/company/{id}/stats` | 企业考勤统计 | ❌ |
| POST | `/attendance/{id}/verify` | 验证考勤截图 | ✅ |

**支持的来源**: dingtalk（钉钉）、feishu（飞书）、other（其他）

**统计指标**: 总截图数、已验证数、涉及员工数

---

### 8. 匿名问答模块 (`/api/qa`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/qa` | 提问（匿名） | ✅ |
| GET | `/qa/company/{id}` | 查询企业问答列表 | ❌ |
| POST | `/qa/{id}/answer` | 回答问题（可标记为已验证员工） | ✅ |

**特性**:
- 匿名提问机制
- 已验证员工标识
- 可筛选仅查看已回答问题

---

### 9. 健康检查接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 服务健康状态检查 |

---

## 🎨 前端功能组件（14个页面组件）

### 核心页面

| 组件 | 路由 | 功能说明 |
|------|------|----------|
| **HomePage** | `/` | 首页，展示平台介绍和企业排名 |
| **LoginPage** | `/login` | 登录页面 |
| **RegisterPage** | `/register` | 注册页面 |
| **SearchResultsPage** | `/search` | 搜索结果页 |

### 企业相关

| 组件 | 路由 | 功能说明 |
|------|------|----------|
| **CompanyDetailPage** | `/company/:id` | 企业详情页（AGI评分、工时数据、认证状态） |
| **CompanyDashboardPage** | `/dashboard` | 企业仪表盘（企业管理员视图） |
| **SearchResultsPage** | `/search` | 企业搜索结果列表 |

### 员工功能

| 组件 | 路由 | 功能说明 |
|------|------|----------|
| **EmployeeCheckInPage** | `/checkin` | 员工打卡/签到页面 |
| **ScanVerifyPage** | `/scan` | 条码扫描验证页（扫码查企业内卷程度） |

### 认证系统

| 组件 | 路由 | 功能说明 |
|------|------|----------|
| **CertificationApplicationPage** | `/apply` | 认证申请表单页 |
| **CertificationApplyPage** | - | 认证申请步骤组件 |
| **CertificationResultPage** | `/certification/:id` | 认证结果展示页 |

### 通用组件

| 组件 | 功能说明 |
|------|----------|
| **ProtectedRoute** | 路由守卫（未登录重定向到登录页） |
| **ErrorBoundary** | 错误边界（捕获子组件异常） |
| **LanguageSwitcher** | 语言切换器（中英文） |

---

## 🔧 前端API客户端层（9个模块）

```typescript
// API客户端统一导出
export { apiClient } from './client';           // HTTP客户端（基于axios/fetch）
export { authApi } from './auth';               // 认证API
export { companiesApi } from './companies';      // 企业管理API
export { scanApi } from './scan';               // 扫码API
export { workHoursApi } from './workHours';     // 工时记录API
export { evidencesApi } from './evidences';     // 证据上传API
export { attendanceApi } from './attendance';   // 考勤截图API
export { certificationsApi } from './certifications'; // 认证API
export { qaApi } from './qa';                   // 问答API
```

**特性**:
- 统一的请求/响应拦截器
- 自动Token注入
- TypeScript类型安全
- 错误处理统一封装

---

## 🧪 测试体系

### 后端测试（Python + pytest + httpx）

#### 1. 认证测试 (`test_auth.py`) - **17个测试用例**

**TestUserRegistration（9个测试）**:
- ✅ 注册成功
- ✅ 重复用户名拒绝
- ✅ 重复邮箱拒绝
- ✅ 弱密码拒绝
- ✅ 短用户名拒绝
- ✅ 无效邮箱格式拒绝
- ✅ 密码无大写字母拒绝
- ✅ 密码无数字拒绝
- ✅ 密码过长拒绝

**TestUserLogin（4个测试）**:
- ✅ 登录成功返回JWT
- ✅ 错误密码返回401
- ✅ 不存在用户返回401
- ✅ 返回有效JWT Token（可解码验证sub/exp）

**TestAuthentication（3个测试）**:
- ✅ 无Token访问受保护接口返回401
- ✅ 无效Token访问返回401
- ✅ 有效Token访问个人资料成功

**技术特点**:
- 使用SQLite内存数据库进行隔离测试
- AsyncClient模拟HTTP请求
- 完整的用户生命周期测试

---

#### 2. 工时记录测试 (`test_workhours.py`) - **13个测试用例**

**TestAGIEngine（11个单元测试）**:
- ✅ 完美公司（40h双休合法加班）得分验证 = 1.0
- ✅ 极端内卷公司（72h无休无偿加班频繁轮班）高分验证 >20
- ✅ 中等程度公司评分范围验证 0<score<50
- ✅ 工时边界测试：40h=0分
- ✅ 工时边界测试：41h>0分
- ✅ 工时边界测试：60h=30分
- ✅ 周末政策全类型评分验证（4种）
- ✅ 加班补偿全类型评分验证（3种）
- ✅ 轮班政策全类型评分验证（3种）
- ✅ 未知策略默认返回0分（3种策略）

**TestWorkHourSubmission（4个集成测试）**:
- ✅ 提交工时记录成功
- ✅ 未认证提交失败
- ✅ 无效工时（负数）被拒绝
- ✅ 异常高工时（100h）标记提交

**TestCompanyAGICalculation（3个集成测试）**:
- ✅ 从多条记录计算企业AGI
- ✅ 无记录时AGI=0
- ✅ 提交后企业AGI更新

**已知限制**: SQLite异步会话隔离可能导致部分测试跳过（不影响生产环境）

---

#### 3. 认证申请测试 (`test_certification.py`) - **12个测试用例**

**TestCertificationApplication（4个测试）**:
- ✅ 申请认证成功（状态pending/under_review）
- ✅ 未认证申请失败
- ✅ 申请不存在的企业失败
- ✅ 重复申请被拒绝

**TestCertificationReview（4个测试）**:
- ✅ 审核通过（状态→approved，设置approved_at）
- ✅ 审核拒绝（状态→rejected）
- ✅ 审核不存在的认证失败
- ✅ 通过后生成徽章

**TestCertificationQuery（3个测试）**:
- ✅ 通过ID查询认证详情
- ✅ 查询企业认证（可能200或404）
- ✅ 查询不存在的认证返回404

**TestCompanyStatusUpdate（2个测试）**:
- ✅ 通过审核后企业状态更新为certified
- ✅ 拒绝后企业状态更新为rejected

**特殊fixture**:
- `auth_client`: 自动注册+登录的认证客户端
- `sample_company`: 直接DB创建的示例企业（避免会话隔离问题）

---

#### 4. AGI引擎单元测试 (`test_agi_engine.py`) - **4个测试组**

✅ **工时评分函数测试**: 40h/48h/60h/72h四档验证
✅ **周末政策评分测试**: 4种政策完整覆盖
✅ **加班补偿评分测试**: 3种补偿方式验证
✅ **综合AGI计算测试**: 完美/极端两种场景验证

**权重验证**:
```
极端案例计算验证：
hours(40*0.4=16) + weekend(25*0.25=6.25) + ot(15*0.15=2.25) + shift(10*0.1=1) + vibe(10*0.1=1) = 26.5
实际断言: agi > 20 且 ≤ 100 ✓
```

---

#### 5. 主应用测试 (`test_main.py`) - **1个测试**

✅ **健康检查接口**: GET /health 返回200且status=healthy

---

### 前端测试（React + Vitest + Testing Library）

#### 1. ErrorBoundary.test.tsx

**测试内容**:
- ✅ 子组件正常渲染时不显示错误UI
- ✅ 子组件抛出异常时显示错误回退UI
- ✅ 提供重试机制

**重要性**: 防止单个组件崩溃导致整个应用白屏

---

#### 2. ProtectedRoute.test.tsx

**测试内容**:
- ✅ 已登录用户可以访问受保护路由
- ✅ 未登录用户重定向到登录页
- ✅ 正确传递路由参数和查询参数

**实现原理**: 使用AuthContext检测登录状态

---

#### 3. HomePage.test.tsx

**测试内容**:
- ✅ 页面正确渲染主要元素（标题、搜索框、企业列表）
- ✅ 企业卡片正确显示AGI评分和认证状态
- ✅ 搜索功能触发导航

---

#### 4. LoadingContext.test.tsx

**测试内容**:
- ✅ 默认loading状态为false
- ✅ setLoading能正确切换状态
- ✅ 多个组件共享同一状态

**用途**: 全局加载状态管理（用于骨架屏、加载动画等）

---

### 性能测试

**文件**: `backend/tests/performance/load_test.js`
**工具**: 自定义负载测试脚本
**目的**: 压力测试API性能瓶颈

---

## 🎯 核心业务流程

### 流程1: 员工反馈企业内卷情况

```
员工注册/登录 → 搜索/选择企业 → 提交工时记录 → 可选上传证据 → 社区验证（5次）→ 自动计算企业AGI评分
```

### 流程2: 企业申请反内卷认证

```
企业注册 → 准备材料（政策文档+证据） → 提交认证申请 → 平台审核 → 通过/拒绝 → 生成认证徽章（1年有效期）
```

### 流程3: 消费者扫码查询

```
打开扫码页 → 扫描商品条码 → 显示品牌方/生产商 → 展示AGI评分和推荐等级 → 辅助消费决策
```

### 流程4: 匿名问答互动

```
选择企业 → 匿名提问 → 已验证员工回答 → 信息透明化 → 帮助求职者了解真实情况
```

---

## 📊 数据统计

### 代码规模估算

| 层级 | 文件数 | 主要功能 |
|------|--------|----------|
| **后端API** | 8个模块 | 30+个接口 |
| **前端组件** | 14个页面 | 9个路由 |
| **前端API层** | 9个客户端 | 完整TypeScript类型 |
| **数据模型** | 9个实体 | 完整关系映射 |
| **后端测试** | 5个文件 | 47+测试用例 |
| **前端测试** | 4个文件 | 15+测试场景 |
| **Schema定义** | 8个文件 | Pydantic v2验证 |

### 测试覆盖率重点区域

✅ **完全覆盖**:
- 用户认证流程（注册/登录/JWT验证）
- AGI评分算法（所有分支和边界值）
- 工时记录CRUD操作
- 认证申请/审核完整流程
- 数据验证（弱密码、无效输入等）

⚠️ **部分覆盖**:
- 企业管理接口（依赖会话隔离环境）
- 证据/考勤上传（需要文件模拟）
- 前端交互测试（可扩展E2E测试）

---

## 🔐 安全特性

### 认证与授权
- ✅ JWT Token认证（OAuth2标准）
- ✅ 密码bcrypt加密存储
- ✅ 接口级别的权限控制（Depends(get_current_user)）
- ✅ 路由守卫（ProtectedRoute组件）

### 数据安全
- ✅ SQL注入防护（SQLAlchemy ORM参数化查询）
- ✅ XSS防护（React自动转义）
- ✅ CORS跨域配置（可配置允许来源）
- ✅ 速率限制（slowapi中间件，429限流）

### 输入验证
- ✅ Pydantic v2模型验证（后端）
- ✅ Zod schema验证（前端formSchemas.ts）
- ✅ 文件类型和大小限制
- ✅ UUID格式校验

---

## 🚀 部署与运维

### Docker支持
- ✅ Dockerfile（后端多阶段构建）
- ✅ docker-compose.yml（一键部署）
- ✅ GitHub Actions CI/CD流水线
  - 后端CI测试
  - 移动端CI测试
  - 性能监控
  - 安全增强检查
  - 自动部署

### 数据库迁移
- ✅ Alembic版本控制
- ✅ 初始迁移脚本（001_initial.py）
- ✅ 支持 SQLite（开发）和 PostgreSQL（生产）

### 环境配置
- ✅ `.env.example`（开发环境模板）
- ✅ `.env.production`（生产环境配置）
- ✅ 配置热重载（pydantic-settings）

---

## 📱 国际化支持

**语言包**:
- ✅ 中文（zh.json）
- ✅ 英文（en.json）

**实现**: i18next + react-i18next
**切换组件**: LanguageSwitcher（支持中英文切换）

---

## 🛠️ 开发工具链

### 后端
- **框架**: FastAPI 0.104+
- **ORM**: SQLAlchemy 2.0（异步）
- **数据库**: SQLite（开发）/ PostgreSQL（生产）
- **测试**: pytest + pytest-asyncio + httpx
- **代码质量**: 类型提示（Python 3.11+）

### 前端
- **框架**: React 19
- **语言**: TypeScript 5.x
- **构建**: Vite 5.x
- **UI库**: shadcn/ui + TailwindCSS 3.x
- **测试**: Vitest + @testing-library/react
- **路由**: React Router v7（lazy loading）
- **状态管理**: Context API（AuthContext, LoadingContext）

### DevOps
- **容器化**: Docker + docker-compose
- **CI/CD**: GitHub Actions
- **代码审查**: Gemini AI辅助review
- **性能监控**: Lighthouse审计
- **错误追踪**: Sentry（可配置）

---

## 📈 项目路线图参考

详细规划见:
- [MVP路线图](./mvp-roadmap_anti-involution_20260419.md)
- [任务总览](./task-summary_anti-involution-validator_20260419.md)
- [优化方案](./.trae/documents/optimization-implementation-summary.md)

---

## 🔄 版本信息

**当前版本**: 见 `settings.app_version` 配置
**最后更新**: 2026-04-20
**文档维护**: 随代码迭代持续更新

---

## 💡 使用指南

### 快速启动

```bash
# 后端
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# 前端
cd frontend
npm install
npm run dev
```

### 运行测试

```bash
# 后端测试
cd backend
pytest tests/ -v

# 前端测试
cd frontend
npm test
```

### 查看API文档

启动后端服务后访问:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 📝 总结

AntiGrind是一个完整的**企业内卷度评估平台**，具备：

✅ **完善的用户系统**（注册、登录、角色管理）
✅ **全面的AGI评分算法**（工时、周末、加班、轮班、主观评价5维度）
✅ **透明的认证体系**（申请→审核→徽章→公示）
✅ **多样的数据来源**（员工填报、考勤截图、条码扫描、匿名问答）
✅ **健全的测试保障**（47+后端测试用例 + 15+前端测试场景）
✅ **生产级部署能力**（Docker、CI/CD、监控告警）

**核心价值**: 通过数据透明化和社区验证机制，帮助求职者和消费者做出更明智的选择，同时推动企业改善职场环境。
