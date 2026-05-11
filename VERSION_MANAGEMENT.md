# AntiGrind 版本管理策略

## 📌 版本号规范（Semantic Versioning）

采用 **Semantic Versioning 2.0.0** 规范：

```
MAJOR.MINOR.PATCH[-prerelease]
```

### 版本号规则

- **MAJOR**（主版本）：不兼容的 API 变更
- **MINOR**（次版本）：向下兼容的功能性新增
- **PATCH**（修订版）：向下兼容的问题修复
- **prerelease**（预发布版本）：alpha, beta, rc 等

### 当前版本

- **Backend**: `0.1.0` (初始开发版本)
- **Frontend**: `0.0.1` (初始开发版本)

## 🔄 分支管理策略

### 主要分支

```
main (生产环境)
  └── develop (开发主分支)
        ├── feature/xxx (功能分支)
        ├── bugfix/xxx (修复分支)
        └── release/x.x.x (发布准备分支)
```

#### 分支说明

| 分支类型 | 命名规范 | 用途 | 合并目标 |
|---------|---------|------|---------|
| main | `main` | 生产环境代码 | - |
| develop | `develop` | 开发集成分支 | main |
| feature | `feature/JIRA-ID-description` | 新功能开发 | develop |
| bugfix | `bugfix/JIRA-ID-description` | Bug 修复 | develop |
| hotfix | `hotfix/JIRA-ID-description` | 紧急生产修复 | main & develop |
| release | `release/x.x.x` | 发布准备 | main & develop |

## 🚀 发布流程

### 标准发布流程（Feature → Release → Main）

```mermaid
graph LR
    A[feature branch] -->|Code Review| B[develop]
    B -->|测试通过| C[release/x.x.x]
    C -->|最终测试| D[main]
    D -->|打标签| E[vx.x.x]
    E -->|部署| F[Production]
```

### 步骤详解

#### 1️⃣ 功能开发阶段

```bash
# 创建功能分支
git checkout -b feature/AGI-001-add-feature-flags

# 开发完成后提交
git add .
git commit -m "feat(backend): add feature flags system"

# 推送到远程
git push origin feature/AGI-001-add-feature-flags

# 创建 Pull Request 到 develop 分支
```

#### 2️⃣ 合并到 Develop

- 通过 Code Review
- 自动化测试通过
- 合并到 `develop` 分支

#### 3️⃣ 准备发布

```bash
# 从 develop 创建 release 分支
git checkout develop
git pull origin develop
git checkout -b release/0.2.0

# 更新版本号
# backend/app/config.py: app_version = "0.2.0"
# frontend/package.json: "version": "0.2.0"
# feature_flags.example.json: version 字段

# 提交版本更新
git commit -m "chore(release): bump version to 0.2.0"

# 合并到 main 并打标签
git checkout main
git merge release/0.2.0 --no-ff
git tag -a v0.2.0 -m "Release version 0.2.0"

# 合并回 develop
git checkout develop
git merge release/0.2.0 --no-ff

# 删除 release 分支
git branch -d release/0.2.0

# 推送标签和分支
git push origin main develop --tags
```

#### 4️⃣ 部署到生产环境

```bash
# 在生产服务器上拉取最新代码
git fetch origin --tags
git checkout v0.2.0

# 部署服务
docker-compose up -d --build
# 或手动重启服务
```

## 📝 Commit Message 规范

采用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

| Type | 说明 | 示例 |
|------|------|------|
| feat | 新功能 | feat(auth): add OAuth login support |
| fix | Bug 修复 | fix(api): resolve timeout issue on user endpoint |
| docs | 文档更新 | docs(readme): update installation guide |
| style | 代码格式调整 | style(ui): format code with prettier |
| refactor | 重构（非新功能、非修复） | refactor(db): optimize query performance |
| perf | 性能优化 | perf(api): reduce response time by 50% |
| test | 测试相关 | test(auth): add unit tests for JWT validation |
| chore | 构建/工具/辅助工具变更 | chore(deps): update dependencies |
| revert | 回滚提交 | revert: feat(api): remove broken feature |

### Scope 范围

常用 scope：
- `backend`: 后端 API
- `frontend`: 前端 UI
- `db`: 数据库相关
- `config`: 配置文件
- `docs`: 文档
- `ci/cd`: 持续集成/部署
- `test`: 测试

