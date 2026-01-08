import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  UserCog, 
  Search, 
  Mail, 
  Phone, 
  MessageSquare,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { usersService } from '../../services/users.service';
import { useAuthStore } from '../../store/authStore';
import { UserRole, UserStatus } from '../../types/user.types';
import './Users.css';

export default function Users() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | UserRole>('All');

  // Check if user is admin
  useEffect(() => {
    if (user?.role !== UserRole.ADMIN) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch users
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['users', searchQuery, roleFilter],
    queryFn: async () => {
      const params: any = { 
        search: searchQuery,
        limit: 100 
      };
      
      if (roleFilter !== 'All') {
        params.role = roleFilter;
      }
      
      const response = await usersService.getAll(params);
      return response.items;
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) => 
      usersService.updateRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Update status mutation

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (confirm(t('users.confirmRoleChange'))) {
      await updateRoleMutation.mutateAsync({ userId, role: newRole });
    }
  };


  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'role-admin';
      case UserRole.TEAMLEAD:
        return 'role-teamlead';
      case UserRole.OPERATOR:
        return 'role-operator';
      case UserRole.PENDING:
        return 'role-pending';
      default:
        return 'role-default';
    }
  };


  const getStatusBadgeClass = (status: string) => {
    return status === UserStatus.ACTIVE ? 'status-active' : 'status-inactive';
  };

  const getInitials = (username: string) => {
    return username
      .substring(0, 2)
      .toUpperCase();
  };

  const getAvatarColor = (username: string) => {
    const colors = [
      '#6366f1',
      '#8b5cf6',
      '#ec4899',
      '#10b981',
      '#06b6d4',
      '#f59e0b',
    ];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(t('common.locale'), {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const users = data || [];

  const filteredUsers = users.filter((u) => {
    // Исключаем админов
    if (u.role === UserRole.ADMIN) return false;
    return true;
  });

  const allCount = filteredUsers.length;
  const operatorsCount = filteredUsers.filter(u => u.role === UserRole.OPERATOR).length;
  const pendingCount = filteredUsers.filter(u => u.role === UserRole.PENDING).length;

  if (isLoading) {
    return (
      <div className="users-page">
        <div className="loading-state">
          <RefreshCw size={32} className="spin" />
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-page">
      <div className="users-header">
        <div>
          <h1 className="users-title">{t('users.title')}</h1>
          <p className="users-subtitle">{t('users.subtitle')}</p>
        </div>
      </div>

      <div className="users-filters">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder={t('users.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          <button
            className={`filter-tab ${roleFilter === 'All' ? 'active' : ''}`}
            onClick={() => setRoleFilter('All')}
          >
            {t('users.filters.allRoles')} <span className="count">{allCount}</span>
          </button>
          <button
            className={`filter-tab ${roleFilter === UserRole.PENDING ? 'active' : ''}`}
            onClick={() => setRoleFilter(UserRole.PENDING)}
          >
            {t('users.roles.pending')} <span className="count">{pendingCount}</span>
          </button>
          <button
            className={`filter-tab ${roleFilter === UserRole.OPERATOR ? 'active' : ''}`}
            onClick={() => setRoleFilter(UserRole.OPERATOR)}
          >
            {t('users.roles.operator')} <span className="count">{operatorsCount}</span>
          </button>
        </div>

        <button className="btn-secondary" onClick={() => refetch()}>
          <RefreshCw size={18} />
          {t('common.refresh')}
        </button>
      </div>

      <div className="users-grid">
        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <UserCog size={48} />
            <p>{t('users.noUsers')}</p>
          </div>
        ) : (
          filteredUsers.map((userItem) => (
            <div key={userItem.id} className="user-card">
              <div className="user-card-header">
                <div className="user-info-section">
                  <div 
                    className="user-avatar-circle"
                    style={{ background: getAvatarColor(userItem.username || userItem.email) }}
                  >
                    {getInitials(userItem.username || userItem.email)}
                  </div>
                  <div className="user-details-section">
                    <h3 className="user-name-title">{userItem.username || t('users.noUsername')}</h3>
                    <div className="user-email-text">
                      <Mail size={14} />
                      {userItem.email}
                    </div>
                  </div>
                </div>
                <div className={`status-badge-button ${getStatusBadgeClass(userItem.status)}`}>
                  {userItem.status === UserStatus.ACTIVE ? (
                    <>
                      <CheckCircle size={14} />
                      {t('users.status.active')}
                    </>
                  ) : (
                    <>
                      <XCircle size={14} />
                      {t('users.status.inactive')}
                    </>
                  )}
                </div>
              </div>

              <div className="user-card-body">
                <div className="user-contact-section">
                  {userItem.phone && (
                    <div className="contact-item-row">
                      <Phone size={14} />
                      <span>{userItem.phone}</span>
                    </div>
                  )}
                  {userItem.telegram && (
                    <div className="contact-item-row">
                      <MessageSquare size={14} />
                      <span>@{userItem.telegram}</span>
                    </div>
                  )}
                  {!userItem.phone && !userItem.telegram && (
                    <div className="contact-item-row text-muted">
                      {t('users.noContact')}
                    </div>
                  )}
                </div>

                <div className="user-role-section">
                  <label className="role-label">{t('users.table.role')}</label>
                  <select
                    value={userItem.role}
                    onChange={(e) => handleRoleChange(userItem.id, e.target.value)}
                    className={`role-select-dropdown ${getRoleBadgeClass(userItem.role)}`}
                    disabled={updateRoleMutation.isPending}
                  >
                    <option value={UserRole.PENDING}>{t('users.roles.pending')}</option>
                    <option value={UserRole.OPERATOR}>{t('users.roles.operator')}</option>
                    <option value={UserRole.TEAMLEAD}>{t('users.roles.teamlead')}</option>
                    <option value={UserRole.ADMIN}>{t('users.roles.admin')}</option>
                  </select>
                </div>

                <div className="user-meta-section">
                  <div className="meta-item">
                    <span className="meta-label">{t('users.table.registered')}</span>
                    <span className="meta-value">{formatDate(userItem.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
