# 管理员端功能开发计划（含国际化支持）

## 📋 项目概述

### 目标
构建完整的管理员后台管理系统，提供用户管理、公司管理、认证审核、数据统计等核心功能，并全面支持中英文国际化。

### 技术栈
- **前端**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **后端**: FastAPI + SQLAlchemy + async/await
- **国际化**: i18next + react-i18next (中文/英文)
- **状态管理**: React Context + Hooks

---

## 🔍 现状分析

### ✅ 已实现的功能
1. **管理员仪表板** (`AdminDashboard.tsx`)
   - 基础统计数据展示（用户数、企业数、认证数）
   - 最近注册用户列表
   - 快捷操作入口

2. **认证审核模块** (`AdminCertificationReview.tsx`)
   - 待审核认证列表
   - 认证详情查看
   - 批准/拒绝操作

3. **后端API** (`admin.py`)
   - 仪表板统计接口
   - 认证列表和审核接口
   - 用户列表和状态切换接口

### ❌ 缺失的核心功能
1. **完整的用户管理系统**
2. **公司信息管理**
3. **增强的认证工作流**
4. **数据可视化分析面板**
5. **系统设置和配置**
6. **操作日志审计**
7. **全面的国际化支持**

---

## 📚 国际化（i18n）实施策略

### 当前状态
- ✅ 已配置 i18next 框架
- ✅ 有基础的中文(zh.json)和英文(en.json)语言包
- ❌ 管理员端组件缺少翻译键值
- ❌ 部分硬编码文本未提取

### 实施规范

#### 1. 命名空间组织
```json
{
  "admin": {
    "dashboard": { ... },
    "users": { ... },
    "companies": { ... },
    "certifications": { ... },
    "settings": { ... },
    "logs": { ... },
    "common": { ... }
  }
}
```

#### 2. 翻译键命名规则
- 使用点号分隔的层级结构
- 统一小写+下划线格式
- 示例: `admin.users.table.headers.username`

#### 3. 组件中使用方式
```tsx
const { t } = useTranslation();
t('admin.dashboard.title') // "管理员仪表板" / "Admin Dashboard"
```

#### 4. 动态内容处理
```tsx
// 插值示例
t('admin.users.count', { count: 42 })
// "共 42 位用户" / "42 users total"

// 复数形式
t('admin.certifications.pending', { count: 5 })
// "5 个待审核" / "5 pending reviews"
```

---

## 🎯 功能模块详细规划

## 模块一：增强管理员认证与权限系统

### 1.1 功能需求
- [ ] 多角色权限控制（超级管理员/普通管理员/审核员）
- [ ] 管理员登录页面优化
- [ ] 会话管理和自动登出
- [ ] 操作权限矩阵
- [ ] API级别的细粒度权限验证

### 1.2 后端API扩展
```python
# 新增API端点
POST /api/admin/auth/login          # 管理员专用登录
GET  /api/admin/auth/permissions    # 获取当前权限列表
POST /api/admin/auth/logout         # 安全登出
GET  /api/admin/auth/sessions       # 会话管理
```

### 1.3 前端组件
- `AdminLoginPage.tsx` - 专用登录页
- `PermissionGuard.tsx` - 权限守卫组件
- `RoleSelector.tsx` - 角色选择器

### 1.4 国际化键值
```json
{
  "admin": {
    "auth": {
      "title": "管理员登录 / Admin Login",
      "username": "用户名 / Username",
      "password": "密码 / Password",
      "login_btn": "登录 / Sign In",
      "logout": "退出登录 / Logout",
      "session_expired": "会话已过期 / Session Expired",
      "permission_denied": "权限不足 / Permission Denied",
      "roles": {
        "super_admin": "超级管理员 / Super Admin",
        "admin": "管理员 / Administrator",
        "reviewer": "审核员 / Reviewer"
      }
    }
  }
}
```

---

## 模块二：用户管理系统

