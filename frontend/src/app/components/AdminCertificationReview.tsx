import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Building2,
  User,
  Loader2,
  AlertTriangle,
  Eye,
  ChevronRight,
  ChevronLeft,
  Filter,
  Search,
  MessageSquare,
  Send,
  FileCheck,
  Layers,
  BarChart3,
  Zap,
  RefreshCw,
  Download,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Input } from '@/app/components/ui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/app/components/ui/tabs';

interface CertificationItem {
  id: string;
  company_id: string;
  company_name?: string;
  status: string;
  review_stage: string;
  submitted_at: string;
  priority: number;
  assigned_to?: string;
  policy_document_url?: string;
  evidence_urls?: string;
}

interface CertificationDetail {
  certification: {
    id: string;
    status: string;
    review_stage: string;
    submitted_at: string;
    review_notes?: string;
    approved_at?: string;
    policy_document_url?: string;
    evidence_urls?: string;
    review_history?: Array<{
      stage: string;
      reviewer: string;
      decision: string;
      notes: string;
      timestamp: string;
    }>;
  };
  company?: {
    id: string;
    name: string;
    agi_score?: number;
    industry?: string;
  };
  submitter?: {
    id: string;
    username: string;
    email: string;
  };
  recent_work_hours: Array<{
    id: string;
    weekly_hours: number;
    weekend_policy: string;
    overtime_compensation: string;
    submitted_at: string;
  }>;
  work_hours_count: number;
}

interface ReviewTemplate {
  id: string;
  name: string;
  category: 'approve' | 'reject' | 'request_info';
  content: string;
}

interface AppealItem {
  id: string;
  certification_id: string;
  company_name: string;
  reason: string;
  status: string;
  submitted_at: string;
}

const REVIEW_TEMPLATES: ReviewTemplate[] = [
  {
    id: '1',
    name: '批准 - 标准通过',
    category: 'approve',
    content: '经审核，该公司提交的材料完整，工作时长符合标准，周末政策合理，加班补偿到位。AGI评分显示为绿色区域，建议批准认证。',
  },
  {
    id: '2',
    name: '批准 - 优秀表现',
    category: 'approve',
    content: '该公司在反内卷方面表现优异：平均周工作时间低于40小时，严格执行双休制度，加班有充分补偿。员工满意度高，值得作为行业标杆。',
  },
  {
    id: '3',
    name: '拒绝 - 材料不全',
    category: 'reject',
    content: '提交的申请材料不完整，缺少以下关键文件：1) 公司正式政策文件；2) 最近3个月的考勤记录；3) 加班补偿证明。请补充完整后重新提交。',
  },
  {
    id: '4',
    name: '拒绝 - 不符合标准',
    category: 'reject',
    content: '经核实，该公司存在以下问题：1) 员工平均周工作时间超过50小时；2) 频繁要求周末加班且无补偿；3) AGI评分超过60（红色区域）。不符合反内卷认证标准。',
  },
  {
    id: '5',
    name: '要求补充信息',
    category: 'request_info',
    content: '需要申请人补充以下信息以便进一步评估：1) 详细的工作时间管理制度说明；2) 最近6个月的实际工时统计报告；3) 员工对工作时间的反馈调查结果。',
  },
];