### 示例

```bash
feat(backend): add feature flags system for dynamic feature control

- Implement FeatureFlags class in app/feature_flags.py
- Add REST API endpoints for managing feature flags
- Create example configuration file (feature_flags.example.json)
- Integrate with existing routers and middleware

Closes #123
```

## 🏷️ 版本标签管理

### 创建标签

```bash
# 轻量标签（不推荐用于发布）
git tag v0.1.0

# 附注标签（推荐，包含元信息）
git tag -a v0.2.0 -m "Release version 0.2.0

Features:
- Add feature flags system
- Implement admin dashboard
- Improve performance monitoring

Breaking Changes:
- None

Known Issues:
- None"
```

### 推送标签

```bash
# 推送单个标签
git push origin v0.2.0

# 推送所有标签
git push origin --tags
```

### 查看标签

```bash
# 列出所有标签
git tag -l

# 查看标签详情
git show v0.2.0

# 查找匹配的标签
git tag -l 'v0.*'
```

## 📦 版本清单（Changelog）

每次发布必须更新 CHANGELOG.md，格式如下：

```markdown
## [0.2.0] - 2026-05-11

### Added
- Feature flags system for dynamic feature control
- Admin dashboard with analytics
- Performance monitoring middleware

### Changed
- Updated database schema to support new features
- Improved error handling and logging

### Fixed
- Resolved memory leak in caching system
- Fixed timezone handling issues

### Removed
- Deprecated legacy API endpoints

### Security
- Added rate limiting to sensitive endpoints
- Enhanced input validation
```

## ⚙️ 特性开关与版本管理结合

### 使用特性开关控制版本发布

特性开关允许你：
1. **渐进式发布**：先在部分用户中启用新功能
2. **快速回滚**：出问题时立即关闭功能
3. **A/B 测试**：对比不同功能的效果
4. **按环境控制**：开发/测试/生产使用不同配置

### 配置示例

**开发环境** (`feature_flags.local.json`)：
```json
{
  "version": "0.2.0-dev",
  "features": {
    "new_experimental_feature": { "enabled": true },
    "performance_monitoring": { "enabled": true }
  }
}
```

**生产环境** (`feature_flags.json`)：
```json
{
  "version": "0.2.0",
  "features": {
    "new_experimental_feature": { "enabled": false },
    "performance_monitoring": { "enabled": false }
  }
}
```

## 🔧 工具和自动化

### 推荐工具

1. **Release It** - 自动化版本发布
   ```bash
   npm install -g release-it
   release-it
   ```

2. **Standard Version** - 自动生成 Changelog
   ```bash
   npm install -D standard-version
   npx standard-version
   ```

3. **GitHub Actions** - CI/CD 自动化
   - 自动运行测试
   - 自动部署到 staging
   - 手动触发生产部署

### GitHub Actions Workflow 示例

见 `.github/workflows/deploy.yml`

## 📋 发布检查清单

发布前确认：

- [ ] 所有测试通过
- [ ] Code Review 完成
- [ ] 文档已更新
- [ ] CHANGELOG.md 已更新
- [ ] 版本号已更新（所有位置）
- [ ] 特性开关配置已审核
- [ ] 数据库迁移脚本已准备
- [ ] 回滚计划已制定
- [ ] 监控告警已配置
- [ ] 性能基准测试完成

## 🚨 紧急修复流程（Hotfix）

对于生产环境的紧急问题：

```bash
# 从 main 创建 hotfix 分支
git checkout main
git checkout -b hotfix/AGI-999-critical-bug-fix

# 修复问题
git commit -m "fix: resolve critical security vulnerability"

# 合并到 main 和 develop
git checkout main
git merge hotfix/AGI-999-critical-bug-fix
git tag -a v0.1.1 -m "Hotfix release v0.1.1"

git checkout develop
git merge hotfix/AGI-999-critical-bug-fix

# 推送并清理
git push origin main develop --tags
git branch -d hotfix/AGI-999-critical-bug-fix
```

## 📚 相关资源

- [Semantic Versioning 规范](https://semver.org/lang/zh-CN/)
- [Conventional Commits 规范](https://www.conventionalcommits.org/zh-cn/)
- [Git Flow 工作流](https://nvie.com/posts/a-successful-git-branching-model/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)

---

**最后更新**: 2026-05-11
**维护者**: AntiGrind Team