### 2.1 功能需求
- [ ] 用户列表展示（表格+搜索+筛选+排序）
- [ ] 用户详情查看
- [ ] 用户状态管理（启用/禁用/封禁）
- [ ] 角色分配和管理
- [ ] 批量操作（批量启用/禁用/导出）
- [ ] 用户活动日志查看

### 2.2 后端API（已部分存在，需增强）
```
GET    /api/admin/users                    # 用户列表（增强筛选）
GET    /api/admin/users/{user_id}          # 用户详情
PATCH  /api/admin/users/{user_id}/status   # 切换状态（已有）
PATCH  /api/admin/users/{user_id}/role     # 修改角色
DELETE /api/admin/users/{user_id}          # 删除用户
GET    /api/admin/users/{user_id}/activity # 用户活动记录
POST   /api/admin/users/batch-action       # 批量操作
GET    /api/admin/users/export             # 导出用户数据
```

### 2.3 前端组件
- `AdminUserManagement.tsx` - 用户管理主页面
- `UserTable.tsx` - 用户数据表格
- `UserDetailModal.tsx` - 用户详情弹窗
- `UserFilterBar.tsx` - 搜索筛选栏
- `BatchActionsToolbar.tsx` - 批量操作工具栏

### 2.4 核心功能实现要点

#### 用户表格列定义
| 字段 | 说明 | 可排序 | 可筛选 |
|------|------|--------|--------|
| ID | 用户唯一标识 | ✅ | ✅ |
| username | 用户名 | ✅ | ✅ |
| email | 邮箱 | ✅ | ✅ |
| role | 角色 | ✅ | ✅ 下拉 |
| user_type | 用户类型 | ✅ | ✅ 下拉 |
| is_active | 状态 | ✅ | ✅ 开关 |
| created_at | 注册时间 | ✅ | 日期范围 |
| last_active | 最后活跃 | ✅ | 日期范围 |

#### 搜索筛选功能
- 关键词搜索（用户名/邮箱模糊匹配）
- 角色筛选（全部/员工/公司代表/管理员）
- 状态筛选（全部/活跃/已禁用）
- 注册日期范围选择
- 组合条件查询

### 2.5 国际化键值
```json
{
  "admin": {
    "users": {
      "title": "用户管理 / User Management",
      "subtitle": "管理系统中的所有用户账户 / Manage all user accounts",
      "total_count": "共 {{count}} 位用户 / {{count}} users total",
      "search_placeholder": "搜索用户名或邮箱... / Search by name or email...",
      "filters": {
        "role": "角色 / Role",
        "status": "状态 / Status",
        "date_range": "注册日期 / Registration Date",
        "all": "全部 / All",
        "active": "活跃 / Active",
        "inactive": "已禁用 / Inactive"
      },
      "table": {
        "headers": {
          "id": "ID",
          "username": "用户名 / Username",
          "email": "邮箱 / Email",
          "role": "角色 / Role",
          "type": "类型 / Type",
          "status": "状态 / Status",
          "registered": "注册时间 / Registered",
          "last_active": "最后活跃 / Last Active",
          "actions": "操作 / Actions"
        },
        "actions": {
          "view": "查看 / View",
          "edit": "编辑 / Edit",
          "disable": "禁用 / Disable",
          "enable": "启用 / Enable",
          "delete": "删除 / Delete",
          "assign_role": "分配角色 / Assign Role"
        },
        "empty": "暂无用户数据 / No users found",
        "loading": "加载中... / Loading..."
      },
      "batch_actions": {
        "title": "批量操作 / Batch Operations",
        "selected": "已选择 {{count}} 项 / {{count}} selected",
        "enable_all": "批量启用 / Enable All",
        "disable_all": "批量禁用 / Disable All",
        "export": "导出数据 / Export Data",
        "confirm": "确认执行 / Confirm Action"
      },
      "detail": {
        "title": "用户详情 / User Details",
        "basic_info": "基本信息 / Basic Information",
        "account_info": "账户信息 / Account Info",
        "activity_log": "活动记录 / Activity Log",
        "certifications": "相关认证 / Related Certifications"
      },
      "messages": {
        "status_changed": "用户状态已更新 / User status updated",
        "role_assigned": "角色分配成功 / Role assigned successfully",
        "user_deleted": "用户已删除 / User deleted",
        "cannot_modify_self": "无法修改自己的账户 / Cannot modify your own account",
        "confirm_delete": "确定要删除此用户吗？此操作不可逆！/ Are you sure? This cannot be undone!"
      }
    }
  }
}
```

