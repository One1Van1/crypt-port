import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Users,
  Clock,
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
  AlertCircle,
  XCircle,
  DollarSign,
  Edit3,
  Check,
  History,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import { analyticsService } from '../../services/analytics.service';
import { platformsService } from '../../services/platforms.service';
import { transactionsService } from '../../services/transactions.service';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/user.types';
import DatePicker from '../../components/DatePicker/DatePicker';
import './Analytics.css';

type DateFilter = 'today' | 'yesterday' | 'week' | 'month' | 'custom';
type PlatformFilter = 'all' | string;
type OperatorFilter = 'all' | string;
type ViewMode = 'count' | 'amount';

// Mock data for demonstration - replace with real API calls
const mockFunnelData = [
  { stage: 'Ожидание (Pending)', count: 245, amount: 12250000, conversion: 87, lost: 32, color: '#f59e0b', status: 'pending' },
  { stage: 'Завершено (Completed)', count: 213, amount: 10650000, conversion: 100, lost: 0, color: '#10b981', status: 'completed' },
  { stage: 'Неудачные (Failed)', count: 32, amount: 1600000, conversion: 0, lost: 32, color: '#ef4444', status: 'failed' },
];

const mockDynamicsData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
  }),
  completed: Math.floor(Math.random() * 50) + 30,
  pending: Math.floor(Math.random() * 20) + 10,
  amount: Math.floor(Math.random() * 500000) + 300000,
}));

const mockOperatorsData = [
  {
    id: '1',
    name: 'Алексей Иванов',
    totalTransactions: 156,
    completedTransactions: 142,
    amount: 7100000,
    shiftsCount: 12,
    avgPerHour: 48251,
    successRate: 91,
  },
  {
    id: '2',
    name: 'Мария Петрова',
    totalTransactions: 143,
    completedTransactions: 138,
    amount: 6900000,
    shiftsCount: 11,
    avgPerHour: 52800,
    successRate: 96,
  },
  {
    id: '3',
    name: 'Дмитрий Сидоров',
    totalTransactions: 128,
    completedTransactions: 115,
    amount: 5750000,
    shiftsCount: 10,
    avgPerHour: 45900,
    successRate: 90,
  },
];

const mockSpeedData = [
  { stage: 'Получение реквизита', avgTime: 2, color: '#6366f1' },
  { stage: 'Проверка баланса', avgTime: 5, color: '#8b5cf6' },
  { stage: 'Обработка вывода', avgTime: 15, color: '#f59e0b' },
  { stage: 'Подтверждение', avgTime: 8, color: '#10b981' },
];

