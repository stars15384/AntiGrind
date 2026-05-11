# AntiGrind Issues Tracking

**创建日期**: 2026-04-21
**项目阶段**: 立即可做 - 验证与修复

---

## ✅ 已修复问题

### #001 - 后端路由导入缺失
**严重程度**: 🔴 高 (阻塞性)  
**状态**: ✅ 已修复  
**发现时间**: 2026-04-21 10:30  
**修复时间**: 2026-04-21 10:35  

**问题描述**:
`backend/app/api/__init__.py` 文件缺少新增的 `rankings_router` 和 `admin_router` 导入，导致后端无法启动。

**错误信息**:
```
ImportError: cannot import name 'rankings_router' from 'app.api'
```

**解决方案**:
在 `__init__.py` 中添加：
```python
from app.api.rankings import router as rankings_router
from app.api.admin import router as admin_router
```

**影响范围**: 
- 所有新增API端点无法访问
- 后端服务启动失败

---

### #002 - 种子数据脚本Certification ID缺失
**严重程度**: 🔴 高 (阻塞性)  
**状态**: ✅ 已修复  
**发现时间**: 2026-04-21 11:00  
**修复时间**: 2026-04-21 11:15  

**问题描述**:
创建 `CertificationBadge` 时，`certification_id` 字段为 `None`，因为 `certification` 对象尚未 flush 到数据库，没有生成 ID。

**错误信息**:
```
sqlite3.IntegrityError: NOT NULL constraint failed: certification_badges.certification_id
```

**解决方案**:
调整脚本执行顺序，先 `session.add(cert)` + `await session.flush()` 获取 cert.id，再创建 badge：

```python
session.add(cert)
await session.flush()  # Flush to get certification ID

if company.certification_status == "certified" and cert.status == "approved":
    badge = CertificationBadge(
        certification_id=cert.id,  # 现在有ID了
        ...
    )
    session.add(badge)
```

**影响范围**: 
- 种子数据无法创建
- 演示环境无法准备

---

### #003 - Windows GBK编码不支持Emoji
**严重程度**: 🟡 中 (兼容性)  
**状态**: ✅ 已修复  
**发现时间**: 2026-04-21 10:40, 11:05  
**修复时间**: 2026-04-21 11:08  

**问题描述**:
Windows PowerShell 默认使用 GBK 编码，无法打印 Unicode emoji 字符（如 🌱✅🏢等），导致脚本运行失败。

**错误信息**:
```
UnicodeEncodeError: 'gbk' codec can't encode character '\U0001f331'
```

**解决方案**:
将所有 emoji 替换为 ASCII 文本标记：
- 🌱 → [SEED]
- ✅ → [OK]
- 🏢 → [COMPANY]
- 等等...

**影响范围**: 
- 仅影响 Windows 开发环境
- Linux/Mac 不受影响

**建议长期方案**:
1. 设置环境变量: `PYTHONIOENCODING=utf-8`
2. 使用日志系统代替 print
3. 移除或条件性使用 emoji

---

## ⚠️ 已知问题（非阻塞）

### #004 - PDF报告中文显示待验证
**严重程度**: 🟡 中  
**状态**: ⏳ 待验证  
**优先级**: P2 (可在演示前处理)

**描述**:
PDF报告生成功能已实现，但尚未测试中文内容是否正确渲染。Windows 系统可能需要额外配置中文字体。

**验证步骤**:
1. 使用 admin 账号登录
2. 访问已认证企业的认证结果页
3. 点击"下载报告(中文)"
4. 检查 PDF 中文字符是否正常显示

**预期问题**:
- 中文显示为方框 □□□
- 中文乱码
- 字体缺失警告

**预备解决方案**:
```python
# 在 report_service.py 中注册中文字体
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import platform

if platform.system() == 'Windows':
    font_path = 'C:/Windows/Fonts/simhei.ttf'  # 黑体
elif platform.system() == 'Linux':
    font_path = '/usr/share/fonts/truetype/wqy/wqy-microhei.ttc'
else:  # macOS
    font_path = '/System/Library/Fonts/PingFang.ttc'

pdfmetrics.registerFont(TTFont('SimHei', font_path))
```

---

### #005 - 排行榜性能待观察
**严重程度**: 🟢 低  
**状态**: ⏳ 观察中  
**优先级**: P3 (有缓存机制，暂不紧急)

**描述**:
当前排行榜 API 响应速度可接受（<500ms），但随着数据量增长可能变慢。已有基础缓存实现，但未启用 Redis。

**当前表现**:
- 4家认证企业: ~200ms
- 预测1000家企业: 可能达到 1-2秒

**优化方案** (如需实施):
1. 启用 Redis 缓存（5分钟 TTL）
2. 数据库索引优化（已确认索引存在）
3. 分页查询优化
4. 考虑预计算排行榜（定时任务）

---

### #006 - 前端PWA图标缺失
**严重程度**: 🟢 低  
**状态**: ⏳ 待补充  
**优先级**: P3 (不影响核心功能)

**描述**:
manifest.json 引用了 `/icons/icon-192x192.png` 和 `/icons/icon-512x512.png`，但实际文件不存在。

**影响**:
- PWA 安装时可能显示默认图标
- 不影响功能，仅影响美观

**解决方案**:
1. 使用在线工具生成简单的 PNG 图标
2. 或暂时移除 manifest.json 中的 icons 配置
3. 或使用 SVG 图标替代

**临时措施**:
目前浏览器会忽略缺失的图标文件，不会报错。

---

## 📊 问题统计

| 类别 | 数量 | 占比 |
|------|------|------|
| ✅ 已修复 | 3 | 50% |
| ⚠️ 待验证/观察 | 3 | 50% |
| ❌ 未解决 | 0 | 0% |
| **总计** | **6** | 100% |

**按严重程度**:
- 🔴 高: 2个 (已全部修复)
- 🟡 中: 2个 (1个已修复，1个待验证)
- 🟢 低: 2个 (均为非紧急)

---

## 🎯 下一步行动

### 立即处理 (今日)
- [ ] **#004**: 测试 PDF 中文渲染，必要时添加字体配置
- [ ] 启动前端开发服务器，进行完整的前端功能测试

### 短期处理 (本周)
- [ ] **#005**: 监控排行榜性能，如慢则优化
- [ ] **#006**: 生成 PWA 图标文件

### 长期改进
- [ ] 统一错误处理和日志系统
- [ ] 添加 CI 自动化测试流程
- [ ] 编写更完善的用户文档

---

## 💡 经验总结

### 本次验证发现的代码质量问题:

1. **模块导出不完整**
   - 新增模块后忘记更新 `__init__.py`
   - **预防**: 建立 checklist，每次新增路由模块时检查

2. **异步操作顺序依赖**
   - SQLAlchemy 异步 session 需要显式 flush 才能获取 ID
   - **预防**: 文档化异步操作的最佳实践

3. **跨平台兼容性**
   - Windows/Linux/macOS 编码差异
   - **预防**: 使用 logging 模块，避免直接 print emoji

---

*文档维护: AI Assistant*
*最后更新: 2026-04-21*
*版本: v1.0*