---

## 模块三：公司管理系统

### 3.1 功能需求
- [ ] 公司列表展示（卡片/表格视图切换）
- [ ] 公司详细信息查看和编辑
- [ ] 认证状态管理
- [ ] AGI评分调整（需审批流程）
- [ ] 公司徽章管理
- [ ] 数据统计概览

### 3.2 后端API
```
GET    /api/admin/companies                  # 公司列表
GET    /api/admin/companies/{company_id}      # 公司详情
PATCH  /api/admin/companies/{company_id}      # 编辑公司信息
PATCH  /api/admin/companies/{company_id}/agi  # 调整AGI评分
POST   /api/admin/companies/{company_id}/badge # 管理徽章
GET    /api/admin/companies/stats            # 公司统计数据
GET    /api/admin/companies/export           # 导出公司数据
```

### 3.3 前端组件
- `AdminCompanyManagement.tsx` - 公司管理主页面
- `CompanyList.tsx` - 公司列表（支持视图切换）
- `CompanyDetailPanel.tsx` - 公司详情面板
- `CompanyEditForm.tsx` - 公司信息编辑表单
- `AGIScoreAdjustment.tsx` - AGI评分调整组件
- `BadgeManager.tsx` - 徽章管理器

### 3.4 核心功能特性

#### 公司信息字段
- 基本信息：名称、行业、规模、地址
- 联系信息：官网、电话、邮箱
- 认证信息：状态、等级、有效期、AGI评分
- 统计数据：员工数量、提交记录数、证据数

#### AGI调整流程
1. 管理员发起调整请求（填写原因）
2. 系统记录调整历史
3. 二次确认机制
4. 自动通知相关公司
5. 审计日志记录

### 3.5 国际化键值
```json
{
  "admin": {
    "companies": {
      "title": "公司管理 / Company Management",
      "subtitle": "管理所有注册企业信息 / Manage all registered companies",
      "view_toggle": {
        "card": "卡片视图 / Card View",
        "table": "表格视图 / Table View"
      },
      "search_placeholder": "搜索公司名称... / Search company name...",
      "filters": {
        "industry": "行业 / Industry",
        "certification_status": "认证状态 / Certification Status",
        "agi_range": "AGI评分范围 / AGI Score Range",
        "all_statuses": "全部状态 / All Statuses"
      },
      "table": {
        "headers": {
          "id": "ID",
          "name": "公司名称 / Company Name",
          "industry": "行业 / Industry",
          "agi_score": "AGI评分 / AGI Score",
          "cert_status": "认证状态 / Cert Status",
          "employees": "员工数 / Employees",
          "created_at": "注册时间 / Registered",
          "actions": "操作 / Actions"
        }
      },
      "detail": {
        "title": "公司详情 / Company Details",
        "basic_info": "基本信息 / Basic Info",
        "cert_info": "认证信息 / Certification Info",
        "statistics": "数据统计 / Statistics",
        "edit_btn": "编辑信息 / Edit Info",
        "adjust_agi": "调整AGI / Adjust AGI"
      },
      "agi_adjustment": {
        "title": "AGI评分调整 / AGI Score Adjustment",
        "current_score": "当前评分 / Current Score",
        "new_score": "新评分 / New Score",
        "reason": "调整原因 / Reason",
        "submit": "提交调整 / Submit Adjustment",
        "cancel": "取消 / Cancel",
        "confirm_msg": "确定将AGI从{{from}}调整为{{to}}？/ Adjust AGI from {{to}} to {{to}}?",
        "success": "AGI评分已更新 / AGI score updated"
      },
      "badge_management": {
        "title": "徽章管理 / Badge Management",
        "current_badge": "当前徽章 / Current Badge",
        "issue_new": "颁发新徽章 / Issue New Badge",
        "revoke": "撤销徽章 / Revoke Badge",
        "history": "颁发历史 / Issuance History"
      },
      "messages": {
        "company_updated": "公司信息已更新 / Company info updated",
        "agi_adjusted": "AGI评分已调整 / AGI score adjusted",
        "badge_issued": "徽章已颁发 / Badge issued",
        "company_deleted": "公司已删除 / Company deleted"
      }
    }
  }
}
```

