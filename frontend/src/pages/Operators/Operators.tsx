import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { 
  UserPlus, 
  Search, 
  Mail, 
  Phone, 
  CreditCard,
  ChevronDown,
  Plus,
  RefreshCw,
  Send
} from 'lucide-react';
import { usersService, User } from '../../services/users.service';
import { bankAccountsService, BankAccount as BankAccountType } from '../../services/bank-accounts.service';
import { useAuthStore } from '../../store/authStore';
import AddOperatorModal from '../../components/AddOperatorModal/AddOperatorModal';
import { UserRole } from '../../types/user.types';
import './Operators.css';

interface BankAccount extends BankAccountType {}

interface Operator extends User {
  phone?: string;
  status: 'Active' | 'Inactive';
  bankAccounts: BankAccount[];
}

export default function Operators() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [expandedOperators, setExpandedOperators] = useState<Set<string>>(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (user?.role !== UserRole.ADMIN) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch real users from API
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['users', searchQuery],
    queryFn: async () => {
      const response = await usersService.getAll({ 
        search: searchQuery,
        role: UserRole.OPERATOR,
        limit: 100 
      });
      
      // Fetch bank accounts for each operator
      const operators: Operator[] = await Promise.all(
        response.items.map(async (user) => {
          try {
            const accountsResponse = await bankAccountsService.getAll({ 
              userId: user.id,
              limit: 100 
            });
            
            return {
              ...user,
              status: 'Active' as const,
              bankAccounts: accountsResponse.items
            };
          } catch (error) {
            console.error(`Failed to fetch accounts for user ${user.id}:`, error);
            return {
              ...user,
              status: 'Active' as const,
              bankAccounts: []
            };
          }
        })
      );
      
      return operators;
    },
  });

  const toggleExpand = (operatorId: string) => {
    const newExpanded = new Set(expandedOperators);
    if (newExpanded.has(operatorId)) {
      newExpanded.delete(operatorId);
    } else {
      newExpanded.add(operatorId);
    }
    setExpandedOperators(newExpanded);
  };

  const getStatusBadgeClass = (status: string) => {
    return status.toLowerCase();
  };

  const getInitials = (username: string) => {
    return username
      .substring(0, 2)
      .toUpperCase();
  };

  const getAvatarColor = (username: string) => {
    const colors = [
      '#6366f1', // Мягкий индиго
      '#8b5cf6', // Мягкий фиолетовый
      '#ec4899', // Мягкий розовый
      '#10b981', // Мягкий зелёный
      '#06b6d4', // Мягкий голубой
      '#f59e0b', // Мягкий янтарный
    ];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const operators = data || [];

  const filteredOperators = operators.filter((op) => {
    const matchesSearch = 
      op.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || op.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = operators.filter(op => op.status === 'Active').length;
  const inactiveCount = operators.filter(op => op.status === 'Inactive').length;

  if (isLoading) {
    return (
      <div className="operators-page">
        <div className="loading-state">
          <RefreshCw size={32} className="spin" />
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="operators-page">
      <div className="operators-header">
        <div>
          <h1 className="operators-title">{t('operators.title')}</h1>
          <p className="operators-subtitle">{t('operators.subtitle')}</p>
        </div>
        <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <UserPlus size={18} />
          {t('operators.addOperator')}
        </button>
      </div>

      <div className="operators-filters">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder={t('operators.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          <button
            className={`filter-tab ${statusFilter === 'All' ? 'active' : ''}`}
            onClick={() => setStatusFilter('All')}
          >
            {t('operators.all')} <span className="count">{operators.length}</span>
          </button>
          <button
            className={`filter-tab ${statusFilter === 'Active' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Active')}
          >
            {t('operators.active')} <span className="count">{activeCount}</span>
          </button>
          <button
            className={`filter-tab ${statusFilter === 'Inactive' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Inactive')}
          >
            {t('operators.inactive')} <span className="count">{inactiveCount}</span>
          </button>
        </div>

        <button className="btn-secondary" onClick={() => refetch()}>
          <RefreshCw size={18} />
          {t('common.refresh')}
        </button>
      </div>

      <div className="operators-grid">
        {filteredOperators.map((operator) => (
          <div key={operator.id} className="operator-card">
            <div className="operator-card-header">
              <div className="operator-info">
                <div 
                  className="operator-avatar"
                  style={{ backgroundColor: getAvatarColor(operator.username) }}
                >
                  {getInitials(operator.username)}
                </div>
                <div className="operator-details">
                  <h3 className="operator-name">{operator.username}</h3>
                  {operator.telegram && (
                    <span className="operator-telegram">
                      <Send size={12} />
                      {operator.telegram}
                    </span>
                  )}
                </div>
              </div>
              <span className={`status-badge ${getStatusBadgeClass(operator.status)}`}>
                {operator.status}
              </span>
            </div>

            <div className="operator-contact">
              <div className="contact-item">
                <Mail size={14} />
                <span>{operator.email}</span>
              </div>
              {operator.phone && (
                <div className="contact-item">
                  <Phone size={14} />
                  <span>{operator.phone}</span>
                </div>
              )}
            </div>

            <div className="operator-divider"></div>

            <div className="bank-accounts-section">
              <div 
                className="bank-accounts-header"
                onClick={() => toggleExpand(operator.id)}
              >
                <div className="bank-accounts-title">
                  <CreditCard size={16} />
                  <span>{t('operators.bankAccounts')} ({operator.bankAccounts.length})</span>
                </div>
                <ChevronDown 
                  size={18} 
                  className={`chevron ${expandedOperators.has(operator.id) ? 'expanded' : ''}`}
                />
              </div>

              {expandedOperators.has(operator.id) && (
                <div className="bank-accounts-list">
                  {operator.bankAccounts.length > 0 ? (
                    operator.bankAccounts.map((account) => (
                      <div key={account.id} className="bank-account-item">
                        <div className="bank-account-info">
                          <div className="bank-icon">
                            <CreditCard size={16} />
                          </div>
                          <div className="bank-details">
                            <div className="bank-name">{account.bank?.name || 'Unknown Bank'}</div>
                            <div className="bank-meta">
                              <span>CBU: {account.cbu.slice(0, 6)}...{account.cbu.slice(-4)}</span>
                              <span>Alias: {account.alias}</span>
                              <span>Type: {account.accountType}</span>
                              <span>Priority: {account.priority}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`status-badge small ${account.status.toLowerCase()}`}>
                          {account.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="empty-accounts">
                      <p>{t('operators.noAccounts')}</p>
                    </div>
                  )}
                  <button className="btn-add-account">
                    <Plus size={14} />
                    {t('operators.addAccount')}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredOperators.length === 0 && (
        <div className="empty-state">
          <UserPlus size={48} />
          <h3>{t('operators.noOperators')}</h3>
          <p>{t('operators.noOperatorsText')}</p>
        </div>
      )}

      <AddOperatorModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}
