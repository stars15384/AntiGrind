# 反内卷应用 - 三个问题修复计划

## 问题分析

### 问题1：申请认证流程错误 - 点击后应进入公司邮箱认证而非注册
**现状**: [HomePage.tsx](frontend/src/app/components/HomePage.tsx#L81-L95) 中点击"作为员工开始"/"代表公司申请"链接到 `/register` (注册页面)
**期望**: 
- 已登录用户 → 直接跳转到 `/apply` (认证页面) 进行公司邮箱验证
- 未登录用户 → 跳转到 `/login` (登录页面)，登录后再进行认证

### 问题2：管理面板显示固定数据而非用户所属公司
**现状**: [CompanyDashboardPage.tsx](frontend/src/app/components/CompanyDashboardPage.tsx#L48) 硬编码了 "Lüye Internet Tech" 和固定的模拟数据
**期望**: 根据当前登录用户的 `company_id` 动态加载并显示对应公司的真实数据

### 问题3：登录页面国际化键缺失
**现状**: [LoginPage.tsx](frontend/src/app/components/LoginPage.tsx#L159) 使用 `t('auth.role_employee')` / `t('auth.role_company')` 但这些键在 `zh.json`/`en.json` 的 `auth` 命名空间下不存在
**结果**: 页面显示原始键名 `auth.role_employee` 而非翻译文本

---

## 修复方案

### 任务1: 修复认证入口导航逻辑
**文件**: [HomePage.tsx](frontend/src/app/components/HomePage.tsx)

**修改内容**:
1. 修改"作为员工开始"按钮逻辑 (第80-91行):
   - 已登录 → 链接到 `/apply`
   - 未登录 → 链接到 `/login?redirect=/apply`

2. 修改"代表公司申请"按钮逻辑 (第93-104行):
   - 已登录 → 链接到 `/apply`
   - 未登录 → 链接到 `/login?redirect=/apply`

3. 更新下拉菜单提示文字: 移除 `{t('auth.login_as_employee')}/{t('auth.login_as_company')}` 改为更清晰的描述

### 任务2: 修复管理面板动态数据显示
**文件**: [CompanyDashboardPage.tsx](frontend/src/app/components/CompanyDashboardPage.tsx)

**修改内容**:
1. 引入 `useAuth()` 获取当前用户信息
2. 引入 `companiesApi` 获取公司详情数据
3. 根据 `user.company_id` 加载公司信息:
   - 公司名称、AGI评分、认证编号等
4. 动态渲染仪表板数据:
   - 如果有真实API数据则使用真实数据
   - 否则显示占位符或空状态
5. 添加未绑定公司的提示状态

### 任务3: 补充缺失的国际化翻译键
**文件**:
- [zh.json](frontend/src/locales/zh.json)
- [en.json](frontend/src/locales/en.json)

**添加的翻译键**:

在 `auth` 命名空间下添加:
```json
"role_employee": "员工",
"role_company": "公司代表"
```

英文版:
```json
"role_employee": "Employee",
"role_company": "Company Representative"
```

### 任务4: (可选优化) 登录后重定向支持
**文件**: [LoginPage.tsx](frontend/src/app/components/LoginPage.tsx), [AuthContext.tsx](frontend/src/contexts/AuthContext.tsx)

**修改内容**:
1. 解析 URL 参数 `?redirect=/apply`
2. 登录成功后跳转到 redirect 指定的页面

---

## 实施顺序

1. **任务3** (国际化修复) - 最简单，立即见效
2. **任务1** (认证入口导航) - 修复核心流程
3. **任务2** (管理面板动态化) - 功能增强
4. **任务4** (登录重定向) - 体验优化

## 验证方法

1. 访问首页 http://localhost:5174
2. 未登录状态下点击"申请认证" → 应跳转到登录页
3. 登录后点击"申请认证" → 应跳转到认证页面(非注册页)
4. 以公司管理员账户登录 → 管理面板应显示该公司数据
5. 登录页面按钮文字应正确显示翻译文本