---

## 模块四：增强认证审核工作流

### 4.1 功能需求（在现有基础上增强）
- [ ] 多级审核流程（初审→复审→终审）
- [ ] 审核任务分配和流转
- [ ] 审核模板和标准话术
- [ ] 批量审核操作
- [ ] 审核统计和效率分析
- [ ] 申诉处理流程
- [ ] 审核历史回溯

### 4.2 后端API增强
```
GET    /api/admin/certifications              # 所有认证列表（增强）
GET    /api/admin/certifications/pending       # 待审核（已有）
GET    /api/admin/certifications/{id}          # 详情（已有）
POST   /api/admin/certifications/{id}/review   # 审核（已有，增强）
POST   /api/admin/certifications/{id}/assign   # 分配审核员
POST   /api/admin/certifications/batch-review  # 批量审核
GET    /api/admin/certifications/appeals       # 申诉列表
POST   /api/admin/certifications/{id}/appeal/respond  # 处理申诉
GET    /api/admin/certifications/stats         # 审核统计
GET    /api/admin/certifications/templates     # 审核模板
```

### 4.3 前端组件增强
- `AdminCertificationReview.tsx` - 重构现有组件
- `ReviewQueue.tsx` - 审核队列（支持拖拽排序）
- `ReviewWorkflow.tsx` - 工作流可视化
- `BatchReviewModal.tsx` - 批量审核对话框
- `AppealManagement.tsx` - 申诉管理
- `ReviewStats.tsx` - 审核效率统计
- `ReviewTemplateEditor.tsx` - 审核模板编辑器

### 4.4 审核流程设计

```
提交申请 → 初审（自动/人工）→ 复审（人工）→ 终审（管理员）
                ↓              ↓            ↓
             通过/拒绝      通过/拒绝     通过/拒绝
                ↓              ↓            ↓
              申诉通道 ← ← ← ← ← ← ← ← ← ← ←
```

