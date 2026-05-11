import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Download,
  Trash2,
  UserCheck,
  UserX,
  Edit,
  Eye,
  Loader2,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Checkbox } from '@/app/components/ui/checkbox';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  user_type: string;
  is_active: boolean;
  created_at: string;
  last_active: string;
}

interface UsersResponse {
  users: User[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

export function AdminUserManagement() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const limit = 20;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: ((currentPage - 1) * limit).toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(statusFilter !== 'all' && { is_active: statusFilter === 'active' ? 'true' : 'false' }),
      });

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data: UsersResponse = await response.json();
        setUsers(data.users);
        setTotalUsers(data.pagination.total);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map((u) => u.id)));
    }
  };

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    setActionLoading(userId);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !isActive }),
      });

      if (response.ok) {
        await fetchUsers();
      }
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetail = (user: User) => {
    setSelectedUserDetail(user);
    setShowDetailModal(true);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'company_rep':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isEn ? 'en-US' : 'zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Text constants - direct rendering for reliability
  const TEXT = {
    title: isEn ? 'User Management' : '用户管理',
    subtitle: isEn ? 'Manage all user accounts in the system' : '管理系统中的所有用户账户',
    totalCount: (count: number) => isEn ? `${count} users total` : `共 ${count} 位用户`,
    searchPlaceholder: isEn ? 'Search by name or email...' : '搜索用户名或邮箱...',
    filters: {
      role: isEn ? 'Role' : '角色',
      status: isEn ? 'Status' : '状态',
      all: isEn ? 'All' : '全部',
      active: isEn ? 'Active' : '活跃',
      inactive: isEn ? 'Inactive' : '已禁用',
      employee: isEn ? 'Employee' : '员工',
      companyRep: isEn ? 'Company Rep' : '公司代表',
      admin: isEn ? 'Admin' : '管理员',
    },
    table: {
      headers: {
        id: isEn ? 'ID' : 'ID',
        username: isEn ? 'Username' : '用户名',
        email: isEn ? 'Email' : '邮箱',
        role: isEn ? 'Role' : '角色',
        type: isEn ? 'Type' : '类型',
        status: isEn ? 'Status' : '状态',
        registered: isEn ? 'Registered' : '注册时间',
        lastActive: isEn ? 'Last Active' : '最后活跃',
        actions: isEn ? 'Actions' : '操作',
      },
      actions: {
        view: isEn ? 'View' : '查看',
        edit: isEn ? 'Edit' : '编辑',
        disable: isEn ? 'Disable' : '禁用',
        enable: isEn ? 'Enable' : '启用',
        delete: isEn ? 'Delete' : '删除',
      },
      empty: isEn ? 'No users found' : '暂无用户数据',
    },
    detail: {
      title: isEn ? 'User Details' : '用户详情',
      basicInfo: isEn ? 'Basic Information' : '基本信息',
      accountInfo: isEn ? 'Account Info' : '账户信息',
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{TEXT.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{TEXT.subtitle}</p>
        </div>
        <div className="text-sm text-gray-600">
          {TEXT.totalCount(totalUsers)}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-[var(--border)] p-4 space-y-4">
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

          {/* Role Filter */}
          <Select value={roleFilter} onValueChange={(value) => { setRoleFilter(value); setCurrentPage(1); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={TEXT.filters.role} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{TEXT.filters.all}</SelectItem>
              <SelectItem value="employee">{TEXT.filters.employee}</SelectItem>
              <SelectItem value="company_rep">{TEXT.filters.companyRep}</SelectItem>
              <SelectItem value="admin">{TEXT.filters.admin}</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={TEXT.filters.status} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{TEXT.filters.all}</SelectItem>
              <SelectItem value="active">{TEXT.filters.active}</SelectItem>
              <SelectItem value="inactive">{TEXT.filters.inactive}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedUsers.size === users.length && users.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>{TEXT.table.headers.id}</TableHead>
              <TableHead>{TEXT.table.headers.username}</TableHead>
              <TableHead>{TEXT.table.headers.email}</TableHead>
              <TableHead>{TEXT.table.headers.role}</TableHead>
              <TableHead>{TEXT.table.headers.status}</TableHead>
              <TableHead>{TEXT.table.headers.registered}</TableHead>
              <TableHead>{TEXT.table.headers.lastActive}</TableHead>
              <TableHead className="text-right">{TEXT.table.headers.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: limit }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id} className={selectedUsers.has(user.id) ? 'bg-blue-50' : ''}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.has(user.id)}
                      onCheckedChange={() => handleSelectUser(user.id)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs">{user.id.slice(0, 8)}...</TableCell>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell className="text-gray-600">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role) as any}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? 'default' : 'secondary'}>
                      {user.is_active ? TEXT.filters.active : TEXT.filters.inactive}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDate(user.created_at)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDate(user.last_active)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleViewDetail(user)}
                        title={TEXT.table.actions.view}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title={TEXT.table.actions.edit}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleToggleStatus(user.id, user.is_active)}
                        disabled={actionLoading === user.id}
                        title={
                          user.is_active
                            ? TEXT.table.actions.disable
                            : TEXT.table.actions.enable
                        }
                      >
                        {actionLoading === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : user.is_active ? (
                          <UserX className="w-4 h-4 text-red-600" />
                        ) : (
                          <UserCheck className="w-4 h-4 text-green-600" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-red-600"
                        title={TEXT.table.actions.delete}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-gray-500">
                  {TEXT.table.empty}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {!loading && totalUsers > limit && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <span className="text-sm text-gray-600">
              {isEn ? `Showing ${(currentPage - 1) * limit + 1}-${Math.min(currentPage * limit, totalUsers)} of ${totalUsers}`
                 : `显示 ${(currentPage - 1) * limit + 1}-${Math.min(currentPage * limit, totalUsers)} / 共${totalUsers}`}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                {isEn ? 'Previous' : '上一页'}
              </Button>
              <span className="text-sm px-3">
                {currentPage} / {Math.ceil(totalUsers / limit)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= Math.ceil(totalUsers / limit)}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                {isEn ? 'Next' : '下一页'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedUserDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white rounded-t-xl z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{TEXT.detail.title}</h2>
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
              <div>
                <h3 className="text-lg font-semibold mb-3">{TEXT.detail.basicInfo}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">{TEXT.table.headers.username}</label>
                    <p className="font-semibold mt-1">{selectedUserDetail.username}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">{TEXT.table.headers.email}</label>
                    <p className="font-mono text-sm mt-1">{selectedUserDetail.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">{TEXT.table.headers.role}</label>
                    <p className="mt-1"><Badge variant={getRoleBadgeVariant(selectedUserDetail.role) as any}>{selectedUserDetail.role}</Badge></p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">{TEXT.table.headers.status}</label>
                    <p className="mt-1">
                      <Badge variant={selectedUserDetail.is_active ? 'default' : 'secondary'}>
                        {selectedUserDetail.is_active ? TEXT.filters.active : TEXT.filters.inactive}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Info */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">{TEXT.detail.accountInfo}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">{TEXT.table.headers.registered}</label>
                    <p className="font-mono text-sm mt-1">{formatDate(selectedUserDetail.created_at)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">{TEXT.table.headers.lastActive}</label>
                    <p className="font-mono text-sm mt-1">{formatDate(selectedUserDetail.last_active)}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-[var(--border)]">
                <Button
                  variant="outline"
                  onClick={() => handleToggleStatus(selectedUserDetail.id, selectedUserDetail.is_active)}
                  disabled={actionLoading === selectedUserDetail.id}
                >
                  {actionLoading === selectedUserDetail.id ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  {selectedUserDetail.is_active ? TEXT.table.actions.disable : TEXT.table.actions.enable}
                </Button>
                <Button variant="outline">{TEXT.table.actions.edit}</Button>
                <Button variant="destructive" className="ml-auto">
                  <Trash2 className="w-4 h-4 mr-2" />
                  {TEXT.table.actions.delete}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUserManagement;