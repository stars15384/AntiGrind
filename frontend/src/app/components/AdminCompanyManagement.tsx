import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  Building2,
  Eye,
  Edit,
  Award,
  TrendingUp,
  LayoutGrid,
  List,
  Loader2,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';

interface Company {
  id: string;
  name: string;
  industry: string;
  agi_score: number | null;
  certification_status: string;
  employee_count?: number;
  created_at: string;
}

interface CompaniesResponse {
  companies: Company[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

export function AdminCompanyManagement() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  // Text constants for direct rendering
  const TEXT = {
    title: isEn ? 'Company Management' : '公司管理',
    subtitle: isEn ? 'Manage and monitor all registered companies' : '管理和监控所有注册公司',
    viewToggle: {
      card: isEn ? 'Card View' : '卡片视图',
      table: isEn ? 'Table View' : '表格视图',
    },
    searchPlaceholder: isEn ? 'Search companies by name or industry...' : '搜索公司名称或行业...',
    filters: {
      industry: isEn ? 'Industry' : '行业',
      certificationStatus: isEn ? 'Certification Status' : '认证状态',
      allStatuses: isEn ? 'All Statuses' : '全部状态',
      uncertified: isEn ? 'Uncertified' : '未认证',
      pending: isEn ? 'Pending Review' : '待审核',
      certified: isEn ? 'Certified' : '已认证',
      rejected: isEn ? 'Rejected' : '已拒绝',
    },
    statusLabels: {
      uncertified: isEn ? 'Uncertified' : '未认证',
      pending: isEn ? 'Pending' : '待审核',
      certified: isEn ? 'Certified' : '已认证',
      rejected: isEn ? 'Rejected' : '已拒绝',
    },
    detail: {
      title: isEn ? 'Company Details' : '公司详情',
      basicInfo: isEn ? 'Basic Information' : '基本信息',
      adjustAgi: isEn ? 'Adjust AGI Score' : '调整AGI评分',
      certInfo: isEn ? 'Certification Information' : '认证信息',
      editBtn: isEn ? 'Edit Company' : '编辑公司',
      badgeManagement: isEn ? 'Badge Management' : '徽章管理',
      viewBtn: isEn ? 'View Details' : '查看详情',
    },
    tableHeaders: {
      name: isEn ? 'Company Name' : '公司名称',
      industry: isEn ? 'Industry' : '行业',
      agiScore: isEn ? 'AGI Score' : 'AGI评分',
      certStatus: isEn ? 'Cert Status' : '认证状态',
      employees: isEn ? 'Employees' : '员工数',
      createdAt: isEn ? 'Created At' : '创建时间',
      actions: isEn ? 'Actions' : '操作',
    },
    common: {
      noData: isEn ? 'No companies found' : '暂无公司数据',
      previous: isEn ? 'Previous' : '上一页',
      next: isEn ? 'Next' : '下一页',
      showing: (from: number, to: number) =>
        isEn ? `Showing ${from}-${to}` : `显示 ${from}-${to}`,
      view: isEn ? 'View' : '查看',
      edit: isEn ? 'Edit' : '编辑',
    },
    agiDescription: {
      excellent: isEn ? 'Green Zone - Excellent work environment' : '绿色区域 - 优秀的工作环境',
      needsImprovement: isEn ? 'Yellow Zone - Needs improvement' : '黄色区域 - 需要改进',
      problematic: isEn ? 'Red Zone - Anti-grind issues detected' : '红色区域 - 存在内卷问题',
      noData: isEn ? 'No rating data available' : '暂无评分数据',
    },
    employeeLabel: (count: number) => isEn ? `${count} employees` : `${count} 员工`,
  };

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [certStatusFilter, setCertStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const limit = 20;

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      // Note: This endpoint needs to be implemented in backend
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: ((currentPage - 1) * limit).toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(industryFilter !== 'all' && { industry: industryFilter }),
        ...(certStatusFilter !== 'all' && { certification_status: certStatusFilter }),
      });