### 4.5 国际化键值
```json
{
  "admin": {
    "certifications": {
      "title": "认证审核 / Certification Review",
      "subtitle": "管理企业认证申请和审核流程 / Manage certification applications and review workflow",
      "queue": {
        "title": "审核队列 / Review Queue",
        "pending": "待审核 / Pending",
        "in_progress": "审核中 / In Progress",
        "completed": "已完成 / Completed",
        "assigned_to_me": "分配给我 / Assigned to Me",
        "unassigned": "未分配 / Unassigned",
        "drag_hint": "拖拽调整优先级 / Drag to reorder priority"
      },
      "review_form": {
        "title": "审核表单 / Review Form",
        "applicant_info": "申请人信息 / Applicant Information",
        "company_info": "公司信息 / Company Information",
        "evidence_review": "证据审查 / Evidence Review",
        "policy_compliance": "合规性检查 / Policy Compliance",
        "decision": "审核决定 / Decision",
        "approve": "批准 / Approve",
        "reject": "拒绝 / Reject",
        "request_info": "要求补充信息 / Request More Info",
        "notes": "审核备注 / Review Notes",
        "notes_placeholder": "请输入审核意见... / Enter your review notes...",
        "template": "使用模板 / Use Template",
        "submit": "提交审核 / Submit Review"
      },
      "batch_review": {
        "title": "批量审核 / Batch Review",
        "selected": "已选 {{count}} 个申请 / {{count}} applications selected",
        "approve_all": "全部批准 / Approve All",
        "reject_all": "全部拒绝 / Reject All",
        "warning": "批量操作请谨慎！请确认每个申请都符合标准。/ Batch operations require careful consideration!"
      },
      "appeals": {
        "title": "申诉管理 / Appeal Management",
        "list": "申诉列表 / Appeals List",
        "respond": "回复申诉 / Respond to Appeal",
        "accept": "接受申诉 / Accept Appeal",
        "reject_appeal": "拒绝申诉 / Reject Appeal",
        "reopen": "重新审核 / Reopen Review"
      },
      "stats": {
        "title": "审核统计 / Review Statistics",
        "avg_time": "平均审核时间 / Avg Review Time",
        "approval_rate": "通过率 / Approval Rate",
        "pending_count": "待处理数 / Pending Count",
        "my_reviews": "我的审核数 / My Reviews"
      },
      "templates": {
        "title": "审核模板 / Review Templates",
        "create": "创建模板 / Create Template",
        "edit": "编辑模板 / Edit Template",
        "delete": "删除模板 / Delete Template",
        "apply": "应用模板 / Apply Template"
      },
      "messages": {
        "review_submitted": "审核已提交 / Review submitted",
        "certification_approved": "认证已批准 / Certification approved",
        "certification_rejected": "认证已拒绝 / Certification rejected",
        "info_requested": "已要求补充信息 / Information requested",
        "appeal_responded": "申诉已回复 / Appeal responded"
      }
    }
  }
}
```

---

## 模块五：数据统计与分析面板

### 5.1 功能需求
- [ ] 平台核心指标实时监控
- [ ] 用户增长趋势图表
- [ ] 认证申请趋势分析
- [ ] AGI评分分布图
- [ ] 行业分布统计
- [ ] 地域分布热力图
- [ ] 自定义报表生成
- [ ] 数据导出功能

### 5.2 后端API
```
GET  /api/admin/analytics/overview           # 总览数据
GET  /api/admin/analytics/user-growth        # 用户增长趋势
GET  /api/admin/analytics/cert-trends        # 认证趋势
GET  /api/admin/analytics/agi-distribution   # AGI分布
GET  /api/admin/analytics/industry-stats     # 行业统计
GET  /api/admin/analytics/regional-data      # 地域数据
GET  /api/admin/analytics/custom-report      # 自定义报表
POST /api/admin/analytics/export             # 导出数据
```

### 5.3 前端组件
- `AnalyticsDashboard.tsx` - 分析仪表板主页面
- `MetricCards.tsx` - 核心指标卡片组
- `UserGrowthChart.tsx` - 用户增长图表
- `CertTrendChart.tsx` - 认证趋势图表
- `AGIDistributionChart.tsx` - AGI分布图
- `IndustryPieChart.tsx` - 行业饼图
- `RegionalHeatmap.tsx` - 地域热力图
- `ReportBuilder.tsx` - 报表生成器
- `DataExportTool.tsx` - 数据导出工具

### 5.4 图表库选择
推荐使用 **Recharts**（项目已集成）或 **ECharts**（更丰富的图表类型）

