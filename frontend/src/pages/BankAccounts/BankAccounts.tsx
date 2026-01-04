import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CreditCard, 
  Search, 
  Plus, 
  RefreshCw, 
  Edit2,
  TrendingUp,
  Calendar,
  Building
} from 'lucide-react';
import { bankAccountsService, BankAccount } from '../../services/bank-accounts.service';
import { banksService } from '../../services/banks.service';
import { usersService } from '../../services/users.service';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { UserRole } from '../../types/user.types';
import './BankAccounts.css';

const ACCOUNT_STATUSES = {
  WORKING: 'working',
  NOT_WORKING: 'not_working',
  BLOCKED: 'blocked',
};

const ACCOUNT_TYPES = {
  PERSONAL: 'personal',
  BUSINESS: 'business',
};

export default function BankAccounts() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const timeFormat = useAppStore((state) => state.timeFormat);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [formData, setFormData] = useState({
    userId: '',
    dropId: '',
    bankId: '',
    cbu: '',
    alias: '',
    accountType: ACCOUNT_TYPES.PERSONAL,
    limitAmount: 0,
    priority: 1,
    blockReason: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch accounts
  const { data: accountsData, refetch } = useQuery({
    queryKey: ['bank-accounts', searchQuery, statusFilter],
    queryFn: async () => {
      const params: any = { 
        limit: 100 
      };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      const response = await bankAccountsService.getAll(params);
      return response;
    },
  });


  // Fetch banks
  const { data: banksData } = useQuery({
    queryKey: ['banks-list'],
    queryFn: () => banksService.getAll({ limit: 100, status: 'active' }),
  });

  // Fetch users (operators)
  const { data: usersData } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => usersService.getAll({ role: UserRole.OPERATOR, limit: 100 }),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => bankAccountsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      setIsCreateModalOpen(false);
      resetForm();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      bankAccountsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      setIsEditModalOpen(false);
      setSelectedAccount(null);
      resetForm();
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      bankAccountsService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
    },
  });

  // Update priority mutation
  const updatePriorityMutation = useMutation({
    mutationFn: ({ id, priority }: { id: string; priority: number }) => 
      bankAccountsService.updatePriority(id, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
    },
  });

  const validateCBU = (cbu: string): boolean => {
    // CBU должен быть строго 22 цифры
    const cbuRegex = /^\d{22}$/;
    return cbuRegex.test(cbu);
  };

  const validateAlias = (alias: string): boolean => {
    // Alias минимум 6 символов
    return alias.length >= 6;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.userId) {
      newErrors.userId = 'User is required';
    }

    if (!formData.bankId) {
      newErrors.bankId = 'Bank is required';
    }

    if (!validateCBU(formData.cbu)) {
      newErrors.cbu = 'CBU must be exactly 22 digits';
    }

    if (!validateAlias(formData.alias)) {
      newErrors.alias = 'Alias must be at least 6 characters';
    }

    if (formData.limitAmount <= 0) {
      newErrors.limitAmount = 'Limit amount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      dropId: '',
      bankId: '',
      cbu: '',
      alias: '',
      accountType: ACCOUNT_TYPES.PERSONAL,
      limitAmount: 0,
      priority: 1,
      blockReason: '',
    });
    setErrors({});
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
    resetForm();
  };

  const handleEdit = (account: BankAccount) => {
    setSelectedAccount(account);
    setFormData({
      userId: '', // userId не используется в BankAccount
      dropId: String(account.dropId || ''),
      bankId: String(account.bankId),
      cbu: account.cbu,
      alias: account.alias,
      accountType: 'personal', // accountType не используется
      limitAmount: account.initialLimitAmount,
      priority: account.priority,
      blockReason: '',
    });
    setIsEditModalOpen(true);
  };

  const handleSubmitCreate = () => {
    if (!validateForm()) {
      return;
    }

    createMutation.mutate({
      userId: formData.userId,
      bankId: formData.bankId,
      cbu: formData.cbu,
      alias: formData.alias,
      accountType: formData.accountType,
      limitAmount: formData.limitAmount,
      priority: formData.priority,
    });
  };

  const handleSubmitEdit = () => {
    if (!selectedAccount) return;
    if (!validateForm()) {
      return;
    }

    updateMutation.mutate({
      id: String(selectedAccount.id),
      data: {
        userId: formData.userId,
        bankId: formData.bankId,
        cbu: formData.cbu,
        alias: formData.alias,
        accountType: formData.accountType,
        limitAmount: formData.limitAmount,
        priority: formData.priority,
      },
    });
  };

  const handleStatusChange = (account: BankAccount, newStatus: string) => {
    if (confirm(`${t('bankAccounts.confirmStatusChange')} ${newStatus}?`)) {
      updateStatusMutation.mutate({ id: String(account.id), status: newStatus });
    }
  };

  const handlePriorityChange = (account: BankAccount, newPriority: number) => {
    updatePriorityMutation.mutate({ id: String(account.id), priority: newPriority });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case ACCOUNT_STATUSES.WORKING:
        return 'status-working';
      case ACCOUNT_STATUSES.NOT_WORKING:
        return 'status-not-working';
      case ACCOUNT_STATUSES.BLOCKED:
        return 'status-blocked';
      default:
        return 'status-default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(t('common.locale'), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: timeFormat === '12h',
    });
  };

  const formatCurrency = (amount: number) => {
    return `ARS ${amount.toLocaleString('es-AR')}`;
  };

  const accounts = accountsData?.items || [];
  const banks = banksData?.items || [];
  const users = usersData?.items || [];

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch = 
      account.cbu.includes(searchQuery) ||
      account.alias.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.bank?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || account.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const workingCount = accounts.filter(a => a.status === ACCOUNT_STATUSES.WORKING).length;
  const notWorkingCount = accounts.filter(a => a.status === ACCOUNT_STATUSES.NOT_WORKING).length;
  const blockedCount = accounts.filter(a => a.status === ACCOUNT_STATUSES.BLOCKED).length;

  const canEdit = user?.role === UserRole.ADMIN || user?.role === UserRole.TEAMLEAD;

  return (
    <div className="bank-accounts-page">
      <div className="bank-accounts-header">
        <div>
          <h1 className="bank-accounts-title">Bank Accounts</h1>
          <p className="bank-accounts-subtitle">Manage bank account requisites (CBU & Alias)</p>
        </div>
        {canEdit && (
          <button className="btn-primary" onClick={handleCreate}>
            <Plus size={18} />
            Add Account
          </button>
        )}
      </div>

      <div className="bank-accounts-filters">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by CBU, Alias, Bank..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          <button
            className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All <span className="count">{accounts.length}</span>
          </button>
          <button
            className={`filter-tab ${statusFilter === ACCOUNT_STATUSES.WORKING ? 'active' : ''}`}
            onClick={() => setStatusFilter(ACCOUNT_STATUSES.WORKING)}
          >
            Working <span className="count">{workingCount}</span>
          </button>
          <button
            className={`filter-tab ${statusFilter === ACCOUNT_STATUSES.NOT_WORKING ? 'active' : ''}`}
            onClick={() => setStatusFilter(ACCOUNT_STATUSES.NOT_WORKING)}
          >
            Not Working <span className="count">{notWorkingCount}</span>
          </button>
          <button
            className={`filter-tab ${statusFilter === ACCOUNT_STATUSES.BLOCKED ? 'active' : ''}`}
            onClick={() => setStatusFilter(ACCOUNT_STATUSES.BLOCKED)}
          >
            Blocked <span className="count">{blockedCount}</span>
          </button>
        </div>

        <button className="btn-secondary" onClick={() => refetch()}>
          <RefreshCw size={18} />
          {t('common.refresh')}
        </button>
      </div>

      <div className="bank-accounts-grid">
        {filteredAccounts.length === 0 ? (
          <div className="empty-state">
            <CreditCard size={48} />
            <p>No bank accounts found</p>
          </div>
        ) : (
          filteredAccounts.map((account) => {
            const usagePercent = (account.withdrawnAmount / account.initialLimitAmount) * 100;
            
            return (
              <div key={account.id} className="bank-account-card">
                <div className="bank-account-card-header">
                  <div className="bank-info">
                    <div className="bank-icon">
                      <Building size={20} />
                    </div>
                    <div>
                      <h3 className="bank-name">{account.bank?.name || 'Unknown Bank'}</h3>
                    </div>
                  </div>
                  <div className="account-actions">
                    <select
                      value={account.status}
                      onChange={(e) => handleStatusChange(account, e.target.value)}
                      className={`status-select ${getStatusBadgeClass(account.status)}`}
                      disabled={!canEdit || updateStatusMutation.isPending}
                    >
                      <option value={ACCOUNT_STATUSES.WORKING}>Working</option>
                      <option value={ACCOUNT_STATUSES.NOT_WORKING}>Not Working</option>
                      <option value={ACCOUNT_STATUSES.BLOCKED}>Blocked</option>
                    </select>
                  </div>
                </div>

                <div className="bank-account-card-body">
                  <div className="account-details-grid">
                    <div className="detail-item">
                      <span className="detail-label">CBU</span>
                      <span className="detail-value cbu-value">
                        {account.cbu.slice(0, 6)}...{account.cbu.slice(-4)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Alias</span>
                      <span className="detail-value">{account.alias}</span>
                    </div>
                  </div>

                  <div className="limit-section">
                    <div className="limit-header">
                      <span className="limit-label">
                        <TrendingUp size={14} />
                        Limit Usage
                      </span>
                      <span className="limit-values">
                        {formatCurrency(account.withdrawnAmount)} / {formatCurrency(account.initialLimitAmount)}
                      </span>
                    </div>
                    <div className="limit-bar">
                      <div 
                        className="limit-bar-fill" 
                        style={{ 
                          width: `${Math.min(usagePercent, 100)}%`,
                          backgroundColor: usagePercent >= 90 ? '#ef4444' : usagePercent >= 70 ? '#f59e0b' : '#10b981'
                        }}
                      />
                    </div>
                    <div className="limit-footer">
                      <span className="available-amount">
                        Available: {formatCurrency(account.currentLimitAmount)}
                      </span>
                      <span className="usage-percent">{usagePercent.toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="priority-section">
                    <label className="priority-label">Priority</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={account.priority}
                      onChange={(e) => handlePriorityChange(account, parseInt(e.target.value) || 1)}
                      className="priority-input"
                      disabled={!canEdit}
                    />
                  </div>

                  <div className="account-meta">
                    {account.updatedAt && (
                      <div className="meta-item">
                        <Calendar size={12} />
                        <span>Last updated: {formatDate(account.updatedAt)}</span>
                      </div>
                    )}
                  </div>

                  {canEdit && (
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(account)}
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Bank Account</h2>
              <button className="modal-close" onClick={() => setIsCreateModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>User / Operator *</label>
                <select
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className={errors.userId ? 'error' : ''}
                >
                  <option value="">Select user...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
                  ))}
                </select>
                {errors.userId && <span className="error-text">{errors.userId}</span>}
              </div>

              <div className="form-group">
                <label>Bank *</label>
                <select
                  value={formData.bankId}
                  onChange={(e) => setFormData({ ...formData, bankId: e.target.value })}
                  className={errors.bankId ? 'error' : ''}
                >
                  <option value="">Select bank...</option>
                  {banks.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                {errors.bankId && <span className="error-text">{errors.bankId}</span>}
              </div>

              <div className="form-group">
                <label>CBU * (exactly 22 digits)</label>
                <input
                  type="text"
                  value={formData.cbu}
                  onChange={(e) => setFormData({ ...formData, cbu: e.target.value })}
                  placeholder="Enter 22 digit CBU"
                  maxLength={22}
                  className={errors.cbu ? 'error' : ''}
                />
                {errors.cbu && <span className="error-text">{errors.cbu}</span>}
              </div>

              <div className="form-group">
                <label>Alias * (minimum 6 characters)</label>
                <input
                  type="text"
                  value={formData.alias}
                  onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                  placeholder="Enter alias"
                  className={errors.alias ? 'error' : ''}
                />
                {errors.alias && <span className="error-text">{errors.alias}</span>}
              </div>

              <div className="form-group">
                <label>Account Type</label>
                <select
                  value={formData.accountType}
                  onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                >
                  <option value={ACCOUNT_TYPES.PERSONAL}>Personal</option>
                  <option value={ACCOUNT_TYPES.BUSINESS}>Business</option>
                </select>
              </div>

              <div className="form-group">
                <label>Limit Amount (ARS) *</label>
                <input
                  type="number"
                  value={formData.limitAmount}
                  onChange={(e) => setFormData({ ...formData, limitAmount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={errors.limitAmount ? 'error' : ''}
                />
                {errors.limitAmount && <span className="error-text">{errors.limitAmount}</span>}
              </div>

              <div className="form-group">
                <label>Priority</label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                  min="1"
                  max="100"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handleSubmitCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedAccount && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Bank Account</h2>
              <button className="modal-close" onClick={() => setIsEditModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>User / Operator *</label>
                <select
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className={errors.userId ? 'error' : ''}
                >
                  <option value="">Select user...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
                  ))}
                </select>
                {errors.userId && <span className="error-text">{errors.userId}</span>}
              </div>

              <div className="form-group">
                <label>Bank *</label>
                <select
                  value={formData.bankId}
                  onChange={(e) => setFormData({ ...formData, bankId: e.target.value })}
                  className={errors.bankId ? 'error' : ''}
                >
                  <option value="">Select bank...</option>
                  {banks.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                {errors.bankId && <span className="error-text">{errors.bankId}</span>}
              </div>

              <div className="form-group">
                <label>CBU * (exactly 22 digits)</label>
                <input
                  type="text"
                  value={formData.cbu}
                  onChange={(e) => setFormData({ ...formData, cbu: e.target.value })}
                  placeholder="Enter 22 digit CBU"
                  maxLength={22}
                  className={errors.cbu ? 'error' : ''}
                />
                {errors.cbu && <span className="error-text">{errors.cbu}</span>}
              </div>

              <div className="form-group">
                <label>Alias * (minimum 6 characters)</label>
                <input
                  type="text"
                  value={formData.alias}
                  onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                  placeholder="Enter alias"
                  className={errors.alias ? 'error' : ''}
                />
                {errors.alias && <span className="error-text">{errors.alias}</span>}
              </div>

              <div className="form-group">
                <label>Account Type</label>
                <select
                  value={formData.accountType}
                  onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                >
                  <option value={ACCOUNT_TYPES.PERSONAL}>Personal</option>
                  <option value={ACCOUNT_TYPES.BUSINESS}>Business</option>
                </select>
              </div>

              <div className="form-group">
                <label>Limit Amount (ARS) *</label>
                <input
                  type="number"
                  value={formData.limitAmount}
                  onChange={(e) => setFormData({ ...formData, limitAmount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={errors.limitAmount ? 'error' : ''}
                />
                {errors.limitAmount && <span className="error-text">{errors.limitAmount}</span>}
              </div>

              <div className="form-group">
                <label>Priority</label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                  min="1"
                  max="100"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handleSubmitEdit}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Updating...' : 'Update Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
