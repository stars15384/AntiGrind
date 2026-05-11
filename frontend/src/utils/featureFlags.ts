export interface FeatureConfig {
  enabled: boolean;
  description: string;
  category?: string;
}

export interface FeatureFlags {
  [key: string]: FeatureConfig;
}

const DEFAULT_FLAGS: FeatureFlags = {
  authentication: { enabled: true, description: '用户认证系统', category: 'core' },
  company_management: { enabled: true, description: '公司信息管理', category: 'core' },
  work_hours_tracking: { enabled: true, description: '工时记录与追踪', category: 'core' },
  certification_system: { enabled: true, description: '反内卷认证系统', category: 'core' },
  ranking_system: { enabled: true, description: '公司排名系统', category: 'core' },
  attendance_checkin: { enabled: true, description: '员工考勤打卡功能', category: 'attendance' },
  evidence_upload: { enabled: true, description: '证据上传与管理', category: 'evidence' },
  scan_verification: { enabled: true, description: '扫码验证功能', category: 'verification' },
  qa_system: { enabled: true, description: '问答系统', category: 'community' },
  admin_dashboard: { enabled: true, description: '管理后台面板', category: 'admin' },
  analytics_dashboard: { enabled: true, description: '数据分析仪表盘', category: 'analytics' },
  report_export: { enabled: true, description: '报告导出功能（PDF/Excel）', category: 'reports' },
  captcha_verification: { enabled: true, description: '验证码验证（防机器人）', category: 'security' },
  i18n_support: { enabled: true, description: '国际化支持（中文/英文）', category: 'localization' },
  search_suggestions: { enabled: true, description: '搜索建议功能', category: 'search' },
  performance_monitoring: { enabled: false, description: '性能监控中间件', category: 'monitoring' },
  rate_limiting: { enabled: true, description: 'API 限流保护', category: 'security' },
  redis_cache: { enabled: false, description: 'Redis 缓存支持', category: 'infrastructure' },
  neo4j_graph: { enabled: false, description: 'Neo4j 图数据库集成', category: 'infrastructure' },
  meilisearch_search: { enabled: false, description: 'Meilisearch 全文搜索引擎', category: 'infrastructure' },
  minio_storage: { enabled: false, description: 'MinIO 对象存储', category: 'infrastructure' },
  mobile_app_support: { enabled: false, description: '移动端应用支持', category: 'platform' },
  dark_mode: { enabled: true, description: '暗黑模式主题', category: 'ui' },
  virtual_scroll: { enabled: true, description: '虚拟滚动列表优化', category: 'performance' },
};

class FeatureFlagService {
  private flags: FeatureFlags;
  private loaded: boolean = false;

  constructor() {
    this.flags = { ...DEFAULT_FLAGS };
    this.loadFromBackend();
  }

  async loadFromBackend(): Promise<void> {
    try {
      const response = await fetch('/api/features');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.features) {
          this.flags = data.data.features;
          this.loaded = true;
        }
      }
    } catch (error) {
      console.warn('Failed to load feature flags from backend, using defaults:', error);
    }
  }

  isEnabled(featureName: string): boolean {
    return this.flags[featureName]?.enabled ?? false;
  }

  isDisabled(featureName: string): boolean {
    return !this.isEnabled(featureName);
  }

  getFeatureInfo(featureName: string): FeatureConfig | undefined {
    return this.flags[featureName];
  }

  getAllFeatures(): FeatureFlags {
    return { ...this.flags };
  }

  getEnabledFeatures(): FeatureFlags {
    const result: FeatureFlags = {};
    Object.entries(this.flags).forEach(([name, config]) => {
      if (config.enabled) {
        result[name] = config;
      }
    });
    return result;
  }

  getDisabledFeatures(): FeatureFlags {
    const result: FeatureFlags = {};
    Object.entries(this.flags).forEach(([name, config]) => {
      if (!config.enabled) {
        result[name] = config;
      }
    });
    return result;
  }

  getFeaturesByCategory(category: string): FeatureFlags {
    const result: FeatureFlags = {};
    Object.entries(this.flags).forEach(([name, config]) => {
      if (config.category === category) {
        result[name] = config;
      }
    });
    return result;
  }

  isLoaded(): boolean {
    return this.loaded;
  }
}

// 单例实例
export const featureFlags = new FeatureFlagService();

// React Hook
import { useState, useEffect } from 'react';

export function useFeatureFlag(featureName: string): boolean {
  const [enabled, setEnabled] = useState(() => featureFlags.isEnabled(featureName));

  useEffect(() => {
    setEnabled(featureFlags.isEnabled(featureName));
  }, [featureName]);

  return enabled;
}

// React Hook - 获取多个特性状态
export function useFeatureFlags(featureNames: string[]): Record<string, boolean> {
  const [flags, setFlags] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    featureNames.forEach(name => {
      initial[name] = featureFlags.isEnabled(name);
    });
    return initial;
  });

  useEffect(() => {
    const updated: Record<string, boolean> = {};
    featureNames.forEach(name => {
      updated[name] = featureFlags.isEnabled(name);
    });
    setFlags(updated);
  }, [featureNames]);

  return flags;
}

// 高阶组件：根据特性开关控制渲染
import { ReactNode } from 'react';

interface FeatureGateProps {
  featureName: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureGate({ featureName, children, fallback = null }: FeatureGateProps) {
  const enabled = useFeatureFlag(featureName);
  return <>{enabled ? children : fallback}</>;
}