### 5.5 国际化键值
```json
{
  "admin": {
    "analytics": {
      "title": "数据分析 / Data Analytics",
      "subtitle": "平台运营数据和趋势分析 / Platform operations data and trend analysis",
      "overview": {
        "title": "总览 / Overview",
        "total_users": "总用户数 / Total Users",
        "new_users_today": "今日新增 / New Today",
        "active_users": "活跃用户 / Active Users",
        "total_companies": "总企业数 / Total Companies",
        "certified_companies": "已认证 / Certified",
        "pending_reviews": "待审核 / Pending Reviews",
        "avg_agi": "平均AGI / Average AGI",
        "data_points": "数据点 / Data Points"
      },
      "charts": {
        "user_growth": "用户增长趋势 / User Growth Trend",
        "cert_trends": "认证申请趋势 / Certification Trends",
        "agi_distribution": "AGI评分分布 / AGI Score Distribution",
        "industry_distribution": "行业分布 / Industry Distribution",
        "regional_heatmap": "地域分布 / Regional Distribution",
        "time_range": "时间范围 / Time Range",
        "last_7days": "近7天 / Last 7 Days",
        "last_30days": "近30天 / Last 30 Days",
        "last_90days": "近90天 / Last 90 Days",
        "custom": "自定义 / Custom"
      },
      "reports": {
        "title": "报表中心 / Report Center",
        "create_report": "创建报表 / Create Report",
        "saved_reports": "已保存报表 / Saved Reports",
        "export_format": "导出格式 / Export Format",
        "pdf": "PDF文档 / PDF Document",
        "excel": "Excel表格 / Excel Spreadsheet",
        "csv": "CSV文件 / CSV File"
      },
      "export": {
        "title": "数据导出 / Data Export",
        "select_data": "选择数据类型 / Select Data Type",
        "select_fields": "选择字段 / Select Fields",
        "date_range": "日期范围 / Date Range",
        "format": "格式 / Format",
        "start_export": "开始导出 / Start Export",
        "exporting": "正在导出... / Exporting...",
        "success": "导出成功 / Export Successful",
        "failed": "导出失败 / Export Failed"
      }
    }
  }
}
```

---

## 模块六：系统设置与日志管理

### 6.1 功能需求
- [ ] 平台基本设置（名称、描述、Logo）
- [ ] 认证标准和阈值配置
- [ ] AGI算法参数调整
- [ ] 邮件通知模板管理
- [ ] 操作日志查看和搜索
- [ ] 系统监控和告警
- [ ] 数据备份和恢复

### 6.2 后端API
```
GET    /api/admin/settings                    # 获取设置
PUT    /api/admin/settings                    # 更新设置
GET    /api/admin/logs                        # 操作日志
GET    /api/admin/logs/{log_id}               # 日志详情
DELETE /api/admin/logs                        # 清理日志
GET    /api/admin/system/health               # 系统健康检查
GET    /api/admin/system/stats                # 系统资源监控
POST   /api/admin/system/backup               # 创建备份
GET    /api/admin/backups                     # 备份列表
POST   /api/admin/backups/{id}/restore        # 恢复备份
```

### 6.3 前端组件
- `SystemSettings.tsx` - 系统设置主页面
- `PlatformConfig.tsx` - 平台配置表单
- `CertificationStandards.tsx` - 认证标准配置
- `AGIAlgorithmParams.tsx` - AGI参数调整
- `EmailTemplates.tsx` - 邮件模板管理
- `OperationLogs.tsx` - 操作日志查看器
- `SystemMonitor.tsx` - 系统监控面板
- `BackupManager.tsx` - 备份管理器

