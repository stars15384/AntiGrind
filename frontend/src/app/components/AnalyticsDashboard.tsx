import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Building2,
  ClipboardCheck,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';

interface DashboardStats {
  users: {
    total: number;
    active_7d: number;
  };
  companies: {
    total: number;
    certified: number;
  };
  certifications: {
    pending_review: number;
  };
  agi_stats: {
    average_score: number;
  };
}

export function AnalyticsDashboard() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  // Text constants for direct rendering
  const TEXT = {
    title: isEn ? 'Data Analytics' : '数据分析',
    subtitle: isEn ? 'Platform operation data and trend analysis' : '平台运营数据与趋势分析',
    charts: {
      last7Days: isEn ? 'Last 7 Days' : '最近7天',
      last30Days: isEn ? 'Last 30 Days' : '最近30天',
      last90Days: isEn ? 'Last 90 Days' : '最近90天',
      userGrowth: isEn ? 'User Growth Trend' : '用户增长趋势',
      certTrends: isEn ? 'Certification Trends' : '认证趋势',
      industryDistribution: isEn ? 'Industry Distribution' : '行业分布',
      agiDistribution: isEn ? 'AGI Score Distribution' : 'AGI评分分布',
    },
    overview: {
      totalUsers: isEn ? 'Total Users' : '总用户数',
      newUsersToday: isEn ? 'New Today' : '今日新增',
      activeUsers: isEn ? 'Active Users (7d)' : '活跃用户(7天)',
      totalCompanies: isEn ? 'Total Companies' : '公司总数',
      certifiedCompanies: isEn ? 'Certified' : '已认证',
      pendingReviews: isEn ? 'Pending Reviews' : '待审核',
      avgAgi: isEn ? 'Avg AGI Score' : '平均AGI评分',
    },
    common: {
      refresh: isEn ? 'Refresh' : '刷新',
      export: isEn ? 'Export Report' : '导出报告',
    },
    activityTimeline: isEn ? 'Recent Activity Timeline' : '最近活动时间线',
    activities: [
      {
        time: isEn ? '10 min ago' : '10分钟前',
        action: isEn ? 'New User Registration' : '新用户注册',
        detail: isEn ? 'user@example.com completed registration' : 'user@example.com 完成注册',
      },
      {
        time: isEn ? '25 min ago' : '25分钟前',
        action: isEn ? 'Certification Application Submitted' : '认证申请提交',
        detail: isEn ? 'Tech Co., Ltd. submitted certification application' : '科技有限公司 提交认证申请',
      },
      {
        time: isEn ? '1 hour ago' : '1小时前',
        action: isEn ? 'Certification Approved' : '认证审核通过',
        detail: isEn ? 'Internet Co. passed Silver certification' : '互联网公司 通过银级认证',
      },
      {
        time: isEn ? '2 hours ago' : '2小时前',
        action: isEn ? 'AGI Score Updated' : 'AGI评分更新',
        detail: isEn ? 'Tech Company AGI score adjusted from 45 to 38' : '科技公司 AGI评分从 45 调整至 38',
      },
      {
        time: isEn ? '3 hours ago' : '3小时前',
        action: isEn ? 'User Disabled' : '用户被禁用',
        detail: isEn ? 'test_user disabled for policy violation' : 'test_user 因违规行为被禁用',
      },
    ],
    chartLabels: {
      submitted: isEn ? 'Submitted:' : '提交:',
      approved: isEn ? 'Approved:' : '通过:',
      rejected: isEn ? 'Rejected:' : '拒绝:',
      greenZone: isEn ? 'Green Zone (≤30)' : '绿色区域 (≤30)',
      yellowZone: isEn ? 'Yellow Zone (31-60)' : '黄色区域 (31-60)',
      redZone: isEn ? 'Red Zone (>60)' : '红色区域 (>60)',
      excellentEnv: isEn ? 'Excellent work environment' : '优秀的工作环境',
      needsImprovement: isEn ? 'Needs improvement' : '需要改进',
      hasIssues: isEn ? 'Anti-grind issues detected' : '存在内卷问题',
      avgAgiLabel: isEn ? 'Avg AGI' : '平均AGI',
      median: isEn ? 'Median' : '中位数',
      stdDev: isEn ? 'Std Dev' : '标准差',
      totalCompaniesLabel: isEn ? 'Total Companies' : '企业总数',
    },
  };

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const metricCards = [
    {
      title: TEXT.overview.totalUsers,
      value: stats?.users.total || 0,
      subtitle: `${TEXT.overview.newUsersToday}: +${Math.floor(Math.random() * 20)}`,
      icon: <Users className="w-6 h-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      change: '+12.5%',
      positive: true,
    },
    {
      title: TEXT.overview.activeUsers,
      value: stats?.users.active_7d || 0,
      subtitle: TEXT.charts.last7Days,
      icon: <Activity className="w-6 h-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      change: '+8.2%',
      positive: true,
    },
    {
      title: TEXT.overview.totalCompanies,
      value: stats?.companies.total || 0,
      subtitle: `${TEXT.overview.certifiedCompanies}: ${stats?.companies.certified || 0}`,
      icon: <Building2 className="w-6 h-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      change: '+15.3%',
      positive: true,
    },
    {
      title: TEXT.overview.pendingReviews,
      value: stats?.certifications.pending_review || 0,
      subtitle: TEXT.overview.pendingReviews,
      icon: <ClipboardCheck className="w-6 h-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      change: '-5.1%',
      positive: false,
    },
    {
      title: TEXT.overview.avgAgi,
      value: stats?.agi_stats.average_score?.toFixed(1) || '0.0',
      subtitle: isEn ? 'AGI Score Average' : 'AGI评分平均值',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      change: '-2.4%',
      positive: false,
    },
  ];

  // Mock chart data
  const userGrowthData = [
    { date: '01/15', users: 120 },
    { date: '01/16', users: 135 },
    { date: '01/17', users: 148 },
    { date: '01/18', users: 162 },
    { date: '01/19', users: 178 },
    { date: '01/20', users: 195 },
    { date: '01/21', users: 210 },
  ];

  const certTrendData = [
    { date: '01/15', submitted: 8, approved: 5, rejected: 2 },
    { date: '01/16', submitted: 12, approved: 9, rejected: 2 },
    { date: '01/17', submitted: 10, approved: 7, rejected: 1 },
    { date: '01/18', submitted: 15, approved: 11, rejected: 3 },
    { date: '01/19', submitted: 9, approved: 6, rejected: 2 },
    { date: '01/20', submitted: 14, approved: 10, rejected: 3 },
    { date: '01/21', submitted: 11, approved: 8, rejected: 2 },
  ];

  const industryData = [
    { name: isEn ? 'IT' : 'IT', value: 35, color: '#3B82F6' },
    { name: isEn ? 'Finance' : '金融', value: 25, color: '#10B981' },
    { name: isEn ? 'Education' : '教育', value: 20, color: '#F59E0B' },
    { name: isEn ? 'Manufacturing' : '制造', value: 12, color: '#EF4444' },
    { name: isEn ? 'Others' : '其他', value: 8, color: '#8B5CF6' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {TEXT.title}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {TEXT.subtitle}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">{TEXT.charts.last7Days}</SelectItem>
              <SelectItem value="30d">{TEXT.charts.last30Days}</SelectItem>
              <SelectItem value="90d">{TEXT.charts.last90Days}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {TEXT.common.refresh}
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            {TEXT.common.export}
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {metricCards.map((card, index) => (
          <Card key={index} className={`${card.bgColor} border ${card.borderColor}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`${card.color}`}>{card.icon}</div>
                <Badge
                  variant={card.positive ? 'default' : 'destructive'}
                  className={`text-xs ${card.positive ? 'bg-green-100 text-green-700' : ''}`}
                >
                  {card.change}
                </Badge>
              </div>
              <div className={`text-3xl font-bold ${card.color} mb-1`}>
                {loading ? '-' : card.value.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">{card.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {TEXT.charts.userGrowth}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-around gap-2 pt-4">
              {userGrowthData.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                    style={{ height: `${(item.users / Math.max(...userGrowthData.map(d => d.users))) * 200}px` }}
                  >
                    <div className="text-xs text-white font-medium text-center pt-2">
                      {item.users}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{item.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Certification Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              {TEXT.charts.certTrends}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 pt-4">
              {certTrendData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{item.date}</span>
                    <div className="flex gap-3">
                      <span className="text-blue-600 font-medium">{TEXT.chartLabels.submitted} {item.submitted}</span>
                      <span className="text-green-600 font-medium">{TEXT.chartLabels.approved} {item.approved}</span>
                      <span className="text-red-600 font-medium">{TEXT.chartLabels.rejected} {item.rejected}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 h-2">
                    <div
                      className="bg-blue-500 rounded transition-all"
                      style={{ width: `${(item.submitted / 20) * 100}%` }}
                    />
                    <div
                      className="bg-green-500 rounded transition-all"
                      style={{ width: `${(item.approved / 20) * 100}%` }}
                    />
                    <div
                      className="bg-red-500 rounded transition-all"
                      style={{ width: `${(item.rejected / 20) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Industry Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              {TEXT.charts.industryDistribution}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              {/* Simple pie chart visualization using CSS */}
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="20"
                  />
                  {industryData.reduce((acc, item, index) => {
                    const offset = acc.offset;
                    const circumference = 2 * Math.PI * 40;
                    const dashArray = (item.value / 100) * circumference;
                    const dashOffset = -offset;

                    setTimeout(() => {}, 0);

                    return {
                      offset: offset + dashArray,
                      elements: [
                        ...acc.elements,
                        <circle
                          key={index}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={item.color}
                          strokeWidth="20"
                          strokeDasharray={`${dashArray} ${circumference}`}
                          strokeDashoffset={dashOffset}
                          className="transition-all duration-500"
                        />,
                      ],
                    };
                  }, { offset: 0, elements: [] as React.ReactNode[] }).elements}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{stats?.companies.total || 0}</p>
                    <p className="text-xs text-gray-500">{TEXT.chartLabels.totalCompaniesLabel}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {industryData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-700">{item.name}</span>
                  <span className="text-sm font-medium ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AGI Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {TEXT.charts.agiDistribution}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 pt-4">
              {/* Green Zone */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm font-medium text-green-700">{TEXT.chartLabels.greenZone}</span>
                  </div>
                  <span className="text-sm font-bold text-green-700">45%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: '45%' }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">{TEXT.chartLabels.excellentEnv}</p>
              </div>

              {/* Yellow Zone */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-sm font-medium text-yellow-700">{TEXT.chartLabels.yellowZone}</span>
                  </div>
                  <span className="text-sm font-bold text-yellow-700">35%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 rounded-full transition-all" style={{ width: '35%' }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">{TEXT.chartLabels.needsImprovement}</p>
              </div>

              {/* Red Zone */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm font-medium text-red-700">{TEXT.chartLabels.redZone}</span>
                  </div>
                  <span className="text-sm font-bold text-red-700">20%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: '20%' }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">{TEXT.chartLabels.hasIssues}</p>
              </div>

              {/* Statistics */}
              <div className="pt-4 border-t grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats?.agi_stats.average_score ? '32.5' : '-'}</p>
                  <p className="text-xs text-gray-500">{TEXT.chartLabels.avgAgiLabel}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">28.3</p>
                  <p className="text-xs text-gray-500">{TEXT.chartLabels.median}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">12.5</p>
                  <p className="text-xs text-gray-500">{TEXT.chartLabels.stdDev}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {TEXT.activityTimeline}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {TEXT.activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-b-0">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  index === 2 ? 'bg-green-500' :
                  index === 1 ? 'bg-yellow-500' :
                  index === 4 ? 'bg-red-500' :
                  'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{activity.action}</p>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{activity.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AnalyticsDashboard;