export function AdminCertificationReview() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  // Text constants for direct rendering
  const TEXT = {
    title: isEn ? 'Certification Review' : '认证审核',
    subtitle: isEn ? 'Review and manage company certification applications' : '审核和管理公司认证申请',
    queue: {
      title: isEn ? 'Review Queue' : '审核队列',
      pending: isEn ? 'Pending' : '待审核',
      inProgress: isEn ? 'In Progress' : '进行中',
    },
    stats: {
      approvalRate: isEn ? 'Approval Rate' : '通过率',
      completedToday: isEn ? 'Completed Today' : '今日完成',
    },
    appeals: {
      title: isEn ? 'Appeals Management' : '申诉管理',
      accept: isEn ? 'Accept' : '接受',
      reject: isEn ? 'Reject Appeal' : '拒绝申诉',
      reopen: isEn ? 'Reopen' : '重新开启',
    },
    templates: {
      title: isEn ? 'Review Templates' : '审核模板',
      create: isEn ? 'Create Template' : '创建模板',
      apply: isEn ? 'Apply Template' : '应用模板',
    },
    reviewForm: {
      title: isEn ? 'Review Details' : '审核详情',
      companyInfo: isEn ? 'Company Information' : '公司信息',
      applicantInfo: isEn ? 'Applicant Information' : '申请人信息',
      evidenceReview: isEn ? 'Evidence Review' : '证据审查',
      decision: isEn ? 'Review Decision' : '审核决定',
      notesPlaceholder: isEn ? 'Enter review comments and reasons...' : '输入审核意见和理由...',
      template: isEn ? 'Use Template' : '使用模板',
      approve: isEn ? 'Approve' : '批准',
      reject: isEn ? 'Reject' : '拒绝',
      requestInfo: isEn ? 'Request Info' : '请求信息',
    },
    stages: {
      initial: isEn ? 'Initial Review' : '初审',
      secondary: isEn ? 'Secondary Review' : '复审',
      final: isEn ? 'Final Review' : '终审',
    },
    common: {
      refresh: isEn ? 'Refresh' : '刷新',
      export: isEn ? 'Export' : '导出',
      all: isEn ? 'All' : '全部',
      search: isEn ? 'Search' : '搜索',
      noData: isEn ? 'No pending certifications' : '暂无待审核认证',
      selectCert: isEn ? 'Select a Certification' : '选择一个认证',
      selectHint: isEn ? 'Click on a certification from the list to view details' : '点击列表中的认证查看详情',
      highPriority: isEn ? 'High Priority' : '高优先级',
      error: isEn ? 'An error occurred' : '发生错误',
      certLevel: isEn ? 'Certification Level' : '认证等级',
      reviewHistory: isEn ? 'Review History' : '审核历史',
    },
    batchReview: {
      selected: (count: number) => isEn ? `${count} selected` : `已选 ${count} 项`,
      warning: isEn ? 'Are you sure you want to perform batch operation?' : '确定要执行批量操作吗？',
      approveAll: isEn ? 'Approve All' : '全部批准',
      rejectAll: isEn ? 'Reject All' : '全部拒绝',
    },
    categoryLabels: {
      approve: isEn ? 'Approve' : '批准',
      reject: isEn ? 'Reject' : '拒绝',
      request_info: isEn ? 'Request Info' : '补充信息',
    },
  };

  const [activeTab, setActiveTab] = useState('queue');
  
  // Queue state
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  
  // Detail state
  const [selectedCert, setSelectedCert] = useState<CertificationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [certificationLevel, setCertificationLevel] = useState('silver');
  const [showTemplates, setShowTemplates] = useState(false);
  
  // Appeals state
  const [appeals, setAppeals] = useState<AppealItem[]>([]);
  const [appealLoading, setAppealLoading] = useState(false);
  
  // Stats state
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completedToday: 0,
    avgTime: '2.5h',
    approvalRate: '78%',
  });

  useEffect(() => {
    fetchPendingCertifications();
    fetchAppeals();
    fetchStats();
  }, []);

  async function fetchPendingCertifications() {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams({
        limit: '50',
        ...(searchTerm && { search: searchTerm }),
        ...(stageFilter !== 'all' && { review_stage: stageFilter }),
      });
      
      const response = await fetch(`/api/admin/certifications/pending?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCertifications(data.certifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch certifications:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAppeals() {
    setAppealLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/certifications/appeals?limit=10', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAppeals(data.appeals || []);
      }
    } catch (error) {
      console.error('Failed to fetch appeals:', error);
    } finally {
      setAppealLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/certifications/stats', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }

  async function handleViewDetail(certId: string) {
    setDetailLoading(true);
    setSelectedCert(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/certifications/${certId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data: CertificationDetail = await response.json();
        setSelectedCert(data);
        setReviewNotes('');
      }
    } catch (error) {
      console.error('Failed to fetch certification detail:', error);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleReview(certId: string, action: 'approve' | 'reject' | 'request_info') {
    if (!reviewNotes.trim() && action !== 'approve') {
      alert(TEXT.reviewForm.notesPlaceholder);
      return;
    }

    setReviewingId(certId);
    setActionSuccess(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/certifications/${certId}/review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approved: action === 'approve',
          notes: reviewNotes,
          certification_level: certificationLevel,
          action: action,
        }),
      });

      if (response.ok) {
        const result = await response.json();

        const message = action === 'approve'
          ? (isEn ? 'Certification approved successfully' : '认证已成功批准')
          : action === 'reject'
          ? (isEn ? 'Certification rejected' : '认证已拒绝')
          : (isEn ? 'Information requested' : '已请求补充信息');

        setActionSuccess(message);

        setTimeout(() => {
          setSelectedCert(null);
          fetchPendingCertifications();
          fetchStats();
          setActionSuccess(null);
        }, 2000);
      }
    } catch (error) {
      console.error('Review failed:', error);
      alert(TEXT.common.error);
    } finally {
      setReviewingId(null);
    }
  }

  function applyTemplate(template: ReviewTemplate) {
    setReviewNotes(template.content);
    setShowTemplates(false);

    // Auto-select level based on template
    if (template.name.includes('优秀') || template.name.includes('excellent')) {
      setCertificationLevel('gold');
    } else if (template.name.includes('标准') || template.name.includes('standard')) {
      setCertificationLevel('silver');
    }
  }

  function handleSelectItem(certId: string) {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(certId)) {
        newSet.delete(certId);
      } else {
        newSet.add(certId);
      }
      return newSet;
    });
  }

  async function handleBatchReview(action: 'approve_all' | 'reject_all') {
    if (selectedItems.size === 0) return;

    if (!confirm(TEXT.batchReview.warning)) return;

    setReviewingId('batch');
    try {
      const token = localStorage.getItem('auth_token');
      const promises = Array.from(selectedItems).map(certId =>
        fetch(`/api/admin/certifications/${certId}/review`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            approved: action === 'approve_all',
            notes: `批量${action === 'approve_all' ? '批准' : '拒绝'}操作`,
            certification_level: 'silver',
          }),
        })
      );

      await Promise.all(promises);
      setSelectedItems(new Set());
      await fetchPendingCertifications();
      await fetchStats();
    } catch (error) {
      console.error('Batch review failed:', error);
    } finally {
      setReviewingId(null);
    }
  }

  function getStageBadge(stage: string) {
    const stages: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; color: string }> = {
      initial_review: {
        label: TEXT.stages.initial,
        variant: 'secondary',
        color: 'bg-blue-100 text-blue-700'
      },
      secondary_review: {
        label: TEXT.stages.secondary,
        variant: 'default',
        color: 'bg-yellow-100 text-yellow-700'
      },
      final_review: {
        label: TEXT.stages.final,
        variant: 'outline',
        color: 'bg-purple-100 text-purple-700'
      },
    };

    return stages[stage] || { label: stage, variant: 'outline', color: 'bg-gray-100 text-gray-700' };
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">{TEXT.queue.pending}</Badge>;
      case 'under_review':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">
          {TEXT.queue.inProgress}
        </Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">
          {isEn ? 'Certified' : '已认证'}
        </Badge>;
      case 'rejected':
        return <Badge variant="destructive">{isEn ? 'Rejected' : '已拒绝'}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString(isEn ? 'en-US' : 'zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

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
          <Button variant="outline" onClick={fetchStats}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {TEXT.common.refresh}
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {TEXT.common.export}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">{TEXT.queue.pending}</p>
                <p className="text-3xl font-bold text-blue-900">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">{TEXT.queue.inProgress}</p>
                <p className="text-3xl font-bold text-yellow-900">{stats.inProgress}</p>
              </div>
              <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">{TEXT.stats.completedToday}</p>
                <p className="text-3xl font-bold text-green-900">{stats.completedToday}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700">{TEXT.stats.approvalRate}</p>
                <p className="text-3xl font-bold text-purple-900">{stats.approvalRate}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="queue" className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            {TEXT.queue.title}
            {stats.pending > 0 && (
              <Badge variant="destructive" className="ml-2 px-2 py-0 text-xs">
                {stats.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="appeals" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            {TEXT.appeals.title}
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            {TEXT.templates.title}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Review Queue */}
        <TabsContent value="queue" className="space-y-4">
          {/* Search and Filters */}
          <div className="bg-white rounded-lg border p-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder={isEn ? 'Search certifications...' : '搜索认证...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={TEXT.reviewForm.decision} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{TEXT.common.all}</SelectItem>
                  <SelectItem value="initial_review">{TEXT.stages.initial}</SelectItem>
                  <SelectItem value="secondary_review">{TEXT.stages.secondary}</SelectItem>
                  <SelectItem value="final_review">{TEXT.stages.final}</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={fetchPendingCertifications}>
                <Filter className="w-4 h-4 mr-2" />
                {TEXT.common.search}
              </Button>
            </div>

            {/* Batch Actions */}
            {selectedItems.size > 0 && (
              <div className="flex items-center gap-4 pt-4 border-t">
                <span className="text-sm font-medium">
                  {TEXT.batchReview.selected(selectedItems.size)}
                </span>
                <Button
                  size="sm"
                  onClick={() => handleBatchReview('approve_all')}
                  disabled={reviewingId === 'batch'}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  {TEXT.batchReview.approveAll}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleBatchReview('reject_all')}
                  disabled={reviewingId === 'batch'}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  {TEXT.batchReview.rejectAll}
                </Button>
              </div>
            )}
          </div>

          {/* Certifications List and Detail */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Queue List */}
            <div className="lg:col-span-1 space-y-3 max-h-[800px] overflow-y-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    {isEn ? 'Review Queue' : '审核队列'}
                    <Badge variant="outline">{certifications.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-24" />
                    ))
                  ) : certifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>{TEXT.common.noData}</p>
                    </div>
                  ) : (
                    certifications.map((cert) => {
                      const stageInfo = getStageBadge(cert.review_stage);
                      return (
                        <button
                          key={cert.id}
                          onClick={() => handleViewDetail(cert.id)}
                          className={`w-full text-left p-4 rounded-lg border transition-all ${
                            selectedCert?.certification.id === cert.id
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <input
                                type="checkbox"
                                checked={selectedItems.has(cert.id)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleSelectItem(cert.id);
                                }}
                                className="rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {cert.company_name || cert.company_id?.slice(0, 8)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatDate(cert.submitted_at)}
                                </p>
                              </div>
                            </div>
                            {getStatusBadge(cert.status)}
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={`text-xs ${stageInfo.color}`} variant="outline">
                              {stageInfo.label}
                            </Badge>
                            {cert.priority > 3 && (
                              <Badge variant="destructive" className="text-xs">
                                {TEXT.common.highPriority}
                              </Badge>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Detail & Review Form */}
            <div className="lg:col-span-2">
              {detailLoading ? (
                <Card className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </Card>
              ) : selectedCert ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileCheck className="w-5 h-5" />
                          {TEXT.reviewForm.title}
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          ID: {selectedCert.certification.id.slice(0, 12)}...
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(selectedCert.certification.status)}
                        {getStageBadge(selectedCert.certification.review_stage).label && (
                          <Badge variant="outline" className={
                            getStageBadge(selectedCert.certification.review_stage).color
                          }>
                            {getStageBadge(selectedCert.certification.review_stage).label}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Success Message */}
                    {actionSuccess && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="text-green-800 font-medium">{actionSuccess}</span>
                      </div>
                    )}

                    {/* Company Info */}
                    {selectedCert.company && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          {TEXT.reviewForm.companyInfo}
                        </h3>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <span className="text-gray-500">{isEn ? 'Name' : '名称'}:</span>
                            <p className="font-medium mt-1">{selectedCert.company.name}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">{isEn ? 'Industry' : '行业'}:</span>
                            <p className="font-medium mt-1 capitalize">{selectedCert.company.industry}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">AGI:</span>
                            <p className={`font-bold text-lg mt-1 ${
                              (selectedCert.company.agi_score || 0) <= 30 ? 'text-green-600' :
                              (selectedCert.company.agi_score || 0) <= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {selectedCert.company.agi_score || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Submitter Info */}
                    {selectedCert.submitter && (
                      <div className="border-l-4 border-blue-200 pl-4">
                        <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {TEXT.reviewForm.applicantInfo}
                        </h3>
                        <p className="text-sm">
                          {selectedCert.submitter.username} ({selectedCert.submitter.email})
                        </p>
                      </div>
                    )}

                    {/* Work Hours Summary */}
                    {selectedCert.work_hours_count > 0 && (
                      <div>
                        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {TEXT.reviewForm.evidenceReview} ({selectedCert.work_hours_count})
                        </h3>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {selectedCert.recent_work_hours.slice(0, 5).map((record) => (
                            <div key={record.id} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                              <span>{record.weekly_hours}h/week</span>
                              <span className="capitalize">{record.weekend_policy.replace('_', ' ')}</span>
                              <span className="capitalize">{record.overtime_compensation}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Review History */}
                    {selectedCert.certification.review_history && selectedCert.certification.review_history.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-sm mb-3">{TEXT.common.reviewHistory}</h3>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {selectedCert.certification.review_history.map((history, idx) => (
                            <div key={idx} className="flex items-start gap-3 text-xs bg-gray-50 p-2 rounded">
                              <Badge variant="outline" className="mt-0.5">
                                {history.stage}
                              </Badge>
                              <div className="flex-1">
                                <p><strong>{history.reviewer}</strong> - {history.decision}</p>
                                <p className="text-gray-500 mt-1">{history.notes}</p>
                                <p className="text-gray-400">{formatDate(history.timestamp)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Review Form */}
                    <div className="border-t pt-6 space-y-4">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {TEXT.reviewForm.decision}
                      </h3>

                      {/* Certification Level Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {TEXT.common.certLevel}
                        </label>
                        <Select value={certificationLevel} onValueChange={setCertificationLevel}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bronze">{isEn ? 'Bronze' : '铜牌 Bronze'}</SelectItem>
                            <SelectItem value="silver">{isEn ? 'Silver' : '银牌 Silver'}</SelectItem>
                            <SelectItem value="gold">{isEn ? 'Gold' : '金牌 Gold'}</SelectItem>
                            <SelectItem value="platinum">{isEn ? 'Platinum' : '白金 Platinum'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Template Selector */}
                      <div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowTemplates(!showTemplates)}
                          className="mb-2"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          {TEXT.reviewForm.template}
                        </Button>

                        {showTemplates && (
                          <div className="border rounded-lg p-3 space-y-2 bg-gray-50">
                            {REVIEW_TEMPLATES.map((template) => (
                              <button
                                key={template.id}
                                onClick={() => applyTemplate(template)}
                                className="w-full text-left p-2 rounded hover:bg-white transition-colors text-sm"
                              >
                                <p className="font-medium">{template.name}</p>
                                <p className="text-xs text-gray-500 line-clamp-2">{template.content.slice(0, 80)}...</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Notes Textarea */}
                      <Textarea
                        placeholder={TEXT.reviewForm.notesPlaceholder}
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        rows={5}
                      />

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleReview(selectedCert.certification.id, 'approve')}
                          disabled={reviewingId === selectedCert.certification.id}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          {reviewingId === selectedCert.certification.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                          )}
                          {TEXT.reviewForm.approve}
                        </Button>

                        <Button
                          variant="destructive"
                          onClick={() => handleReview(selectedCert.certification.id, 'reject')}
                          disabled={reviewingId === selectedCert.certification.id}
                          className="flex-1"
                        >
                          {reviewingId === selectedCert.certification.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4 mr-2" />
                          )}
                          {TEXT.reviewForm.reject}
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => handleReview(selectedCert.certification.id, 'request_info')}
                          disabled={reviewingId === selectedCert.certification.id}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {TEXT.reviewForm.requestInfo}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="flex items-center justify-center py-20 text-gray-500">
                  <div className="text-center">
                    <Eye className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">{TEXT.common.selectCert}</p>
                    <p className="text-sm mt-2">{TEXT.common.selectHint}</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Appeals Management */}
        <TabsContent value="appeals">
          <Card>
            <CardHeader>
              <CardTitle>{TEXT.appeals.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {appealLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-32" />
                  ))}
                </div>
              ) : appeals.length > 0 ? (
                <div className="space-y-4">
                  {appeals.map((appeal) => (
                    <div key={appeal.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{appeal.company_name}</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDate(appeal.submitted_at)}
                          </p>
                        </div>
                        <Badge variant={appeal.status === 'pending' ? 'secondary' : 'default'}>
                          {appeal.status}
                        </Badge>
                      </div>

                      <p className="text-sm bg-gray-50 p-3 rounded">
                        {appeal.reason}
                      </p>

                      <div className="flex gap-2">
                        <Button size="sm" variant="default">
                          {TEXT.appeals.accept}
                        </Button>
                        <Button size="sm" variant="outline">
                          {TEXT.appeals.reject}
                        </Button>
                        <Button size="sm" variant="secondary">
                          {TEXT.appeals.reopen}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>{TEXT.common.noData}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Templates Management */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{TEXT.templates.title}</CardTitle>
                <Button size="sm">
                  + {TEXT.templates.create}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {REVIEW_TEMPLATES.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{template.name}</h4>
                        <Badge
                          variant={template.category === 'approve' ? 'default' :
                                   template.category === 'reject' ? 'destructive' : 'secondary'}
                          className="mt-2"
                        >
                          {template.category === 'approve' ? TEXT.categoryLabels.approve :
                           template.category === 'reject' ? TEXT.categoryLabels.reject :
                           TEXT.categoryLabels.request_info}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          ✏️
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                          🗑️
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {template.content}
                    </p>
                    
                    <Button variant="outline" size="sm" className="w-full">
                      {TEXT.templates.apply}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdminCertificationReview;
