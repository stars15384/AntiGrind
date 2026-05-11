# 反内卷APP (Anti-Grind) 实施计划

## 一、项目概述

### 1.1 项目愿景
建立一个透明的"工时数据库"并与消费行为挂钩，利用市场的力量倒逼企业改善工作环境。让消费者通过日常购物决策，共同抵制内卷型公司。

### 1.2 产品定位
**职场版"大众点评" + 企业ESG补充认证**

**目标用户**：
- C端：关心"我买的东西背后公司对员工好不好"的消费者
- B端：愿意展示"我们不内卷"的品牌企业

### 1.3 核心功能

#### P0 - 必须有（决定成败）
| 功能 | 用户故事 | 技术方案 |
|------|---------|---------|
| 企业认证申请入口 | 企业HR提交公司反内卷政策证明 | 表单+附件上传+人工审核 |
| 员工工作时间自报 | 员工匿名提交工时数据 | 上传钉钉/飞书考勤截图（避免定位隐私问题） |
| 反内卷指数计算 | 系统基于员工数据计算公司评分 | 算法：周均工时 + 加班频率 + 假期使用率 |
| 认证企业展示页 | 消费者搜索/浏览已认证企业 | 公开网页 + 搜索筛选 |
| 认证标签授权 | 通过认证的企业下载认证标志 | SVG/PNG徽章 + 唯一编号 |

#### P1 - 应该有（提升价值）
| 功能 | 用户故事 | 备注 |
|------|---------|------|
| 扫码查认证 | 消费者扫产品条形码跳转企业认证页 | 不做深度溯源，只做展示跳转 |
| 企业认证报告 | 认证企业获取详细评分报告 | PDF导出 |
| 认证企业合作榜单 | 按行业/地区展示TOP认证企业 | 引导媒体报道 |
| 匿名员工问答 | 认证企业员工可以匿名Q&A | 增加信息透明度 |

#### P2 - 最好有（未来功能）
| 功能 | 描述 |
|------|------|
| 认证企业产品库 | 认证企业上架自家商品，消费者可直接购买 |
| 招聘联动 | 认证企业招聘入口（与Boss直聘/猎聘联动） |
| 企业数据看板 | B端付费功能：员工工时趋势分析 |

---

## 二、技术架构

### 2.1 技术栈选型
| 层级 | 技术选型 | 说明 |
|------|----------|------|
| 前端 | React Native (Expo) | 跨平台快速部署，原生相机处理能力 |
| 后端 API | FastAPI (Python) | 高性能异步框架，适合数据处理 |
| 关系数据库 | PostgreSQL | 存储用户、公司、评分数据 |
| 图数据库 | Neo4j/ArangoDB | 企业关系穿透（品牌→制造商→母公司） |
| 缓存 | Redis | 快速查询、投票缓冲 |
| 对象存储 | MinIO/S3 | 匿名化证据存储 |
| 搜索引擎 | Meilisearch | 模糊搜索企业名称 |
| 存证 | 区块链轻节点/哈希时间戳 | 防篡改 |

