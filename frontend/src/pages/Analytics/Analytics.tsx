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
  PieChart,
  Pie,
} from 'recharts';
import { analyticsService } from '../../services/analytics.service';
import { platformsService } from '../../services/platforms.service';
import { transactionsService } from '../../services/transactions.service';
import { workingDepositService } from '../../services/workingDepositService';
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
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

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

  // Fetch working deposit sections
  const { data: workingDepositData } = useQuery({
    queryKey: ['workingDepositSections'],
    queryFn: () => workingDepositService.getSections(),
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

        {/* Deposit Distribution Section - Under KPI Cards */}
        <div className="deposit-section">
          <div className="deposit-left">
            {/* Pie Chart Widget */}
            <div className="deposit-widget">
              <div className="widget-header">
                <h3 className="widget-title" style={{ fontSize: '0.9rem' }}>
                  <BarChart3 size={18} />
                  Распределение депозита
                </h3>
              </div>
            <div className="widget-content" style={{ padding: '16px' }}>
              {workingDepositData ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: '💎 Платформы', value: workingDepositData.platformBalances.total || 0, color: '#6366f1' },
                        { name: '🔒 Заблокированные', value: workingDepositData.blockedPesos.totalUsdt || 0, color: '#ef4444' },
                        { name: '⏳ Неоплаченные', value: workingDepositData.unpaidPesos.totalUsdt || 0, color: '#f59e0b' },
                        { name: '✨ Свободные', value: workingDepositData.freeUsdt.total || 0, color: '#10b981' },
                      ].filter(item => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={{
                        stroke: 'var(--text-tertiary)',
                        strokeWidth: 1
                      }}
                      label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      outerRadius={70}
                      innerRadius={40}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {[
                        { name: '💎 Платформы', value: workingDepositData.platformBalances.total || 0, color: '#6366f1' },
                        { name: '🔒 Заблокированные', value: workingDepositData.blockedPesos.totalUsdt || 0, color: '#ef4444' },
                        { name: '⏳ Неоплаченные', value: workingDepositData.unpaidPesos.totalUsdt || 0, color: '#f59e0b' },
                        { name: '✨ Свободные', value: workingDepositData.freeUsdt.total || 0, color: '#10b981' },
                      ].filter(item => item.value > 0).map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          stroke="var(--bg-primary)"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                      itemStyle={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}
                      formatter={(value: any) => [`${Number(value).toFixed(2)} USDT`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                  Нет данных
                </div>
              )}
            </div>
          </div>

          {/* Detailed Table Widget */}
          <div className="deposit-widget">
            <div className="widget-header">
              <h3 className="widget-title" style={{ fontSize: '0.9rem' }}>
                <BarChart3 size={18} />
                Детальное распределение
              </h3>
            </div>
            <div className="widget-content" style={{ padding: 0 }}>
              {workingDepositData ? (
                <div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                        <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '0.8rem' }}>Показатель</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '0.8rem' }}>Сумма (USDT)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontWeight: '500' }}>💰 Рабочий депозит</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                          {(workingDepositData.summary.totalUsdt || 0).toFixed(2)}
                        </td>
                      </tr>
                      <tr style={{ backgroundColor: (workingDepositData.summary.profit || 0) >= 0 ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)' }}>
                        <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                          {(workingDepositData.summary.profit || 0) >= 0 ? '📈 Профит' : '📉 Дефицит'}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 'bold', color: (workingDepositData.summary.profit || 0) >= 0 ? '#10b981' : '#ef4444' }}>
                          {(workingDepositData.summary.profit || 0) >= 0 ? '+' : ''}{(workingDepositData.summary.profit || 0).toFixed(2)}
                        </td>
                      </tr>
                      <tr style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                        <td colSpan={2} style={{ padding: '6px 12px', fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.75rem' }}>
                          Секции:
                        </td>
                      </tr>
                      <tr 
                        onClick={() => setSelectedSection('platforms')}
                        style={{ 
                          backgroundColor: selectedSection === 'platforms' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedSection !== 'platforms') {
                            e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.05)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedSection !== 'platforms') {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <td style={{ padding: '8px 12px', paddingLeft: '24px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          <span style={{ color: '#6366f1', marginRight: '6px' }}>●</span>
                          💎 Платформы
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: '500' }}>
                          {(workingDepositData.platformBalances.total || 0).toFixed(2)}
                        </td>
                      </tr>
                      <tr 
                        onClick={() => setSelectedSection('blocked')}
                        style={{ 
                          backgroundColor: selectedSection === 'blocked' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.05)',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedSection !== 'blocked') {
                            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedSection !== 'blocked') {
                            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)';
                          }
                        }}
                      >
                        <td style={{ padding: '8px 12px', paddingLeft: '24px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          <span style={{ color: '#ef4444', marginRight: '6px' }}>●</span>
                          🔒 Заблокированные песо
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: '500' }}>
                          {(workingDepositData.blockedPesos.totalUsdt || 0).toFixed(2)}
                        </td>
                      </tr>
                      <tr 
                        onClick={() => setSelectedSection('unpaid')}
                        style={{ 
                          backgroundColor: selectedSection === 'unpaid' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.05)',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedSection !== 'unpaid') {
                            e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedSection !== 'unpaid') {
                            e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.05)';
                          }
                        }}
                      >
                        <td style={{ padding: '8px 12px', paddingLeft: '24px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          <span style={{ color: '#f59e0b', marginRight: '6px' }}>●</span>
                          ⏳ Неоплаченные песо
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: '500' }}>
                          {(workingDepositData.unpaidPesos.totalUsdt || 0).toFixed(2)}
                        </td>
                      </tr>
                      <tr 
                        onClick={() => setSelectedSection('free')}
                        style={{ 
                          backgroundColor: selectedSection === 'free' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.05)',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedSection !== 'free') {
                            e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedSection !== 'free') {
                            e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.05)';
                          }
                        }}
                      >
                        <td style={{ padding: '8px 12px', paddingLeft: '24px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          <span style={{ color: '#10b981', marginRight: '6px' }}>●</span>
                          ✨ Свободные USDT
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: '500' }}>
                          {(workingDepositData.freeUsdt.total || 0).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                  Нет данных
                </div>
              )}
            </div>
          </div>
          </div>

          {/* Right Widget - Section Details */}
          <div className="deposit-right">
            <div className="deposit-widget">
              <div className="widget-header">
                <h3 className="widget-title" style={{ fontSize: '0.9rem' }}>
                  <BarChart3 size={18} />
                  {selectedSection === 'platforms' && '💎 Платформы - Детали'}
                  {selectedSection === 'blocked' && '🔒 Заблокированные песо - Детали'}
                  {selectedSection === 'unpaid' && '⏳ Неоплаченные песо - Детали'}
                  {selectedSection === 'free' && '✨ Свободные USDT - Детали'}
                  {!selectedSection && 'Выберите секцию'}
                </h3>
              </div>
              <div className="widget-content" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                {selectedSection ? (
                  <div style={{ textAlign: 'center', width: '100%' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>
                      {selectedSection === 'platforms' && '💎'}
                      {selectedSection === 'blocked' && '🔒'}
                      {selectedSection === 'unpaid' && '⏳'}
                      {selectedSection === 'free' && '✨'}
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>
                      {selectedSection === 'platforms' && 'Платформы'}
                      {selectedSection === 'blocked' && 'Заблокированные песо'}
                      {selectedSection === 'unpaid' && 'Неоплаченные песо'}
                      {selectedSection === 'free' && 'Свободные USDT'}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      Детальная информация будет здесь
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '12px' }}>👈</div>
                    <div style={{ fontSize: '0.9rem' }}>Выберите секцию в таблице слева</div>
                  </div>
                )}
              </div>
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
        </div>
      </div>
    </div>
  );
}