export default function Analytics() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [dateFilter, setDateFilter] = useState<DateFilter>('week');
  const [platformFilter] = useState<PlatformFilter>('all');
  const [operatorFilter, setOperatorFilter] = useState<OperatorFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('amount');
  const [selectedFunnelStage, setSelectedFunnelStage] = useState<string | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [editingPlatformId, setEditingPlatformId] = useState<number | null>(null);
  const [newRate, setNewRate] = useState<string>('');
  const [withdrawalDate, setWithdrawalDate] = useState<Date | null>(new Date());

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['analytics', dateFilter, platformFilter, operatorFilter],
    queryFn: analyticsService.getGeneral,
  });

  // Fetch platforms
  const { data: platformsData } = useQuery({
    queryKey: ['platforms'],
    queryFn: () => platformsService.getAll(),
  });

  // Fetch withdrawals history (transactions for selected date)
  const { data: withdrawalsData } = useQuery({
    queryKey: ['withdrawals-transactions', withdrawalDate],
    queryFn: () => {
      console.log('Analytics: fetching transactions for date:', withdrawalDate);
      
      if (!withdrawalDate) {
        console.log('Analytics: no date selected, fetching all');
        return transactionsService.getAll({ page: 1, limit: 100 });
      }
      
      const year = withdrawalDate.getFullYear();
      const month = String(withdrawalDate.getMonth() + 1).padStart(2, '0');
      const day = String(withdrawalDate.getDate()).padStart(2, '0');
      const startDate = `${year}-${month}-${day}T00:00:00`;
      
      const nextDay = new Date(withdrawalDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const endYear = nextDay.getFullYear();
      const endMonth = String(nextDay.getMonth() + 1).padStart(2, '0');
      const endDay = String(nextDay.getDate()).padStart(2, '0');
      const endDate = `${endYear}-${endMonth}-${endDay}T00:00:00`;
      
      console.log('Analytics: requesting transactions with dates:', { startDate, endDate });
      
      return transactionsService.getAll({ 
        page: 1, 
        limit: 100,
        startDate,
        endDate
      });
    },
  });

  // Update platform rate mutation
  const updateRateMutation = useMutation({
    mutationFn: ({ id, rate }: { id: number; rate: number }) => 
      platformsService.updateRate(id, rate),
    onSuccess: () => {
      toast.success('Курс обновлен');
      queryClient.invalidateQueries({ queryKey: ['platforms'] });
      setEditingPlatformId(null);
      setNewRate('');
    },
    onError: () => {
      toast.error('Ошибка обновления курса');
    },
  });

  // Access control
  if (user?.role !== UserRole.ADMIN && user?.role !== UserRole.TEAMLEAD) {
    return (
      <div className="analytics-page">
        <div className="access-denied">
          <AlertCircle size={64} />
          <h2>{t('errors.accessDenied')}</h2>
          <p>{t('errors.teamleadOnly')}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="analytics-page">
        <div className="loading-state">
          <RefreshCw size={32} className="spin" />
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return `${(value / 1000).toFixed(0)}K ARS`;
  };

  const formatCurrencyFull = (value: number) => {
    return `${value.toLocaleString('es-AR')} ARS`;
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} мин`;
    return `${(minutes / 60).toFixed(1)} ч`;
  };

  const dateFilterOptions = [
    { value: 'today', label: t('teamlead.today') },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'week', label: t('teamlead.week') },
    { value: 'month', label: t('teamlead.month') },
  ];

  return (
    <div className="analytics-page">
      {/* Top Filter Panel - Compact */}
      <div className="analytics-filter-panel-compact">
        <div className="filter-buttons-inline">
          {dateFilterOptions.map((option) => (
            <button
              key={option.value}
              className={`filter-btn-compact ${dateFilter === option.value ? 'active' : ''}`}
              onClick={() => setDateFilter(option.value as DateFilter)}
            >
              {option.label}
            </button>
          ))}
          <button className="filter-btn-compact">
            <Calendar size={14} />
            {t('analytics.allTime')}
          </button>
        </div>

        <div className="filter-actions-inline">
          <select
            className="filter-select-compact"
            value={operatorFilter}
            onChange={(e) => setOperatorFilter(e.target.value)}
          >
            <option value="all">{t('operators.all')}</option>
            {mockOperatorsData.map((op) => (
              <option key={op.id} value={op.id}>
                {op.name}
              </option>
            ))}
          </select>
          <button className="btn-icon" onClick={() => refetch()}>
            <RefreshCw size={16} />
          </button>
          <button className="btn-icon">
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Main Content Grid: KPI Left + Widgets Right */}
      <div className="analytics-main-grid">
        {/* Left Column: KPI Cards + Status Widget */}
        <div className="analytics-left-column">
          {/* KPI Cards Grid 2x2 */}
          <div className="analytics-kpi-sidebar">
          {/* Platform Exchange Rates Widget */}
          <div className="kpi-card">
            <div className="kpi-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={20} />
              КУРСЫ ПЛОЩАДОК
            </div>
            <div style={{ marginTop: '16px' }}>
              {platformsData?.items.map((platform) => (
                <div key={platform.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '12px',
                  borderBottom: '1px solid var(--border-color)',
                  transition: 'background 0.2s'
                }}>
                  <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                    {platform.name}
                  </div>
                  {editingPlatformId === platform.id ? (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="number"
                        value={newRate}
                        onChange={(e) => setNewRate(e.target.value)}
                        placeholder="Новый курс"
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--bg-tertiary)',
                          color: 'var(--text-primary)',
                          width: '120px'
                        }}
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          const rate = parseFloat(newRate);
                          if (!isNaN(rate) && rate > 0) {
                            updateRateMutation.mutate({ id: platform.id, rate });
                          }
                        }}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingPlatformId(null);
                          setNewRate('');
                        }}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--bg-tertiary)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#6366f1' }}>
                        {platform.exchangeRate.toFixed(2)} ARS
                      </span>
                      {user?.role === UserRole.ADMIN && (
                        <button
                          onClick={() => {
                            setEditingPlatformId(platform.id);
                            setNewRate(platform.exchangeRate.toString());
                          }}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            backgroundColor: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-color)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          <Edit3 size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Withdrawal History Widget */}
          <div className="kpi-card">
            <div className="kpi-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={20} />
              ИСТОРИЯ ВЫВОДОВ
            </div>
            <div style={{ marginTop: '12px' }}>
              <div style={{ marginBottom: '10px' }}>
                <DatePicker
                  selected={withdrawalDate}
                  onChange={(date) => setWithdrawalDate(date)}
                  placeholder="Выберите дату"
                />
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                gap: '8px'
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    Всего выводов
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    {withdrawalsData?.total || 0}
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (withdrawalDate) {
                      const dateStr = `${withdrawalDate.getFullYear()}-${String(withdrawalDate.getMonth() + 1).padStart(2, '0')}-${String(withdrawalDate.getDate()).padStart(2, '0')}`;
                      navigate('/transactions', { 
                        state: { filterDate: dateStr } 
                      });
                    }
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#6366f1',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: '500',
                    fontSize: '0.75rem',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#5558e3';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#6366f1';
                  }}
                >
                  Все операции
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">{t('shifts.activeShift').toUpperCase()}</div>
            <div className="kpi-value">{data?.activeOperators || 2}</div>
            <div className="kpi-progress">
              <div className="kpi-progress-bar" style={{ width: '65%', backgroundColor: '#6366f1' }} />
            </div>
            <div className="kpi-footer">{t('analytics.activeOperators').toLowerCase()}</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">{t('dashboard.withdrawalAmount').toUpperCase()}</div>
            <div className="kpi-value">{formatCurrency(data?.totalWithdrawn || 10650000)}</div>
            <div className="kpi-progress">
              <div className="kpi-progress-bar" style={{ width: '88%', backgroundColor: '#8b5cf6' }} />
            </div>
            <div className="kpi-footer">ARS for {dateFilter === 'week' ? t('teamlead.week').toLowerCase() : dateFilter === 'month' ? t('teamlead.month').toLowerCase() : 'period'}</div>
          </div>
        </div>

        {/* Transaction Status Funnel - Under KPI Cards */}
        <div className="analytics-widget widget-left-sidebar">
          <div className="widget-header">
            <h3 className="widget-title">
              <BarChart3 size={20} />
              {t('nav.transactions')} - {t('users.table.status')}
            </h3>
            <div className="widget-actions">
              <span className="widget-hint">{t('common.view')} деталей</span>
            </div>
          </div>
          <div className="widget-content">
            <div className="funnel-container-compact">
              {mockFunnelData.map((stage) => (
                <div
                  key={stage.stage}
                  className={`funnel-stage-compact ${selectedFunnelStage === stage.status ? 'selected' : ''}`}
                  onClick={() => setSelectedFunnelStage(stage.status)}
                >
                  <div className="funnel-bar-compact" style={{ borderLeftColor: stage.color }}>
                    <div className="funnel-info-compact">
                      <div className="funnel-stage-name">{stage.stage}</div>
                      <div className="funnel-stats-compact">
                        <div className="funnel-stat-item">
                          <span className="funnel-label">{t('nav.transactions')}:</span>
                          <span className="funnel-value">{stage.count}</span>
                        </div>
                        <div className="funnel-stat-item">
                          <span className="funnel-label">{t('teamlead.totalAmount')}:</span>
                          <span className="funnel-value">{formatCurrency(stage.amount)}</span>
                        </div>
                        {stage.lost > 0 && (
                          <div className="funnel-stat-item lost">
                            <XCircle size={14} />
                            <span className="funnel-value">{stage.lost} {t('statuses.failed').toLowerCase()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="funnel-progress-indicator" style={{ backgroundColor: stage.color, width: `${(stage.count / 245) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>

        {/* Right Side - Main Analytics Widgets */}
        <div className="analytics-widgets-container">
        {/* Row 1: Operators Performance (full width) */}
        <div className="analytics-row">
          {/* Operators Performance Widget */}
          <div className="analytics-widget widget-full">
            <div className="widget-header">
              <h3 className="widget-title">
                <Users size={20} />
                {t('teamlead.analyticsTitle')}
              </h3>
              <div className="widget-subtitle">{t('teamlead.analyticsDescription')}</div>
            </div>
            <div className="widget-content">
              <div className="operators-table">
                <div className="table-header">
                  <div className="th-name">{t('teamlead.operator')}</div>
                  <div className="th-deals">{t('teamlead.transactions')}</div>
                  <div className="th-amount">{t('teamlead.totalAmount')}</div>
                  <div className="th-shifts">{t('teamlead.shifts')}</div>
                  <div className="th-conversion">{t('teamlead.successRate')}</div>
                </div>
                {mockOperatorsData.map((operator) => (
                  <div
                    key={operator.id}
                    className={`table-row ${selectedOperator === operator.id ? 'selected' : ''}`}
                    onClick={() => setSelectedOperator(operator.id)}
                  >
                    <div className="td-name">
                      <div className="operator-name">{operator.name}</div>
                      <div className="operator-subtitle">
                        {operator.completedTransactions}/{operator.totalTransactions} {t('statuses.completed').toLowerCase()} • {formatCurrencyFull(operator.avgPerHour)}/{t('teamlead.totalHours').toLowerCase()}
                      </div>
                    </div>
                    <div className="td-deals">{operator.totalTransactions}</div>
                    <div className="td-amount">{formatCurrency(operator.amount)}</div>
                    <div className="td-shifts">{operator.shiftsCount}</div>
                    <div className="td-conversion">
                      <div className="conversion-badge" data-level={operator.successRate >= 90 ? 'high' : 'medium'}>
                        {operator.successRate}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Dynamics + Processing Speed */}
        <div className="analytics-row">
          {/* Withdrawal Dynamics Widget */}
          <div className="analytics-widget widget-medium">
          <div className="widget-header">
            <h3 className="widget-title">
              <TrendingUp size={20} />
              {t('analytics.depositsVsWithdrawals')}
            </h3>
            <div className="widget-actions">
              <div className="view-mode-toggle">
                <button
                  className={`toggle-btn ${viewMode === 'count' ? 'active' : ''}`}
                  onClick={() => setViewMode('count')}
                >
                  {t('common.view')}
                </button>
                <button
                  className={`toggle-btn ${viewMode === 'amount' ? 'active' : ''}`}
                  onClick={() => setViewMode('amount')}
                >
                  {t('teamlead.totalAmount')}
                </button>
              </div>
            </div>
          </div>
          <div className="widget-content">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockDynamicsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="date" stroke="var(--text-tertiary)" style={{ fontSize: '12px' }} />
                <YAxis
                  stroke="var(--text-tertiary)"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) =>
                    viewMode === 'amount' ? formatCurrency(value) : value.toString()
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                  }}
                  formatter={(value: any, name?: string) => [
                    viewMode === 'amount' ? formatCurrencyFull(value) : value,
                    name === 'completed' ? t('statuses.completed') : t('statuses.pending'),
                  ]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={viewMode === 'amount' ? 'amount' : 'completed'}
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Completed"
                  dot={{ fill: '#10b981', r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="pending"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Pending"
                  dot={{ fill: '#f59e0b', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

          {/* Processing Speed Widget */}
          <div className="analytics-widget widget-large">
          <div className="widget-header">
            <h3 className="widget-title">
              <Clock size={20} />
              {t('shifts.duration')} {t('nav.transactions').toLowerCase()}
            </h3>
            <div className="widget-subtitle">Среднее время по этапам</div>
          </div>
          <div className="widget-content">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockSpeedData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis type="number" stroke="var(--text-tertiary)" style={{ fontSize: '12px' }} />
                <YAxis dataKey="stage" type="category" stroke="var(--text-tertiary)" width={120} style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                  }}
                  formatter={(value: any) => [formatTime(value), t('shifts.duration')]}
                />
                <Bar dataKey="avgTime" radius={[0, 8, 8, 0]}>
                  {mockSpeedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        </div>
        </div>
      </div>
    </div>
  );
}