      const response = await fetch(`/api/admin/companies?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data: CompaniesResponse = await response.json();
        setCompanies(data.companies || []);
        setTotalCompanies(data.pagination?.total || 0);
      } else {
        // Fallback: Use mock data for now
        setCompanies([]);
        setTotalCompanies(0);
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, industryFilter, certStatusFilter]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleViewDetail = (company: Company) => {
    setSelectedCompany(company);
    setShowDetailPanel(true);
  };

  const getAGIColor = (score: number | null) => {
    if (!score) return 'text-gray-500';
    if (score <= 30) return 'text-green-600';
    if (score <= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAGIBackground = (score: number | null) => {
    if (!score) return 'bg-gray-100';
    if (score <= 30) return 'bg-green-50 border-green-200';
    if (score <= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'certified':
        return 'default' as const;
      case 'pending':
        return 'secondary' as const;
      case 'rejected':
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  };

  const getStatusLabel = (status: string) => {
    return TEXT.statusLabels[status as keyof typeof TEXT.statusLabels] || status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isEn ? 'en-US' : 'zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

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
          <Button
            variant={viewMode === 'card' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('card')}
          >
            <LayoutGrid className="w-4 h-4 mr-1" />
            {TEXT.viewToggle.card}
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <List className="w-4 h-4 mr-1" />
            {TEXT.viewToggle.table}
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={TEXT.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>

          {/* Industry Filter */}
          <Select value={industryFilter} onValueChange={(value) => { setIndustryFilter(value); setCurrentPage(1); }}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={TEXT.filters.industry} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{TEXT.filters.allStatuses}</SelectItem>
              <SelectItem value="IT">{isEn ? 'Information Technology' : '信息技术'}</SelectItem>
              <SelectItem value="finance">{isEn ? 'Finance' : '金融'}</SelectItem>
              <SelectItem value="education">{isEn ? 'Education' : '教育'}</SelectItem>
              <SelectItem value="manufacturing">{isEn ? 'Manufacturing' : '制造业'}</SelectItem>
              <SelectItem value="healthcare">{isEn ? 'Healthcare' : '医疗健康'}</SelectItem>
            </SelectContent>
          </Select>

          {/* Certification Status Filter */}
          <Select value={certStatusFilter} onValueChange={(value) => { setCertStatusFilter(value); setCurrentPage(1); }}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={TEXT.filters.certificationStatus} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{TEXT.filters.allStatuses}</SelectItem>
              <SelectItem value="uncertified">{TEXT.filters.uncertified}</SelectItem>
              <SelectItem value="pending">{TEXT.filters.pending}</SelectItem>
              <SelectItem value="certified">{TEXT.filters.certified}</SelectItem>
              <SelectItem value="rejected">{TEXT.filters.rejected}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content Area */}
      {viewMode === 'card' ? (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                </CardContent>
              </Card>
            ))
          ) : companies.length > 0 ? (
            companies.map((company) => (
              <Card
                key={company.id}
                className={`cursor-pointer transition-all hover:shadow-md ${getAGIBackground(company.agi_score)} border`}
                onClick={() => handleViewDetail(company)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base font-semibold line-clamp-1">
                      {company.name}
                    </CardTitle>
                    <Badge variant={getStatusBadgeVariant(company.certification_status)}>
                      {getStatusLabel(company.certification_status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="w-4 h-4" />
                    <span>{company.industry || '-'}</span>
                  </div>

                  <div className={`p-3 rounded-lg ${getAGIBackground(company.agi_score)}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">AGI Score</span>
                      <span className={`text-2xl font-bold ${getAGIColor(company.agi_score)}`}>
                        {company.agi_score ?? '-'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                    <span>{TEXT.employeeLabel(company.employee_count || 0)}</span>
                    <span>{formatDate(company.created_at)}</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetail(company);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {TEXT.detail.viewBtn}
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>{TEXT.common.noData}</p>
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {TEXT.tableHeaders.name}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {TEXT.tableHeaders.industry}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {TEXT.tableHeaders.agiScore}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {TEXT.tableHeaders.certStatus}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {TEXT.tableHeaders.employees}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {TEXT.tableHeaders.createdAt}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {TEXT.tableHeaders.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  Array.from({ length: limit }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : companies.length > 0 ? (
                  companies.map((company) => (
                    <tr
                      key={company.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleViewDetail(company)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {company.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {company.industry || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`font-bold ${getAGIColor(company.agi_score)}`}>
                          {company.agi_score ?? '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusBadgeVariant(company.certification_status)}>
                          {getStatusLabel(company.certification_status)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {company.employee_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(company.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title={TEXT.common.view}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title={TEXT.common.edit}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      {TEXT.common.noData}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Company Detail Panel */}
      {showDetailPanel && selectedCompany && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-0 md:p-4">
          <div className="bg-white rounded-t-xl md:rounded-xl w-full md:max-w-3xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold">{TEXT.detail.title}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDetailPanel(false)}
              >
                ✕
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  {TEXT.detail.basicInfo}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">{TEXT.tableHeaders.name}</label>
                    <p className="font-semibold text-lg mt-1">{selectedCompany.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">{TEXT.tableHeaders.industry}</label>
                    <p className="font-medium mt-1">{selectedCompany.industry || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">{TEXT.tableHeaders.createdAt}</label>
                    <p className="font-mono text-sm mt-1">{formatDate(selectedCompany.created_at)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">{TEXT.tableHeaders.employees}</label>
                    <p className="font-medium mt-1">{selectedCompany.employee_count || 0}</p>
                  </div>
                </div>
              </div>

              {/* AGI Score */}
              <div className={`p-6 rounded-xl border-2 ${getAGIBackground(selectedCompany.agi_score)}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-semibold">AGI Score</span>
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className={`text-5xl font-bold ${getAGIColor(selectedCompany.agi_score)}`}>
                  {selectedCompany.agi_score ?? 'N/A'}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {selectedCompany.agi_score
                    ? selectedCompany.agi_score <= 30
                      ? TEXT.agiDescription.excellent
                      : selectedCompany.agi_score <= 60
                      ? TEXT.agiDescription.needsImprovement
                      : TEXT.agiDescription.problematic
                    : TEXT.agiDescription.noData}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {}}
                >
                  {TEXT.detail.adjustAgi}
                </Button>
              </div>

              {/* Certification Info */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  {TEXT.detail.certInfo}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">{TEXT.tableHeaders.certStatus}</label>
                    <div className="mt-1">
                      <Badge variant={getStatusBadgeVariant(selectedCompany.certification_status)} className="text-base px-3 py-1">
                        {getStatusLabel(selectedCompany.certification_status)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button variant="outline" className="w-full">
                      {TEXT.detail.badgeManagement}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button className="flex-1">
                  <Edit className="w-4 h-4 mr-2" />
                  {TEXT.detail.editBtn}
                </Button>
                <Button variant="outline" className="flex-1">
                  {TEXT.detail.adjustAgi}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalCompanies > limit && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            {TEXT.common.previous}
          </Button>
          <span className="text-sm text-gray-600">
            {TEXT.common.showing((currentPage - 1) * limit + 1, Math.min(currentPage * limit, totalCompanies))}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={Math.ceil(totalCompanies / limit) === currentPage}
          >
            {TEXT.common.next}
          </Button>
        </div>
      )}
    </div>
  );
}

export default AdminCompanyManagement;