### 6.4 国际化键值
```json
{
  "admin": {
    "settings": {
      "title": "系统设置 / System Settings",
      "subtitle": "配置平台参数和系统选项 / Configure platform parameters and system options",
      "platform": {
        "title": "平台配置 / Platform Configuration",
        "platform_name": "平台名称 / Platform Name",
        "description": "平台描述 / Description",
        "logo": "平台Logo / Logo",
        "contact_email": "联系邮箱 / Contact Email",
        "maintenance_mode": "维护模式 / Maintenance Mode"
      },
      "certification": {
        "title": "认证标准 / Certification Standards",
        "green_threshold": "绿色区域阈值 / Green Zone Threshold",
        "yellow_threshold": "黄色区域阈值 / Yellow Zone Threshold",
        "validity_period": "有效期(天) / Validity Period (Days)",
        "required_evidences": "所需证据数 / Required Evidences",
        "min_employees": "最少员工数 / Minimum Employees"
      },
      "agi_algorithm": {
        "title": "AGI算法参数 / AGI Algorithm Parameters",
        "work_hours_weight": "工作时权重 / Work Hours Weight",
        "weekend_policy_weight": "周末政策权重 / Weekend Policy Weight",
        "overtime_weight": "加班补偿权重 / Overtime Weight",
        "evidence_weight": "证据权重 / Evidence Weight",
        "save_params": "保存参数 / Save Parameters",
        "reset_defaults": "恢复默认 / Reset to Defaults"
      },
      "notifications": {
        "title": "通知设置 / Notification Settings",
        "email_templates": "邮件模板 / Email Templates",
        "smtp_config": "SMTP配置 / SMTP Configuration",
        "test_email": "发送测试邮件 / Send Test Email"
      },
      "messages": {
        "settings_saved": "设置已保存 / Settings saved",
        "params_updated": "参数已更新 / Parameters updated",
        "test_email_sent": "测试邮件已发送 / Test email sent"
      }
    },
    "logs": {
      "title": "操作日志 / Operation Logs",
      "subtitle": "查看所有管理员操作记录 / View all administrator operation records",
      "search_placeholder": "搜索日志... / Search logs...",
      "filters": {
        "action_type": "操作类型 / Action Type",
        "user": "操作人 / Operator",
        "date_range": "时间范围 / Date Range",
        "level": "级别 / Level"
      },
      "table": {
        "headers": {
          "timestamp": "时间戳 / Timestamp",
          "operator": "操作人 / Operator",
          "action": "操作 / Action",
          "target": "目标对象 / Target",
          "details": "详情 / Details",
          "ip_address": "IP地址 / IP Address"
        }
      },
      "actions": {
        "view_details": "查看详情 / View Details",
        "export_logs": "导出日志 / Export Logs",
        "clear_logs": "清理日志 / Clear Logs"
      },
      "levels": {
        "info": "信息 / Info",
        "warning": "警告 / Warning",
        "error": "错误 / Error",
        "critical": "严重 / Critical"
      }
    },
    "system": {
      "title": "系统监控 / System Monitoring",
      "health": "健康状态 / Health Status",
      "cpu_usage": "CPU使用率 / CPU Usage",
      "memory_usage": "内存使用率 / Memory Usage",
      "disk_space": "磁盘空间 / Disk Space",
      "active_connections": "活跃连接 / Active Connections",
      "backup": {
        "title": "数据备份 / Data Backup",
        "create_backup": "创建备份 / Create Backup",
        "backup_list": "备份列表 / Backup List",
        "restore": "恢复 / Restore",
        "auto_backup": "自动备份 / Auto Backup",
        "last_backup": "上次备份 / Last Backup"
      }
    }
  }
}
```

---

## 🗺️ 路由结构设计

```typescript
// routes.tsx 中添加管理员子路由
{
  path: "/admin",
  element: <AdminLayout />,
  children: [
    { index: true, element: <AdminDashboard /> },                    // 仪表板
    { path: "users", element: <AdminUserManagement /> },             // 用户管理
    { path: "companies", element: <AdminCompanyManagement /> },      // 公司管理
    { path: "certifications", element: <AdminCertificationReview /> }, // 认证审核
    { path: "analytics", element: <AnalyticsDashboard /> },          // 数据分析
    { path: "settings", element: <SystemSettings /> },               // 系统设置
    { path: "logs", element: <OperationLogs /> },                    // 操作日志
  ],
}
```

---

## 📐 UI/UX 设计原则

### 1. 布局结构
```
┌─────────────────────────────────────────────┐
│  Header: Logo + 面包屑 + 语言切换 + 用户菜单 │
├──────────┬──────────────────────────────────┤
│ Sidebar  │  Main Content Area               │
│ ─────── │  ──────────────────────────────   │
│ 仪表板   │                                  │
│ 用户管理 │  Content                         │
│ 公司管理 │                                  │
│ 认证审核 │                                  │
│ 数据分析 │                                  │
│ 系统设置 │                                  │
│ 操作日志 │                                  │
└──────────┴──────────────────────────────────┘
```