### 2.2 系统架构图
```
┌─────────────────────────────────────────────────────────────┐
│                    Mobile App (React Native)                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ 条码扫描     │ │ 企业认证    │ │ 考勤截图    │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (FastAPI)                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │企业认证服务  │ │ AGI评分引擎 │ │ 标签生成    │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Storage Layer                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │PostgreSQL│ │ Neo4j    │ │  Redis   │ │ Object   │       │
│  │ (关系)   │ │ (图)     │ │ (缓存)   │ │ Storage  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## 三、数据建模

### 3.1 扫码功能调整
> ⚠️ **技术限制**：EAN-13条形码只含商品ID，不含厂商HR信息

**调整方案**：
- MVP阶段不做深度条形码溯源
- 扫码后跳转企业认证页（而非深度溯源）
- 联合厂商在产品包装印"反内卷认证"二维码（需厂商授权）

### 3.2 反内卷指数 (AGI) 评分体系

| 维度 | 权重 | 评分指标 (高分 = 高内卷) |
|------|------|-------------------------|
| 工作时长 | 40% | 40h(0分), 48h(10分), 60h(30分), 72h+(40分) |
| 双休执行 | 25% | 双休(0分), 大小周(10分), 单休(20分), 全无休(25分) |
| 加班补偿 | 15% | 法定1.5/2/3倍(0分), 固定补贴(5分), 义务加班(15分) |
| 晚班/值班 | 10% | 无晚班(0分), 偶尔值班(5分), 频繁深夜响应(10分) |
| 舆情/氛围 | 10% | 职场PUA记录、末位淘汰制、高离职率等(10分) |

**计算公式**: `AGI = Σ(Dimension_Score × Weight)`

---

## 四、功能模块

### 4.1 企业认证系统 (新增)
- 企业认证申请入口
- 认证审核流程（人工+AI）
- 认证标签生成与授权
- 认证报告导出（PDF）

### 4.2 员工打卡系统 (新增)
- APP打卡（定位+时间戳）
- 数据加密存储
- 链上存证防篡改

### 4.3 扫码检查中心
- 条码扫描（跳转认证页）
- 交通灯系统：红/黄/绿视觉反馈
- 触觉反馈

### 4.4 认证企业展示
- 认证企业列表
- 企业详情页
- 红黑榜排名
- 搜索与筛选

### 4.5 UGC 数据管道
- 匿名证据上传
- AI 敏感信息模糊处理
- 共识验证机制

### 4.6 匿名员工问答 (P1)
- 认证企业员工匿名Q&A
- 增加信息透明度

---

## 五、商业模式

### 5.1 收入来源
| 来源 | 定价 | 说明 |
|------|------|------|
| B端认证年费 | ¥999-9999/年 | 企业认证服务 |
| C端会员 | ¥9.9/月 | 解锁深度报告 |
| 数据洞察报告 | 按需 | 行业分析报告 |

### 5.2 客户细分
- **B端**：新消费品牌、ESG敏感型企业
- **C端**：25-40岁价值观消费群体

---

## 六、实施步骤

### 阶段一：MVP验证 (Week 1-4)

#### Step 1: 项目初始化
- [x] 创建后端项目结构 (FastAPI)
- [x] 创建前端项目结构 (React Native/Expo)
- [x] 配置开发环境 (Docker Compose)
- [x] 设置 CI/CD 流程

#### Step 2: 数据库设计
- [x] 设计 PostgreSQL 数据表结构
- [ ] 添加认证相关表结构
- [ ] 编写数据库迁移脚本

#### Step 3: 企业认证模块
- [ ] 企业认证申请 API
- [ ] 认证审核流程
- [ ] 认证标签生成服务

### 阶段二：核心功能开发 (Week 5-8)

#### Step 4: 考勤截图上传系统
- [ ] 截图上传 API（支持钉钉/飞书/其他来源）
- [ ] 图片存储与处理
- [ ] 截图验证流程

#### Step 5: AGI评分引擎
- [x] 评分算法实现
- [ ] 企业评分计算
- [ ] 评分更新机制

#### Step 6: 扫码功能
- [x] 条码扫描模块
- [ ] 跳转认证页逻辑
- [ ] 扫描结果展示

### 阶段三：前端开发 (Week 9-12)

#### Step 7: 企业认证页面
- [ ] 认证申请表单
- [ ] 认证状态查询
- [ ] 标签下载页面

#### Step 8: 企业展示页面
- [x] 企业详情页
- [x] 搜索页面
- [ ] 红黑榜列表

#### Step 9: 用户中心
- [x] 个人资料页
- [ ] 考勤截图上传记录
- [ ] 积分与勋章

### 阶段四：测试与上线 (Week 13-16)

#### Step 10: 测试
- [ ] 单元测试
- [ ] 集成测试
- [ ] 性能测试
- [ ] 安全审计

#### Step 11: 种子企业上线
- [ ] 招募5-10家种子企业
- [ ] 完成认证流程
- [ ] 媒体首发准备

---

## 七、数据库表结构设计

### 7.1 PostgreSQL 核心表

```sql
-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    karma_score INTEGER DEFAULT 0,
    user_type VARCHAR(20) DEFAULT 'consumer',  -- consumer, employee, hr
    created_at TIMESTAMP DEFAULT NOW()
);

