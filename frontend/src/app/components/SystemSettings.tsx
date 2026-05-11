import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Settings,
  Save,
  RotateCcw,
  Globe,
  Shield,
  Calculator,
  Bell,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

interface PlatformSettings {
  platform_name: string;
  description: string;
  contact_email: string;
  maintenance_mode: boolean;
}

interface CertificationSettings {
  green_threshold: number;
  yellow_threshold: number;
  validity_period_days: number;
  required_evidences: number;
  min_employees: number;
}

interface AGIAlgorithmParams {
  work_hours_weight: number;
  weekend_policy_weight: number;
  overtime_weight: number;
  evidence_weight: number;
}

export function SystemSettings() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  // Text constants for direct rendering
  const TEXT = {
    title: isEn ? 'System Settings' : '系统设置',
    subtitle: isEn ? 'Configure platform parameters and system behavior' : '配置平台参数和系统行为',
    platform: {
      title: isEn ? 'Platform Configuration' : '平台配置',
      platformName: isEn ? 'Platform Name' : '平台名称',
      contactEmail: isEn ? 'Contact Email' : '联系邮箱',
      description: isEn ? 'Description' : '描述',
      maintenanceMode: isEn ? 'Maintenance Mode' : '维护模式',
      maintenanceDesc: isEn ? 'Regular users will not be able to access the platform when enabled' : '启用后，普通用户将无法访问平台',
      enabled: isEn ? 'Enabled' : '已启用',
      disabled: isEn ? 'Disabled' : '未启用',
      placeholder: {
        name: isEn ? 'Enter platform name' : '输入平台名称',
        email: isEn ? 'admin@example.com' : 'admin@example.com',
        desc: isEn ? 'Platform description...' : '平台描述...',
      },
    },
    certification: {
      title: isEn ? 'Certification Standards' : '认证标准',
      greenThreshold: isEn ? 'Green Zone Threshold (≤)' : '绿色区域阈值(≤)',
      yellowThreshold: isEn ? 'Red Zone Threshold (>)' : '红色区域阈值(>)',
      validityPeriod: isEn ? 'Validity Period (days)' : '有效期(天)',
      requiredEvidences: isEn ? 'Required Evidences' : '所需证据数',
      minEmployees: isEn ? 'Minimum Employees' : '最少员工数',
      greenDesc: isEn ? 'AGI ≤ this value is Green Zone' : 'AGI ≤ 此值为绿色区域',
      redDesc: isEn ? 'AGI > this value is Red Zone' : 'AGI > 此值为红色区域',
      previewTitle: isEn ? 'AGI Zone Preview' : 'AGI 区域预览',
      greenLabel: (val: number) => isEn ? `Green ≤${val}` : `绿色 ≤${val}`,
      yellowLabel: isEn ? 'Yellow' : '黄色',
      redLabel: (val: number) => isEn ? `Red >${val}` : `红色 >${val}`,
    },
    agiAlgorithm: {
      title: isEn ? 'AGI Algorithm Parameters' : 'AGI算法参数',
      workHoursWeight: isEn ? 'Work Hours Weight' : '工作时长权重',
      weekendPolicyWeight: isEn ? 'Weekend Policy Weight' : '周末政策权重',
      overtimeWeight: isEn ? 'Overtime Policy Weight' : '加班政策权重',
      evidenceWeight: isEn ? 'Evidence Weight' : '证据权重',
      workHoursDesc: isEn ? 'Impact weight of average weekly working hours' : '平均每周工作时长的影响权重',
      weekendDesc: isEn ? 'Impact weight of weekend policy enforcement' : '周末政策执行情况的影响权重',
      overtimeDesc: isEn ? 'Impact weight of overtime compensation policy' : '加班补偿政策的影响权重',
      evidenceDesc: isEn ? 'Impact weight of submitted evidence quantity and quality' : '提交证据数量和质量的影响权重',
      resetDefaults: isEn ? 'Reset Defaults' : '恢复默认',
      saveParams: isEn ? 'Save Parameters' : '保存参数',
      warning: isEn ? '⚠️ Warning: Modifying these parameters will affect AGI score calculations for all companies. Please proceed with caution and test thoroughly before applying changes.' : '⚠️ 注意：修改这些参数将影响所有公司的AGI评分计算。请谨慎操作并在修改前充分测试。',
      weightTotal: isEn ? 'Total Weight' : '权重总和',
      weightWarning: isEn ? 'Total weight should equal 1.0 (may need adjustment for normalization)' : '权重总和应等于 1.0（当前可能需要调整以归一化）',
    },
    notifications: {
      title: isEn ? 'Notification Settings' : '通知设置',
      enableEmail: isEn ? 'Enable Email Notifications' : '启用邮件通知',
      enableEmailDesc: isEn ? 'Send notification emails for certification review results, etc.' : '发送认证审核结果等通知邮件',
      smtpHost: isEn ? 'SMTP Server Address' : 'SMTP 服务器地址',
      smtpPort: isEn ? 'SMTP Port' : 'SMTP 端口',
      smtpUser: isEn ? 'SMTP Username' : 'SMTP 用户名',
      testEmail: isEn ? 'Send Test Email' : '发送测试邮件',
      testEmailSent: isEn ? 'Test email sent successfully!' : '测试邮件已成功发送！',
      testEmailDesc: isEn ? 'Send a test email to admin mailbox to verify configuration' : '向管理员邮箱发送测试邮件以验证配置',
      sendTest: isEn ? 'Send Test' : '发送测试',
    },
    common: {
      save: isEn ? 'Save' : '保存',
      error: isEn ? 'An error occurred' : '发生错误',
      settingsSaved: isEn ? 'Settings saved successfully' : '设置已成功保存',
      confirmReset: isEn ? 'Are you sure you want to reset to default settings?' : '确定要恢复默认设置吗？',
    },
  };

  const [activeTab, setActiveTab] = useState('platform');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Platform settings
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    platform_name: '反内卷认证平台',
    description: '透明职场文化认证系统，致力于构建健康的工作环境',
    contact_email: 'admin@antigrind.com',
    maintenance_mode: false,
  });

  // Certification settings
  const [certSettings, setCertSettings] = useState<CertificationSettings>({
    green_threshold: 30,
    yellow_threshold: 60,
    validity_period_days: 365,
    required_evidences: 10,
    min_employees: 5,
  });

  // AGI algorithm params
  const [agiParams, setAgiParams] = useState<AGIAlgorithmParams>({
    work_hours_weight: 0.35,
    weekend_policy_weight: 0.25,
    overtime_weight: 0.25,
    evidence_weight: 0.15,
  });

  // Notification settings
  const [notifSettings, setNotifSettings] = useState({
    email_enabled: true,
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    test_email_sent: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.platform) setPlatformSettings(data.platform);
        if (data.certification) setCertSettings(data.certification);
        if (data.agi_algorithm) setAgiParams(data.agi_algorithm);
        if (data.notifications) setNotifSettings(data.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveSection(section: string, data: any) {
    setSaving(section);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ section, ...data }),
      });

      if (response.ok) {
        setSuccessMessage(TEXT.common.settingsSaved);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert(TEXT.common.error);
    } finally {
      setSaving(null);
    }
  }

  async function resetToDefaults(section: string) {
    if (!confirm(TEXT.common.confirmReset)) return;

    if (section === 'platform') {
      setPlatformSettings({
        platform_name: '反内卷认证平台',
        description: '透明职场文化认证系统',
        contact_email: 'admin@antigrind.com',
        maintenance_mode: false,
      });
    } else if (section === 'certification') {
      setCertSettings({
        green_threshold: 30,
        yellow_threshold: 60,
        validity_period_days: 365,
        required_evidences: 10,
        min_employees: 5,
      });
    } else if (section === 'agi') {
      setAgiParams({
        work_hours_weight: 0.35,
        weekend_policy_weight: 0.25,
        overtime_weight: 0.25,
        evidence_weight: 0.15,
      });
    }
  }

  async function sendTestEmail() {
    setSaving('test_email');
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/settings/test-email', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifSettings(prev => ({ ...prev, test_email_sent: true }));
        setSuccessMessage(TEXT.notifications.testEmailSent);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      console.error('Failed to send test email:', error);
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-7 h-7" />
            {TEXT.title}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {TEXT.subtitle}
          </p>
        </div>
        
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-green-800 text-sm font-medium">{successMessage}</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="platform" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            {TEXT.platform.title}
          </TabsTrigger>
          <TabsTrigger value="certification" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            {TEXT.certification.title}
          </TabsTrigger>
          <TabsTrigger value="agi" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            {TEXT.agiAlgorithm.title}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            {TEXT.notifications.title}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Platform Configuration */}
        <TabsContent value="platform" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{TEXT.platform.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-12" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {TEXT.platform.platformName} *
                      </label>
                      <Input
                        value={platformSettings.platform_name}
                        onChange={(e) => setPlatformSettings(prev => ({
                          ...prev,
                          platform_name: e.target.value
                        }))}
                        placeholder={TEXT.platform.placeholder.name}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {TEXT.platform.contactEmail} *
                      </label>
                      <Input
                        type="email"
                        value={platformSettings.contact_email}
                        onChange={(e) => setPlatformSettings(prev => ({
                          ...prev,
                          contact_email: e.target.value
                        }))}
                        placeholder={TEXT.platform.placeholder.email}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {TEXT.platform.description}
                    </label>
                    <Textarea
                      value={platformSettings.description}
                      onChange={(e) => setPlatformSettings(prev => ({
                        ...prev,
                        description: e.target.value
                      }))}
                      rows={3}
                      placeholder={TEXT.platform.placeholder.desc}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-sm text-yellow-800">
                          {TEXT.platform.maintenanceMode}
                        </p>
                        <p className="text-xs text-yellow-600 mt-1">
                          {TEXT.platform.maintenanceDesc}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={platformSettings.maintenance_mode ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => setPlatformSettings(prev => ({
                        ...prev,
                        maintenance_mode: !prev.maintenance_mode
                      }))}
                    >
                      {platformSettings.maintenance_mode ? TEXT.platform.enabled : TEXT.platform.disabled}
                    </Button>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => resetToDefaults('platform')}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      {TEXT.agiAlgorithm.resetDefaults}
                    </Button>
                    <Button
                      onClick={() => saveSection('platform', platformSettings)}
                      disabled={saving === 'platform'}
                    >
                      {saving === 'platform' ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {TEXT.common.save}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Certification Standards */}
        <TabsContent value="certification" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.settings.certification.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.settings.certification.green_threshold')}
                  </label>
                  <Input
                    type="number"
                    value={certSettings.green_threshold}
                    onChange={(e) => setCertSettings(prev => ({
                      ...prev,
                      green_threshold: Number(e.target.value)
                    }))}
                    min={0}
                    max={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">AGI ≤ 此值为绿色区域</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.settings.certification.yellow_threshold')}
                  </label>
                  <Input
                    type="number"
                    value={certSettings.yellow_threshold}
                    onChange={(e) => setCertSettings(prev => ({
                      ...prev,
                      yellow_threshold: Number(e.target.value)
                    }))}
                    min={0}
                    max={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">AGI &gt; 此值为红色区域</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.settings.certification.validity_period')} (天)
                  </label>
                  <Input
                    type="number"
                    value={certSettings.validity_period_days}
                    onChange={(e) => setCertSettings(prev => ({
                      ...prev,
                      validity_period_days: Number(e.target.value)
                    }))}
                    min={30}
                    max={1095}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.settings.certification.required_evidences')}
                  </label>
                  <Input
                    type="number"
                    value={certSettings.required_evidences}
                    onChange={(e) => setCertSettings(prev => ({
                      ...prev,
                      required_evidences: Number(e.target.value)
                    }))}
                    min={1}
                    max={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.settings.certification.min_employees')}
                  </label>
                  <Input
                    type="number"
                    value={certSettings.min_employees}
                    onChange={(e) => setCertSettings(prev => ({
                      ...prev,
                      min_employees: Number(e.target.value)
                    }))}
                    min={1}
                    max={10000}
                  />
                </div>
              </div>

              {/* Visual Preview of Thresholds */}
              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-sm">AGI 区域预览</h4>
                <div className="relative h-8 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-green-500 transition-all"
                    style={{ width: `${certSettings.green_threshold}%` }}
                  >
                    <span className="text-white text-xs font-medium pl-2 leading-8">
                      绿色 ≤{certSettings.green_threshold}
                    </span>
                  </div>
                  <div 
                    className="bg-yellow-500 transition-all"
                    style={{ 
                      width: `${certSettings.yellow_threshold - certSettings.green_threshold}%`,
                      marginLeft: `${certSettings.green_threshold}%`
                    }}
                  >
                    <span className="text-white text-xs font-medium pl-2 leading-8">
                      黄色
                    </span>
                  </div>
                  <div 
                    className="bg-red-500 transition-all"
                    style={{ 
                      width: `${100 - certSettings.yellow_threshold}%`,
                      marginLeft: `${certSettings.yellow_threshold}%`
                    }}
                  >
                    <span className="text-white text-xs font-medium pl-2 leading-8">
                      红色 &gt;{certSettings.yellow_threshold}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => resetToDefaults('certification')}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t('admin.settings.agi_algorithm.reset_defaults')}
                </Button>
                <Button
                  onClick={() => saveSection('certification', certSettings)}
                  disabled={saving === 'certification'}
                >
                  {saving === 'certification' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {t('admin.common.save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: AGI Algorithm Parameters */}
        <TabsContent value="agi" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.settings.agi_algorithm.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  ⚠️ <strong>注意：</strong>修改这些参数将影响所有公司的AGI评分计算。请谨慎操作并在修改前充分测试。
                </p>
              </div>

              <div className="space-y-6">
                {[
                  {
                    key: 'work_hours_weight',
                    label: t('admin.settings.agi_algorithm.work_hours_weight'),
                    desc: '平均每周工作时长的影响权重',
                    value: agiParams.work_hours_weight,
                  },
                  {
                    key: 'weekend_policy_weight',
                    label: t('admin.settings.agi_algorithm.weekend_policy_weight'),
                    desc: '周末政策执行情况的影响权重',
                    value: agiParams.weekend_policy_weight,
                  },
                  {
                    key: 'overtime_weight',
                    label: t('admin.settings.agi_algorithm.overtime_weight'),
                    desc: '加班补偿政策的影响权重',
                    value: agiParams.overtime_weight,
                  },
                  {
                    key: 'evidence_weight',
                    label: t('admin.settings.agi_algorithm.evidence_weight'),
                    desc: '提交证据数量和质量的影响权重',
                    value: agiParams.evidence_weight,
                  },
                ].map((param) => (
                  <div key={param.key}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        {param.label}
                      </label>
                      <Badge variant="outline">{(param.value * 100).toFixed(0)}%</Badge>
                    </div>
                    
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={param.value}
                      onChange={(e) => setAgiParams(prev => ({
                        ...prev,
                        [param.key]: parseFloat(e.target.value)
                      }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    
                    <p className="text-xs text-gray-500 mt-1">{param.desc}</p>
                  </div>
                ))}
              </div>

              {/* Weight Total Indicator */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">权重总和</span>
                  <Badge 
                    variant={
                      Math.abs(1 - (agiParams.work_hours_weight + agiParams.weekend_policy_weight + 
                           agiParams.overtime_weight + agiParams.evidence_weight)) < 0.01
                        ? 'default'
                        : 'destructive'
                    }
                  >
                    {(agiParams.work_hours_weight + agiParams.weekend_policy_weight + 
                      agiParams.overtime_weight + agiParams.evidence_weight).toFixed(2)}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  权重总和应等于 1.0（当前可能需要调整以归一化）
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => resetToDefaults('agi')}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t('admin.settings.agi_algorithm.reset_defaults')}
                </Button>
                <Button
                  onClick={() => saveSection('agi_algorithm', agiParams)}
                  disabled={saving === 'agi'}
                >
                  {saving === 'agi' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {t('admin.settings.agi_algorithm.save_params')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.settings.notifications.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-sm">启用邮件通知</p>
                    <p className="text-xs text-gray-500">发送认证审核结果等通知邮件</p>
                  </div>
                </div>
                <Button
                  variant={notifSettings.email_enabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNotifSettings(prev => ({
                    ...prev,
                    email_enabled: !prev.email_enabled
                  }))}
                >
                  {notifSettings.email_enabled ? '已启用' : '已禁用'}
                </Button>
              </div>

              {notifSettings.email_enabled && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP 服务器地址
                      </label>
                      <Input
                        value={notifSettings.smtp_host}
                        onChange={(e) => setNotifSettings(prev => ({
                          ...prev,
                          smtp_host: e.target.value
                        }))}
                        placeholder="smtp.example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP 端口
                      </label>
                      <Input
                        type="number"
                        value={notifSettings.smtp_port}
                        onChange={(e) => setNotifSettings(prev => ({
                          ...prev,
                          smtp_port: Number(e.target.value)
                        }))}
                        placeholder="587"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP 用户名
                      </label>
                      <Input
                        value={notifSettings.smtp_user}
                        onChange={(e) => setNotifSettings(prev => ({
                          ...prev,
                          smtp_user: e.target.value
                        }))}
                        placeholder="username@example.com"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    {notifSettings.test_email_sent ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Mail className="w-5 h-5 text-green-600" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm text-green-800">
                        {notifSettings.test_email_sent 
                          ? '测试邮件已成功发送！'
                          : t('admin.settings.notifications.test_email')
                        }
                      </p>
                      {!notifSettings.test_email_sent && (
                        <p className="text-xs text-green-600 mt-1">
                          向管理员邮箱发送测试邮件以验证配置
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={sendTestEmail}
                      disabled={saving === 'test_email' || notifSettings.test_email_sent}
                    >
                      {saving === 'test_email' ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : null}
                      发送测试
                    </Button>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  onClick={() => saveSection('notifications', notifSettings)}
                  disabled={saving === 'notifications'}
                >
                  {saving === 'notifications' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {t('admin.common.save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SystemSettings;
