# AntiGrind - 反内卷APP

一个透明的"工时数据库"，让消费者通过日常购物决策，共同抵制内卷型公司。

## 核心功能

- **企业红黑榜**：用户上传验证过的公司工时、加班费、双休情况
- **扫码识企业**：扫描商品条形码，自动关联背后的母公司及其"内卷指数"
- **避雷指南**：消费时实时提醒，推荐"员工友好型"企业的替代产品
- **社区激励**：贡献真实工时数据获得积分或勋章

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React Native (Expo) |
| 后端 API | FastAPI (Python) |
| 关系数据库 | PostgreSQL |
| 图数据库 | Neo4j |
| 缓存 | Redis |
| 搜索引擎 | Meilisearch |
| 对象存储 | MinIO |

## 项目结构

```
AntiGrind/
├── backend/                 # FastAPI 后端
│   ├── app/
│   │   ├── api/            # API 路由
│   │   ├── models/         # 数据库模型
│   │   ├── schemas/        # Pydantic 模型
│   │   ├── services/       # 业务逻辑
│   │   └── main.py         # 应用入口
│   ├── migrations/         # 数据库迁移
│   └── requirements.txt
├── mobile/                  # React Native 前端
│   ├── app/                # Expo Router 页面
│   ├── src/
│   │   ├── api/            # API 客户端
│   │   ├── components/     # UI 组件
│   │   ├── screens/        # 页面
│   │   ├── stores/         # 状态管理
│   │   └── types/          # TypeScript 类型
│   └── package.json
└── docker-compose.yml       # 开发环境配置
```

## 快速开始

### 1. 启动开发环境

```bash
docker-compose up -d
```

### 2. 后端设置

```bash
cd backend
cp .env.example .env
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

### 3. 前端设置

```bash
cd mobile
cp .env.example .env
npm install
npx expo start
```

## API 文档

启动后端后访问：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## AGI 评分体系

反内卷指数 (Anti-Grind Index) 评分维度：

| 维度 | 权重 | 说明 |
|------|------|------|
| 工作时长 | 40% | 每周平均工时 |
| 双休执行 | 25% | 休息制度执行情况 |
| 加班补偿 | 15% | 加班费支付情况 |
| 晚班/值班 | 10% | 夜班频率 |
| 舆情/氛围 | 10% | 职场环境评价 |

分数越高代表内卷程度越高（越值得抵制）。

## License

MIT
