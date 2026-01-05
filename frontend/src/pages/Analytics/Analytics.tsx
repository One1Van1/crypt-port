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
    withdrawalRate: 1150,
    bankId: 2,
    status: 'pending',
    conversionRate: 1000,
    withdrawnAmount: 2130000,
    inProcessAmount: 2130000,
    convertedAmount: 7100,
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
    withdrawalRate: 1150,
    bankId: 1,
    status: 'pending',
    conversionRate: 1000,
    withdrawnAmount: 2070000,
    inProcessAmount: 2070000,
    convertedAmount: 6900,
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
    withdrawalRate: 1150,
    bankId: 3,
    status: 'pending',
    conversionRate: 1000,
    withdrawnAmount: 1725000,
    inProcessAmount: 1725000,
    convertedAmount: 5750,
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
  const [selectedOperator, setSelectedOperator] = useState<number | null>(null);
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

  // Fetch operators withdrawals data
  const { data: operatorsWithdrawalsData } = useQuery({
    queryKey: ['operators-withdrawals'],
    queryFn: () => analyticsService.getOperatorsWithdrawals(),
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
          <div 
            className="kpi-card" 
            onDoubleClick={() => navigate('/platforms')}
            style={{ cursor: 'pointer' }}
          >
            <div className="kpi-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={18} />
              <span style={{ fontSize: '0.75rem' }}>КУРСЫ ПЛОЩАДОК</span>
            </div>
            <div style={{ 
              marginTop: '10px', 
              maxHeight: '144px', 
              overflowY: (platformsData?.items.length || 0) > 2 ? 'auto' : 'hidden' 
            }} className="platforms-scroll">
              {platformsData?.items.map((platform) => (
                <div key={platform.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '10px',
                  borderBottom: '1px solid var(--border-color)',
                  transition: 'background 0.2s',
                  minHeight: '50px'
                }}>
                  <div style={{ 
                    fontWeight: '500', 
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem'
                  }}>
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
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ 
                        fontSize: '0.9rem', 
                        fontWeight: '600', 
                        color: '#6366f1' 
                      }}>
                        {platform.exchangeRate.toFixed(2)} ARS
                      </span>
                      {user?.role === UserRole.ADMIN && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPlatformId(platform.id);
                            setNewRate(platform.exchangeRate.toString());
                          }}
                          style={{
                            padding: '4px 6px',
                            borderRadius: '6px',
                            backgroundColor: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-color)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          <Edit3 size={12} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Withdrawal History Widget */}
          <div 
            className="kpi-card"
            onDoubleClick={() => {
              if (withdrawalDate) {
                const dateStr = `${withdrawalDate.getFullYear()}-${String(withdrawalDate.getMonth() + 1).padStart(2, '0')}-${String(withdrawalDate.getDate()).padStart(2, '0')}`;
                navigate('/transactions', { 
                  state: { filterDate: dateStr } 
                });
              }
            }}
            style={{ cursor: 'pointer' }}
          >
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
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  Всего выводов
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {withdrawalsData?.total || 0}
                </div>
              </div>
            </div>
          </div>

          <div 
            className="kpi-card" 
            onDoubleClick={() => navigate('/shifts', { state: { viewMode: 'all' } })}
            style={{ cursor: 'pointer' }}
          >
            <div className="kpi-header">{t('shifts.activeShifts').toUpperCase()}</div>
            <div className="kpi-value">
              {data?.activeShifts || 0}/{data?.totalOperators || 0}
            </div>
            <div className="kpi-footer">активных из всех операторов</div>
          </div>

          <div 
            className="kpi-card"
            onDoubleClick={() => navigate('/banks')}
            style={{ cursor: 'pointer' }}
          >
            <div className="kpi-header">СУММА НА ФИЗ БАНКАХ</div>
            <div className="kpi-value">{formatCurrency(data?.totalWithdrawnFromBanks || 0)}</div>
            <div className="kpi-footer">ARS на физических банках</div>
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
        {/* Row 1: Cash Withdrawal Process (full width) */}
        <div className="analytics-row">
          {/* Cash Withdrawal Process Widget */}
          <div className="analytics-widget widget-full">
            <div className="widget-header">
              <h3 className="widget-title">
                <Users size={20} />
                Процесс обналички
              </h3>
              <div className="widget-subtitle">Каждый вывод наличных и его конвертация в USDT</div>
            </div>
            <div className="widget-content" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ overflowY: 'scroll', scrollbarWidth: 'thin', visibility: 'hidden', height: 0 }}></div>
              <div className="table-header" style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr 1fr', gap: 0, backgroundColor: 'rgba(100, 116, 139, 0.08)' }}>
                <div className="th-name" style={{ padding: '12px', borderRight: '2px solid var(--border-color)' }}>Пользователь</div>
                <div className="th-deals" style={{ padding: '12px', textAlign: 'center', borderRight: '2px solid var(--border-color)' }}>Забрал наличные</div>
                <div className="th-amount" style={{ padding: '12px', textAlign: 'center', borderRight: '2px solid var(--border-color)' }}>В процессе</div>
                <div className="th-shifts" style={{ padding: '12px', textAlign: 'center' }}>Вернул USDT</div>
              </div>
              <div 
                className="operators-table"
                style={{
                  maxHeight: '240px',
                  overflowY: 'scroll',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'var(--border-color) var(--bg-tertiary)',
                }}
              >
                {operatorsWithdrawalsData?.operators.map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className={`table-row ${selectedOperator === withdrawal.id ? 'selected' : ''}`}
                    onClick={() => setSelectedOperator(withdrawal.id)}
                    style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr 1fr', gap: 0, alignItems: 'center' }}
                  >
                    <div className="td-name" style={{ padding: '10px', borderRight: '2px solid var(--border-color)' }}>
                      <div className="operator-name" style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '2px' }}>{withdrawal.name}</div>
                      <div className="operator-subtitle" style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                        ID: #{withdrawal.id}
                      </div>
                    </div>
                    
                    {/* Часть 1: Забрал наличные */}
                    <div style={{ 
                      padding: '10px',
                      textAlign: 'center',
                      backgroundColor: 'rgba(100, 116, 139, 0.2)', // Всегда тёмная - этап выполнен
                      borderRight: '2px solid var(--border-color)',
                    }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#64748b', marginBottom: '3px' }}>
                        {formatCurrency(withdrawal.withdrawnAmount)}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '1px' }}>
                        курс: {withdrawal.withdrawalRate || 0}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                        банк #{withdrawal.bankId || 'N/A'}
                      </div>
                    </div>
                    
                    {/* Часть 2: В процессе */}
                    <div style={{ 
                      padding: '10px',
                      textAlign: 'center',
                      backgroundColor: withdrawal.status === 'converted' 
                        ? 'rgba(100, 116, 139, 0.2)' // Тёмная - этап пройден
                        : 'rgba(100, 116, 139, 0.06)', // Светлая - в процессе
                      borderRight: '2px solid var(--border-color)',
                    }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#64748b', marginBottom: '3px' }}>
                        {formatCurrency(withdrawal.inProcessAmount)}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '1px' }}>
                        {withdrawal.status || 'completed'}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                        ожидает конвертации
                      </div>
                    </div>
                    
                    {/* Часть 3: Вернул USDT */}
                    <div style={{ 
                      padding: '10px',
                      textAlign: 'center',
                      backgroundColor: withdrawal.convertedAmount > 0 
                        ? 'rgba(100, 116, 139, 0.2)' // Тёмная - выполнено
                        : 'rgba(100, 116, 139, 0.06)', // Светлая - ещё не выполнено
                    }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#64748b', marginBottom: '3px' }}>
                        {withdrawal.convertedAmount.toFixed(2)} USDT
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '1px' }}>
                        курс: {withdrawal.conversionRate || 0}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                        конвертировано
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
