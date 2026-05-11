import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  AlertTriangle,
  Info,
  XCircle,
  CheckCircle2,
  Clock,
  User,
  RefreshCw,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';

interface LogEntry {
  id: string;
  timestamp: string;
  operator: string;
  operator_id: string;
  action: string;
  action_type: string;
  target_type: string;
  target_id: string;
  details: string;
  ip_address: string;
  level: 'info' | 'warning' | 'error' | 'critical';
}

interface LogsResponse {
  logs: LogEntry[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

export function OperationLogs() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  // Text constants for direct rendering
  const TEXT = {
    title: isEn ? 'Operation Logs' : '操作日志',
    subtitle: isEn ? 'Track and review all system operations' : '追踪和审查所有系统操作',
    levels: {
      info: isEn ? 'Info' : '信息',
      warning: isEn ? 'Warning' : '警告',
      error: isEn ? 'Error' : '错误',
      critical: isEn ? 'Critical' : '严重',
    },
    actions: {
      exportLogs: isEn ? 'Export Logs' : '导出日志',
      viewDetails: isEn ? 'View Details' : '查看详情',
    },
    common: {
      total: isEn ? 'Total' : '总计',
      todayNew: isEn ? 'Today New' : '今日新增',
      warnings: isEn ? 'Warnings' : '警告',
      errors: isEn ? 'Errors' : '错误',
      refresh: isEn ? 'Refresh' : '刷新',
      all: isEn ? 'All' : '全部',
      search: isEn ? 'Search' : '搜索',
      noData: isEn ? 'No data found' : '暂无数据',
      tryAdjustFilters: isEn ? 'Try adjusting filters or date range' : '尝试调整筛选条件或时间范围',
      previous: isEn ? 'Previous' : '上一页',
      next: isEn ? 'Next' : '下一页',
      showing: (from: number, to: number, total: number) =>
        isEn ? `Showing ${from}-${to} of ${total}` : `显示 ${from}-${to} / 共${total}`,
    },
    searchPlaceholder: isEn ? 'Search by operator, action, or target...' : '搜索操作者、动作或目标...',
    filters: {
      actionType: isEn ? 'Action Type' : '操作类型',
      level: isEn ? 'Level' : '级别',
    },
    tableHeaders: {
      timestamp: isEn ? 'Timestamp' : '时间戳',
      operator: isEn ? 'Operator' : '操作者',
      action: isEn ? 'Action' : '动作',
      target: isEn ? 'Target' : '目标',
      ipAddress: isEn ? 'IP Address' : 'IP地址',
      actions: isEn ? 'Actions' : '操作',
      details: isEn ? 'Details' : '详情',
    },
    detailTitle: isEn ? 'Log Details' : '日志详情',
    logId: isEn ? 'Log ID' : '日志ID',
    actionType: isEn ? 'Action Type' : '操作类型',
    actionTypes: {
      user_update: isEn ? 'User Operations' : '用户操作',
      certification_approve: isEn ? 'Certification Approved' : '认证通过',
      certification_reject: isEn ? 'Certification Rejected' : '认证拒绝',
      agi_adjustment: isEn ? 'AGI Adjustment' : 'AGI调整',
      settings_change: isEn ? 'Settings Changed' : '设置修改',
      data_export: isEn ? 'Data Export' : '数据导出',
      login: isEn ? 'Login Records' : '登录记录',
    },
    toLabel: isEn ? 'to' : '至',
  };

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const limit = 20;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: ((currentPage - 1) * limit).toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(actionTypeFilter !== 'all' && { action_type: actionTypeFilter }),
        ...(levelFilter !== 'all' && { level: levelFilter }),
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo && { date_to: dateTo }),
      });

      // Mock implementation - in production this would call the actual API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockLogs: LogEntry[] = Array.from({ length: 45 }, (_, i) => ({
        id: `log_${String(i + 1).padStart(4, '0')}`,
        timestamp: new Date(Date.now() - i * 3600000 * Math.random() * 24).toISOString(),
        operator: ['Admin', 'SuperAdmin', 'Reviewer_1', 'Reviewer_2'][i % 4],
        operator_id: `user_${i + 1}`,
        action: [
          '用户状态变更',
          '认证审核通过',
          '认证审核拒绝',
          'AGI评分调整',
          '公司信息更新',
          '系统设置修改',
          '批量用户操作',
          '数据导出',
          '登录系统',
          '申诉处理',
        ][i % 10],
        action_type: [
          'user_update',
          'certification_approve',
          'certification_reject',
          'agi_adjustment',
          'company_update',
          'settings_change',
          'batch_operation',
          'data_export',
          'login',
          'appeal_handle',
        ][i % 10],
        target_type: ['User', 'Company', 'Certification', 'System'][i % 4],
        target_id: `target_${i + 1}`,
        details: `详细操作描述：${['启用用户账户', '批准银级认证', '拒绝申请（材料不全）', 'AGI从45调整为38', '更新公司行业分类', '修改认证标准阈值', '批量禁用3个违规账户', '导出用户数据CSV（120条）', '管理员登录成功', '接受申诉并重新审核'][i % 10]}`,
        ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        level: (['info', 'info', 'info', 'warning', 'error'][Math.floor(Math.random() * 5)] as 'info' | 'warning' | 'error' | 'critical'),
      }));

      setLogs(mockLogs.slice((currentPage - 1) * limit, currentPage * limit));
      setTotalLogs(mockLogs.length);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, actionTypeFilter, levelFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  function handleViewDetail(log: LogEntry) {
    setSelectedLog(log);
    setShowDetailModal(true);
  }

  function getLevelBadge(level: string) {
    switch (level) {
      case 'info':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700">
          <Info className="w-3 h-3 mr-1" />
          {TEXT.levels.info}
        </Badge>;
      case 'warning':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-700">
          <AlertTriangle className="w-3 h-3 mr-1" />
          {TEXT.levels.warning}
        </Badge>;
      case 'error':
        return <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          {TEXT.levels.error}
        </Badge>;
      case 'critical':
        return <Badge variant="destructive" className="bg-red-700">
          <XCircle className="w-3 h-3 mr-1" />
          {TEXT.levels.critical}
        </Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  }

  function getActionIcon(actionType: string) {
    switch (actionType) {
      case 'user_update': return <User className="w-4 h-4 text-blue-600" />;
      case 'certification_approve': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'certification_reject': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'login': return <Clock className="w-4 h-4 text-gray-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString(isEn ? 'en-US' : 'zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  async function handleExport(format: 'csv' | 'json') {
    try {
      alert(`${isEn ? 'Export' : '导出'} ${format.toUpperCase()} ${isEn ? 'format logs' : '格式日志'}：${isEn ? 'total' : '共'} ${totalLogs} ${isEn ? 'records' : '条记录'}`);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }

  const stats = {
    total: totalLogs,
    today: logs.filter(l => {
      const logDate = new Date(l.timestamp);
      const today = new Date();
      return logDate.toDateString() === today.toDateString();
    }).length,
    errors: logs.filter(l => l.level === 'error' || l.level === 'critical').length,
    warnings: logs.filter(l => l.level === 'warning').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-7 h-7" />
            {TEXT.title}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {TEXT.subtitle}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchLogs}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {TEXT.common.refresh}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('csv')}
          >
            <Download className="w-4 h-4 mr-2" />
            {TEXT.actions.exportLogs}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{TEXT.common.total}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">{TEXT.common.todayNew}</p>
                <p className="text-2xl font-bold text-blue-900">{stats.today}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">{TEXT.common.warnings}</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.warnings}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">{TEXT.common.errors}</p>
                <p className="text-2xl font-bold text-red-900">{stats.errors}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
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

            {/* Action Type Filter */}
            <Select value={actionTypeFilter} onValueChange={(value) => { setActionTypeFilter(value); setCurrentPage(1); }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={TEXT.filters.actionType} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{TEXT.common.all}</SelectItem>
                <SelectItem value="user_update">{TEXT.actionTypes.user_update}</SelectItem>
                <SelectItem value="certification_approve">{TEXT.actionTypes.certification_approve}</SelectItem>
                <SelectItem value="certification_reject">{TEXT.actionTypes.certification_reject}</SelectItem>
                <SelectItem value="agi_adjustment">{TEXT.actionTypes.agi_adjustment}</SelectItem>
                <SelectItem value="settings_change">{TEXT.actionTypes.settings_change}</SelectItem>
                <SelectItem value="data_export">{TEXT.actionTypes.data_export}</SelectItem>
                <SelectItem value="login">{TEXT.actionTypes.login}</SelectItem>
              </SelectContent>
            </Select>

            {/* Level Filter */}
            <Select value={levelFilter} onValueChange={(value) => { setLevelFilter(value); setCurrentPage(1); }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={TEXT.filters.level} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{TEXT.common.all}</SelectItem>
                <SelectItem value="info">{TEXT.levels.info}</SelectItem>
                <SelectItem value="warning">{TEXT.levels.warning}</SelectItem>
                <SelectItem value="error">{TEXT.levels.error}</SelectItem>
                <SelectItem value="critical">{TEXT.levels.critical}</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Range */}
            <div className="flex gap-2">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
                className="w-[160px]"
              />
              <span className="self-center text-gray-400">{TEXT.toLabel}</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
                className="w-[160px]"
              />
            </div>

            <Button onClick={fetchLogs}>
              <Filter className="w-4 h-4 mr-2" />
              {TEXT.common.search}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{TEXT.tableHeaders.timestamp}</TableHead>
                <TableHead>{TEXT.tableHeaders.operator}</TableHead>
                <TableHead>{TEXT.tableHeaders.action}</TableHead>
                <TableHead>{TEXT.tableHeaders.target}</TableHead>
                <TableHead>{TEXT.filters.level}</TableHead>
                <TableHead>{TEXT.tableHeaders.ipAddress}</TableHead>
                <TableHead className="text-right">{TEXT.tableHeaders.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: limit }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <TableRow 
                    key={log.id}
                    className={`cursor-pointer hover:bg-gray-50 ${
                      log.level === 'error' || log.level === 'critical' ? 'bg-red-50' : ''
                    }`}
                    onClick={() => handleViewDetail(log)}
                  >
                    <TableCell className="font-mono text-xs whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{log.operator}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action_type)}
                        <span className="text-sm">{log.action}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {log.target_type}: {log.target_id.slice(0, 8)}...
                      </span>
                    </TableCell>
                    <TableCell>{getLevelBadge(log.level)}</TableCell>
                    <TableCell className="font-mono text-xs text-gray-500">
                      {log.ip_address}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetail(log);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {TEXT.actions.viewDetails}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="text-gray-500">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">{TEXT.common.noData}</p>
                      <p className="text-sm mt-2">{TEXT.common.tryAdjustFilters}</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {!loading && totalLogs > limit && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-gray-600">
                {TEXT.common.showing((currentPage - 1) * limit + 1, Math.min(currentPage * limit, totalLogs), totalLogs)}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  {TEXT.common.previous}
                </Button>
                <span className="text-sm px-3">
                  {currentPage} / {Math.ceil(totalLogs / limit)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= Math.ceil(totalLogs / limit)}
                >
                  {TEXT.common.next}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b sticky top-0 bg-white rounded-t-xl z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{TEXT.detailTitle}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDetailModal(false)}
                >
                  ✕
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">{TEXT.logId}</label>
                  <p className="font-mono text-sm mt-1">{selectedLog.id}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">{TEXT.filters.level}</label>
                  <div className="mt-1">{getLevelBadge(selectedLog.level)}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">{TEXT.tableHeaders.timestamp}</label>
                  <p className="font-mono text-sm mt-1">{formatDate(selectedLog.timestamp)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">{TEXT.tableHeaders.ipAddress}</label>
                  <p className="font-mono text-sm mt-1">{selectedLog.ip_address}</p>
                </div>
              </div>

              {/* Operator & Action */}
              <div className="border-t pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">{TEXT.tableHeaders.operator}</label>
                    <p className="font-medium mt-1 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {selectedLog.operator}
                      <span className="text-gray-400 text-xs">({selectedLog.operator_id})</span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">{TEXT.tableHeaders.action}</label>
                    <p className="font-medium mt-1 flex items-center gap-2">
                      {getActionIcon(selectedLog.action_type)}
                      {selectedLog.action}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">{TEXT.tableHeaders.target}</label>
                    <p className="mt-1">
                      <Badge variant="outline">{selectedLog.target_type}</Badge>
                      <span className="ml-2 font-mono text-xs">{selectedLog.target_id}</span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">{TEXT.actionType}</label>
                    <p className="mt-1">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {selectedLog.action_type}
                      </code>
                    </p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="border-t pt-4">
                <label className="text-sm text-gray-500 block mb-2">
                  {TEXT.tableHeaders.details}
                </label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{selectedLog.details}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OperationLogs;