-- 公司表
CREATE TABLE companies (
    id UUID PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    gs1_prefix VARCHAR(20),
    parent_company_id UUID REFERENCES companies(id),
    agi_score DECIMAL(5,2),
    verification_status VARCHAR(20) DEFAULT 'pending',
    
    -- 认证相关字段 (新增)
    certification_status VARCHAR(20) DEFAULT 'none',  -- none, pending, certified, rejected
    certification_level VARCHAR(20),  -- gold, silver, bronze
    certification_expires_at TIMESTAMP,
    certification_badge_id VARCHAR(50),
    
    -- 商业模式相关 (新增)
    subscription_tier VARCHAR(20) DEFAULT 'free',  -- free, basic, premium
    contact_email VARCHAR(100),
    contact_phone VARCHAR(20),
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- 企业认证申请表 (新增)
CREATE TABLE certifications (
    id UUID PRIMARY KEY,
    company_id UUID REFERENCES companies(id),
    status VARCHAR(20) DEFAULT 'pending',  -- pending, under_review, approved, rejected
    submitted_by UUID REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    
    -- 认证材料
    policy_document_url VARCHAR(500),
    evidence_urls TEXT[],
    
    -- 审核结果
    review_notes TEXT,
    approved_at TIMESTAMP,
    expires_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 认证标签表 (新增)
CREATE TABLE certification_badges (
    id UUID PRIMARY KEY,
    company_id UUID REFERENCES companies(id),
    certification_id UUID REFERENCES certifications(id),
    badge_code VARCHAR(50) UNIQUE,
    badge_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 考勤截图表 (替代员工打卡)
CREATE TABLE attendance_screenshots (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    company_id UUID REFERENCES companies(id),
    source VARCHAR(20) NOT NULL,  -- dingtalk, feishu, other
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',  -- pending, verified, rejected
    verified_at TIMESTAMP,
    verified_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 工时数据表
CREATE TABLE work_hour_records (
    id UUID PRIMARY KEY,
    company_id UUID REFERENCES companies(id),
    user_id UUID REFERENCES users(id),
    weekly_hours INTEGER,
    weekend_policy VARCHAR(20),
    overtime_compensation VARCHAR(50),
    shift_policy VARCHAR(50),
    source VARCHAR(20) DEFAULT 'user_reported',
    verification_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 匿名问答表 (新增)
CREATE TABLE anonymous_qa (
    id UUID PRIMARY KEY,
    company_id UUID REFERENCES companies(id),
    question TEXT NOT NULL,
    answer TEXT,
    answered_at TIMESTAMP,
    is_verified_employee BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 产品表
CREATE TABLE products (
    id UUID PRIMARY KEY,
    barcode VARCHAR(20) UNIQUE,
    name VARCHAR(200),
    brand_owner_id UUID REFERENCES companies(id),
    manufacturer_id UUID REFERENCES companies(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 证据表
CREATE TABLE evidences (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    company_id UUID REFERENCES companies(id),
    file_path VARCHAR(500),
    type VARCHAR(50),
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 八、API 接口设计

### 8.1 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户信息

### 8.2 企业认证接口 (新增)
- `POST /api/certifications/apply` - 企业申请认证
- `GET /api/certifications/{id}` - 获取认证详情
- `GET /api/certifications/company/{id}` - 获取企业认证状态
- `POST /api/certifications/{id}/review` - 审核认证（管理员）
- `GET /api/certifications/{id}/badge` - 下载认证标签
- `GET /api/certifications/{id}/report` - 导出认证报告（PDF）

### 8.3 考勤截图接口 (替代员工打卡)
- `POST /api/attendance/screenshots` - 上传考勤截图
- `GET /api/attendance/my/screenshots` - 获取我的上传记录
- `GET /api/attendance/company/{id}/stats` - 获取企业考勤统计
- `POST /api/attendance/{screenshot_id}/verify` - 验证截图（管理员）

### 8.4 扫描接口
- `GET /api/scan/barcode/{barcode}` - 条码扫描（跳转认证页）

### 8.5 公司接口
- `GET /api/companies` - 公司列表
- `GET /api/companies/{id}` - 公司详情
- `POST /api/companies` - 添加公司
- `GET /api/companies/search` - 搜索公司
- `GET /api/companies/certified` - 认证企业列表

### 8.6 工时数据接口
- `POST /api/work-hours` - 提交工时数据
- `GET /api/work-hours/company/{id}` - 获取公司工时记录
- `POST /api/work-hours/{id}/verify` - 验证工时数据

### 8.7 匿名问答接口 (新增)
- `POST /api/qa` - 提交问题
- `GET /api/qa/company/{id}` - 获取企业问答列表
- `POST /api/qa/{id}/answer` - 回答问题

---

## 九、风险与应对

| 风险 | 概率 | 影响 | 应对策略 |
|------|------|------|----------|
| 数据造假 | 高 | 高 | 引入第三方数据源，链上存证防篡改 |
| 认证公信力不足 | 高 | 高 | 联合有公信力的机构背书，公开认证方法论 |
| 企业不愿公开真实工时 | 中 | 中 | 从"鼓励制"切入，企业主动展示 |
| 条形码数据缺失 | 高 | 低 | 改为二维码授权，绕过条形码技术限制 |
| 大厂不配合 | 中 | 中 | 先聚焦中小企业，用市场压力倒逼大厂参与 |

---

## 十、关键成功因素

1. **首批认证企业质量 > 数量**：前10家认证企业决定平台调性
2. **媒体首发**：第一个认证企业公布时制造话题效应
3. **认证标准透明**：公开认证方法论，接受公众监督
4. **从小切口切入**：先做"新消费品牌"赛道

---

## 十一、融资目标

| 项目 | 估算 |
|------|------|
| MVP开发（3个月） | ¥30-50万 |
| 运营（6个月） | ¥20-30万 |
| BD/招聘种子企业 | ¥10万 |
| **合计** | **¥60-90万** |
