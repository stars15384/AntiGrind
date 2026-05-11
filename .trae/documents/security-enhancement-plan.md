# 安全增强计划：验证码 + 用户唯一性控制

## 需求分析

### 1. 验证码系统
- **注册时**：防止自动化批量注册
- **登录时**：防止暴力破解密码
- **类型**：图形验证码（4位数字/字母，干扰线）

### 2. 用户唯一性控制
- **目的**：防止恶意注册刷评分
- **手段**：
  - IP 限制注册频率（同一IP每小时最多3次）
  - 邮箱域名白名单/黑名单
  - 同一设备限制（可选）
  - 新用户评分提交冷却期

---

## 实施方案

### 后端修改

#### 任务1: 创建验证码服务模块
**新建文件**: `backend/app/services/captcha_service.py`

功能:
```python
# 生成随机验证码 (4位字母数字混合)
# 使用 Pillow 绘制带干扰线的图片
# 返回 base64 编码的图片 + 验证码文本(存Redis, 5分钟过期)
```

依赖: `Pillow` (已在 requirements.txt)

#### 任务2: 添加验证码 API 端点
**修改文件**: `backend/app/api/auth.py`

新增端点:
```
GET /api/auth/captcha - 获取验证码图片 (返回base64图片)
POST /api/auth/register - 增加 captcha_code 字段验证
POST /api/auth/login - 增加 captcha_code 字段验证
```

#### 任务3: 添加用户唯一性中间件
**新建文件**: `backend/app/middleware/rate_limit_auth.py` 或扩展现有 rate_limit.py

功能:
- IP 注册频率限制: 同一IP每小时最多3次注册尝试
- IP 登录频率限制: 同一IP每分钟最多5次登录尝试
- 记录到 Redis，使用 slowapi 扩展

#### 任务4: 数据库模型扩展 (可选)
**修改文件**: `backend/app/models/models.py`

User 表新增字段:
```python
ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)  # 注册IP
device_fingerprint: Mapped[str | None] = mapped_column(String(64), nullable=True)  # 设备指纹(可选)
register_count_today: Mapped[int] = mapped_column(Integer, default=0)  # 今日同IP注册计数
```

---

### 前端修改

#### 任务5: 创建验证码组件
**新建文件**: `frontend/src/app/components/CaptchaInput.tsx`

功能:
- 显示验证码图片 (从 /api/auth/captcha 获取)
- 点击刷新按钮重新获取
- 输入框输入验证码
- 自动校验格式

Props 接口:
```typescript
interface CaptchaInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}
```

#### 任务6: 修改注册页面
**修改文件**: `frontend/src/app/components/RegisterPage.tsx`

- 导入 CaptchaInput 组件
- 添加 captchaCode state
- 提交时包含 captcha_code 字段
- 错误处理: "验证码错误" 时自动刷新

#### 任务7: 修改登录页面
**修改文件**: `frontend/src/app/components/LoginPage.tsx`

- 导入 CaptchaInput 组件
- 添加 captchaCode state
- 登录表单包含 captcha_code
- 失败后自动刷新验证码

#### 任务8: 更新 API 客户端
**修改文件**: `frontend/src/api/auth.ts`

- register() 方法增加 captcha_code 参数
- login() 方法增加 captcha_code 参数 (通过 FormData)

#### 任务9: 更新国际化文件
**修改文件**: 
- `frontend/src/locales/zh.json`
- `frontend/src/locales/en.json`

新增翻译键:
```json
{
  "captcha": {
    "label": "验证码",
    "placeholder": "请输入验证码",
    "refresh": "刷新",
    "error_incorrect": "验证码错误",
    "error_expired": "验证码已过期，请刷新",
    "click_to_refresh": "点击图片刷新"
  },
  "auth": {
    "captcha_required": "请输入验证码",
    "rate_limit_exceeded": "操作过于频繁，请稍后再试",
    "ip_limited": "您的网络环境注册过于频繁"
  }
}
```

---

## 文件变更清单

### 新建文件 (3个)
| 文件路径 | 说明 |
|---------|------|
| `backend/app/services/captcha_service.py` | 验证码生成服务 |
| `frontend/src/app/components/CaptchaInput.tsx` | 验证码输入组件 |
| `backend/app/middleware/rate_limit_auth.py` | 用户唯一性限流 |

### 修改文件 (8个)
| 文件路径 | 修改内容 |
|---------|---------|
| `backend/app/api/auth.py` | 添加验证码端点+验证逻辑 |
| `backend/app/models/models.py` | User表增加IP/指纹字段 |
| `backend/requirements.txt` | 确认 Pillow 依赖 |
| `frontend/src/app/components/RegisterPage.tsx` | 集成验证码组件 |
| `frontend/src/app/components/LoginPage.tsx` | 集成验证码组件 |
| `frontend/src/api/auth.ts` | 增加captcha参数 |
| `frontend/src/locales/zh.json` | 中文翻译 |
| `frontend/src/locales/en.json` | 英文翻译 |

---

## 实施顺序

1. **任务1**: 创建后端验证码服务 ⭐ 核心基础
2. **任务9**: 准备国际化翻译键
3. **任务5**: 创建前端验证码组件
4. **任务2**: 添加验证码API端点
5. **任务6+8**: 修改注册页面和API
6. **任务7**: 修改登录页面
7. **任务3**: 添加IP限流中间件
8. **任务4**: (可选) 数据库模型扩展

---

## 技术细节

### 验证码生成算法
```python
import random
import string
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont

def generate_captcha():
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    
    img = Image.new('RGB', (120, 40), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # 绘制干扰线
    for _ in range(4):
        x1, y1 = random.randint(0, 120), random.randint(0, 40)
        x2, y2 = random.randint(0, 120), random.randint(0, 40)
        draw.line([(x1,y1),(x2,y2)], fill=(random.randint(0,150),)*3)
    
    # 绘制文字
    draw.text((10, 8), code, fill=(0, 0, 0))
    
    # 转base64
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    return base64.b64encode(buffer.getvalue()).decode(), code
```

### Redis 存储结构
```
captcha:{session_id} -> {code, created_at}  TTL: 300秒
rate_limit:register:{ip} -> {count, window_start}   TTL: 3600秒  
rate_limit:login:{ip} -> {count, window_start}     TTL: 60秒
```

---

## 验证方法

1. 访问注册页 → 应显示验证码图片和输入框
2. 输入错误验证码 → 提示"验证码错误"，图片自动刷新
3. 点击验证码图片 → 刷新新验证码
4. 正确完成注册 → 成功创建账户
5. 快速连续注册 → 触发频率限制提示
6. 登录流程同样需要验证码

---

## 安全策略总结

| 措施 | 目标 | 实现 |
|------|------|------|
| 图形验证码 | 防止自动化攻击 | Pillow生成+Redis存储 |
| IP注册限流 | 防止批量注册 | Redis计数器+slowapi |
| IP登录限流 | 防止暴力破解 | Redis计数器 |
| 邮箱唯一性 | 防止多账号 | 已有DB unique约束 |
| 密码复杂度 | 防止弱密码 | Pydantic validator |
