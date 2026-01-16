import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { 
  UserPlus, 
  Search, 
  Mail, 
  Phone, 
  CreditCard,
  RefreshCw,
  Send
} from 'lucide-react';
import { usersService, User } from '../../services/users.service';
import { bankAccountsService, BankAccount as BankAccountType } from '../../services/bank-accounts.service';
import { shiftsService } from '../../services/shifts.service';
import { useAuthStore } from '../../store/authStore';

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
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [, setFocusUserId] = useState<number | null>(null);
  const [highlightUserId, setHighlightUserId] = useState<number | null>(null);
  const operatorCardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Check if user is admin
  useEffect(() => {
    if (user?.role !== UserRole.ADMIN) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const state = location.state as { focusUserId?: unknown } | null;
    const raw = state?.focusUserId;
    const id =
      typeof raw === 'number'
        ? raw
        : typeof raw === 'string' && /^[0-9]+$/.test(raw.trim())
          ? Number(raw)
          : null;

    if (!id || !Number.isFinite(id)) return;
    setFocusUserId(id);
    setHighlightUserId(id);
    setSearchQuery('');
    setStatusFilter('All');
    window.history.replaceState({}, document.title);
  }, [location.state]);

  // Fetch all shifts to determine user status
  const { data: shiftsData } = useQuery({
    queryKey: ['all-shifts'],
    queryFn: () => shiftsService.getAll({ limit: 1000 }),
    refetchInterval: 1000, // Обновление каждую секунду
    staleTime: 0, // Данные всегда считаются устаревшими
    refetchOnWindowFocus: true, // Обновлять при фокусе на окне
  });

  // Fetch real users from API
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['users', searchQuery, shiftsData?.items.filter(s => s.status === 'active').map(s => s.operator?.id).join(',')],
    queryFn: async () => {
      const response = await usersService.getAll({ 
        search: searchQuery,
        limit: 100 
      });
      
      // Get active shifts
      const activeShifts = shiftsData?.items.filter(shift => shift.status === 'active') || [];
      const activeUserIds = new Set(activeShifts.map(shift => shift.operator?.id).filter(Boolean));
      
      // Fetch bank accounts for each user
      const operators: Operator[] = await Promise.all(
        response.items.map(async (user) => {
          try {
            const accountsResponse = await bankAccountsService.getAll({ 
              userId: String(user.id),
              limit: 100 
            });
            
            return {
              ...user,
              status: activeUserIds.has(Number(user.id)) ? 'Active' as const : 'Inactive' as const,
              bankAccounts: accountsResponse.items
            };
          } catch (error) {
            console.error(`Failed to fetch accounts for user ${user.id}:`, error);
            return {
              ...user,
              status: activeUserIds.has(Number(user.id)) ? 'Active' as const : 'Inactive' as const,
              bankAccounts: []
            };
          }
        })
      );
      
      return operators;
    },
    enabled: !!shiftsData,
  });

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

  useEffect(() => {
    if (!highlightUserId) return;
    const el = operatorCardRefs.current.get(highlightUserId);
    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const timeout = window.setTimeout(() => setHighlightUserId(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [highlightUserId, filteredOperators.length]);

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
          <div
            key={operator.id}
            ref={(el) => {
              if (el) operatorCardRefs.current.set(Number(operator.id), el);
              else operatorCardRefs.current.delete(Number(operator.id));
            }}
            className={`operator-card ${
              highlightUserId && Number(operator.id) === highlightUserId ? 'operator-card-highlight' : ''
            }`}
          >
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
                  <div className="operator-meta">
                    <span className={`role-badge role-${operator.role}`}>
                      {t(`users.roles.${operator.role}`)}
                    </span>
                  </div>
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
              <div className="contact-item">
                <Phone size={14} />
                <span>{operator.phone || t('common.notFilled')}</span>
              </div>
              <div className="contact-item">
                <Send size={14} />
                <span>{operator.telegram || t('common.notFilled')}</span>
              </div>
            </div>

            <button 
              className="btn-withdrawal-history"
              onClick={() => navigate(`/transactions?userId=${operator.id}`)}
            >
              <CreditCard size={16} />
              <span>{t('operators.withdrawalHistory')}</span>
            </button>
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
    </div>
  );
}