### 2. 响应式设计
- 桌面端：侧边栏固定 + 内容区自适应
- 平板端：侧边栏可折叠
- 移动端：侧边栏转为抽屉式菜单

### 3. 交互体验
- 表格支持虚拟滚动（大数据量）
- 操作反馈（Loading/Success/Error 状态）
- 键盘快捷键支持
- 撤销/重做功能（关键操作）

### 4. 无障碍性（Accessibility）
- ARIA标签完善
- 键盘导航支持
- 屏幕阅读器友好
- 足够的颜色对比度

---

## 🔄 开发阶段划分

### 第一阶段：基础架构（预计2天）
✅ 已完成：
- [x] 项目初始化和依赖安装
- [x] i18n框架配置
- [x] 基础UI组件库集成

📋 本阶段任务：
- [ ] 管理员布局组件（AdminLayout）
- [ ] 侧边栏导航（AdminSidebar）
- [ ] 权限守卫中间件
- [ ] API客户端封装
- [ ] 基础样式和主题配置

### 第二阶段：核心管理功能（预计3天）
- [ ] 用户管理完整实现
- [ ] 公司管理完整实现
- [ ] 认证审核增强
- [ ] 对应后端API开发和测试

### 第三阶段：高级功能（预计2天）
- [ ] 数据分析和可视化
- [ ] 系统设置面板
- [ ] 操作日志系统
- [ ] 报表生成和导出

### 第四阶段：优化和完善（预计1天）
- [ ] 全面国际化测试
- [ ] 性能优化
- [ ] 响应式适配
- [ ] 文档编写
- [ ] 用户验收测试

**总计预估：8个工作日**

---

## ✅ 验收标准

### 功能完整性
- [ ] 所有规划的API端点可用且文档齐全
- [ ] 所有前端功能可正常操作
- [ ] 权限控制严格有效
- [ ] 数据校验和错误处理完善

### 国际化覆盖
- [ ] 中文界面100%翻译完成
- [ ] 英文界面100%翻译完成
- [ ] 无硬编码文本残留
- [ ] 日期/数字格式本地化正确
- [ ] 动态内容插值正常工作

### 性能要求
- [ ] 页面加载时间 < 3秒
- [ ] 大数据量表格流畅滚动（>1000条）
- [ ] API响应时间 < 500ms（P95）
- [ ] 内存占用合理（无内存泄漏）

### 代码质量
- [ ] TypeScript类型覆盖率 > 95%
- [ ] ESLint/Prettier无警告
- [ ] 单元测试覆盖率 > 80%
- [ ] 关键路径有集成测试

---

## 📝 注意事项

### 安全性
1. **敏感操作必须二次确认**（删除、批量操作、重要修改）
2. **操作日志不可篡改**（写入后只读）
3. **权限最小化原则**（按需授权）
4. **SQL注入防护**（使用ORM参数化查询）
5. **XSS防护**（React默认转义+额外 sanitization）

### 性能优化
1. **列表虚拟滚动**（react-window 或 @tanstack/react-virtual）
2. **API请求防抖节流**（搜索输入框）
3. **图片懒加载**（公司Logo等）
4. **代码分割和懒加载**（路由级别）
5. **缓存策略**（不常变的数据）

### 可维护性
1. **组件高度模块化**（单一职责）
2. **统一的错误处理机制**
3. **完善的TypeScript类型定义**
4. **清晰的代码注释和文档**
5. **版本化的API设计**

---

## 🎯 下一步行动

立即开始第一阶段的开发工作：
1. 创建管理员布局组件骨架
2. 实现侧边栏导航
3. 配置管理员路由结构
4. 开始填充国际化语言包

让我们开始构建一个专业、高效、国际化的管理员后台系统！💪
