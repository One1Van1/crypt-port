import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
  AlertCircle,
  DollarSign,
  Edit3,
  Check,
  History,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { analyticsService } from '../../services/analytics.service';
import { platformsService } from '../../services/platforms.service';
import { transactionsService } from '../../services/transactions.service';
import { workingDepositService } from '../../services/workingDepositService';
import { profitsService } from '../../services/profits.service';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/user.types';
import DatePicker from '../../components/DatePicker/DatePicker';
import './Analytics.css';

type DateFilter = 'today' | 'yesterday' | 'week' | 'month' | 'custom';
type PlatformFilter = 'all' | string;
type OperatorFilter = 'all' | string;

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

export default function Analytics() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [dateFilter, setDateFilter] = useState<DateFilter>('week');
  const [platformFilter] = useState<PlatformFilter>('all');
  const [operatorFilter, setOperatorFilter] = useState<OperatorFilter>('all');
  const [selectedOperator, setSelectedOperator] = useState<number | null>(null);
  const [editingPlatformId, setEditingPlatformId] = useState<number | null>(null);
  const [newRate, setNewRate] = useState<string>('');
  const [withdrawalDate, setWithdrawalDate] = useState<Date | null>(new Date());
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isProfitRecorded, setIsProfitRecorded] = useState<boolean>(false);
  const [isEditingInitialDeposit, setIsEditingInitialDeposit] = useState(false);
  const [initialDepositDraft, setInitialDepositDraft] = useState<string>('');

  const [profitWithdrawDraft, setProfitWithdrawDraft] = useState<string>('');
  const [profitAdminRateDraft, setProfitAdminRateDraft] = useState<string>('');

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

  const { data: profitWithdrawalsHistory, isLoading: isProfitHistoryLoading } = useQuery({
    queryKey: ['profitWithdrawalsHistory'],
    queryFn: () => profitsService.getHistory(),
    enabled: user?.role === UserRole.ADMIN || user?.role === UserRole.TEAMLEAD,
  });

  const setInitialDepositMutation = useMutation({
    mutationFn: (amount: number) => workingDepositService.setInitialDeposit(amount),
    onSuccess: () => {
      toast.success('Начальный депозит обновлён');
      queryClient.invalidateQueries({ queryKey: ['workingDepositSections'] });
      setIsEditingInitialDeposit(false);
    },
    onError: () => {
      toast.error('Ошибка обновления начального депозита');
    },
  });

  const withdrawProfitMutation = useMutation({
    mutationFn: (dto: { profitUsdtAmount: number; adminRate: number }) =>
      profitsService.withdrawSimple(dto),
    onSuccess: () => {
      toast.success('Профит выведен');
      queryClient.invalidateQueries({ queryKey: ['workingDepositSections'] });
      queryClient.invalidateQueries({ queryKey: ['profitWithdrawalsHistory'] });
      setProfitWithdrawDraft('');
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Ошибка вывода профита');
    },
  });

  const reserveProfitMutation = useMutation({
    mutationFn: () => workingDepositService.reserveProfit(),
    onSuccess: () => {
      toast.success('Профит записан');
      queryClient.invalidateQueries({ queryKey: ['workingDepositSections'] });
      setIsProfitRecorded(true);
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Ошибка записи профита');
    },
  });

  useEffect(() => {
    setIsEditingInitialDeposit(false);
  }, [selectedSection]);

  useEffect(() => {
    if (selectedSection === 'profit') {
      setIsProfitRecorded(false);
    }
  }, [selectedSection]);

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
                (() => {
                  const rawData = [
                    {
                      key: 'platforms',
                      name: '💎 Площадки',
                      rawValue: workingDepositData.platformBalances.total || 0,
                      color: '#6366f1',
                    },
                    {
                      key: 'profitReserve',
                      name: '📈 Профит',
                      rawValue: workingDepositData.profitReserve?.totalUsdt || 0,
                      color: '#22c55e',
                    },
                    {
                      key: 'blocked',
                      name: '🔒 Заблокированные',
                      rawValue: workingDepositData.blockedPesos.totalUsdt || 0,
                      color: '#ef4444',
                    },
                    {
                      key: 'unpaid',
                      name: '⏳ Неоплаченные',
                      rawValue: workingDepositData.unpaidPesos.totalUsdt || 0,
                      color: '#f59e0b',
                    },
                    {
                      key: 'free',
                      name: '✨ Свободные',
                      rawValue: workingDepositData.freeUsdt.total || 0,
                      color: '#10b981',
                    },
                    {
                      key: 'deficit',
                      name: '💱 В обмене',
                      rawValue: workingDepositData.deficit.totalUsdt || 0,
                      color: 'var(--text-tertiary)',
                    },
                  ].filter(item => item.rawValue > 0);

                  const totalRaw = rawData.reduce((sum, item) => sum + item.rawValue, 0);
                  const minShare = 0.02; // ~2% of chart minimum for visibility
                  const maxShare = 0.06; // cap so it doesn't look too distorted
                  const boostedFree = (rawFree: number) => {
                    if (rawFree <= 0 || totalRaw <= 0) return rawFree;
                    const minValue = totalRaw * minShare;
                    const maxValue = totalRaw * maxShare;
                    return Math.min(Math.max(rawFree, minValue), maxValue);
                  };

                  const chartData = rawData.map(item => ({
                    ...item,
                    value: item.key === 'free' ? boostedFree(item.rawValue) : item.rawValue,
                  }));

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <ResponsiveContainer width="100%" height={140}>
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            outerRadius={62}
                            innerRadius={36}
                            paddingAngle={2}
                            dataKey="value"
                            labelLine={false}
                            label={false}
                          >
                            {chartData.map((entry, index) => (
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
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            }}
                            itemStyle={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}
                            formatter={(_value: any, _name: any, props: any) => {
                              const rawValue = Number(props?.payload?.rawValue ?? 0);
                              return [`${rawValue.toFixed(2)} USDT`, ''];
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>

                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '6px 10px',
                          fontSize: '0.75rem',
                          lineHeight: 1.2,
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {rawData.map((item) => {
                          const percent = totalRaw > 0 ? (item.rawValue / totalRaw) * 100 : 0;
                          return (
                            <div
                              key={item.key}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                whiteSpace: 'nowrap',
                              }}
                              title={`${item.name}: ${percent.toFixed(1)}%`}
                            >
                              <span style={{ color: item.color }}>●</span>
                              <span>{item.name}: {percent.toFixed(1)}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()
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
                (() => {
                  const displayedTotalUsdt = Number(workingDepositData.summary.totalUsdt || 0);
                  const displayedProfit = Number(
                    workingDepositData.summary.profit ??
                      displayedTotalUsdt - Number(workingDepositData.summary.initialDeposit || 0),
                  );
                  const isProfitable = displayedProfit >= 0;

                  return (
                <div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                        <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '0.8rem' }}>Показатель</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '0.8rem' }}>Сумма (USDT)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        onClick={() =>
                          setSelectedSection((prev) => (prev === 'summary' ? null : 'summary'))
                        }
                        style={{ cursor: 'pointer' }}
                      >
                        <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontWeight: '500' }}>💰 Рабочий депозит</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                          {displayedTotalUsdt.toFixed(2)}
                        </td>
                      </tr>
                      <tr style={{ backgroundColor: isProfitable ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)' }}>
                        <td
                          style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontWeight: '500', cursor: 'pointer' }}
                          onClick={() =>
                            setSelectedSection((prev) => (prev === 'profit' ? null : 'profit'))
                          }
                        >
                          {isProfitable ? '📈 Профит' : '📉 Дефицит'}
                        </td>
                        <td
                          style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 'bold', color: isProfitable ? '#10b981' : '#ef4444', cursor: 'pointer' }}
                          onClick={() =>
                            setSelectedSection((prev) => (prev === 'profit' ? null : 'profit'))
                          }
                        >
                          {isProfitable ? '+' : ''}{displayedProfit.toFixed(2)}
                        </td>
                      </tr>
                      <tr style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                        <td colSpan={2} style={{ padding: '6px 12px', fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.75rem' }}>
                          Секции:
                        </td>
                      </tr>
                      <tr 
                        onClick={() => setSelectedSection((prev) => (prev === 'platforms' ? null : 'platforms'))}
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
                          💎 Площадки
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: '500' }}>
                          {(workingDepositData.platformBalances.total || 0).toFixed(2)}
                        </td>
                      </tr>
                      <tr 
                        onClick={() => setSelectedSection((prev) => (prev === 'blocked' ? null : 'blocked'))}
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
                        onClick={() => setSelectedSection((prev) => (prev === 'unpaid' ? null : 'unpaid'))}
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
                        onClick={() => setSelectedSection((prev) => (prev === 'free' ? null : 'free'))}
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

                      <tr 
                        onClick={() => setSelectedSection((prev) => (prev === 'deficit' ? null : 'deficit'))}
                        style={{ 
                          backgroundColor: selectedSection === 'deficit' ? 'rgba(148, 163, 184, 0.18)' : 'rgba(148, 163, 184, 0.06)',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedSection !== 'deficit') {
                            e.currentTarget.style.backgroundColor = 'rgba(148, 163, 184, 0.12)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedSection !== 'deficit') {
                            e.currentTarget.style.backgroundColor = 'rgba(148, 163, 184, 0.06)';
                          }
                        }}
                      >
                        <td style={{ padding: '8px 12px', paddingLeft: '24px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          <span style={{ color: 'var(--text-tertiary)', marginRight: '6px' }}>●</span>
                          💱 В обмене
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: '500' }}>
                          {(workingDepositData.deficit.totalUsdt || 0).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                  );
                })()
              ) : (
                <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                  Нет данных
                </div>
              )}
            </div>
          </div>
          </div>

          {/* Right Widget - New Widget */}
          <div className="deposit-right">
            <div className="deposit-widget" style={{ height: '100%' }}>
              <div className="widget-header">
                <h3 className="widget-title" style={{ fontSize: '0.9rem' }}>
                  <BarChart3 size={18} />
                  Детали
                </h3>
              </div>
              <div className="widget-content" style={{ padding: '14px', height: 'calc(100% - 60px)', overflow: 'auto' }}>
                {workingDepositData ? (
                  (() => {
                    const displayedTotalUsdt = Number(workingDepositData.summary.totalUsdt || 0);
                    const displayedProfit = Number(
                      workingDepositData.summary.profit ??
                        displayedTotalUsdt - Number(workingDepositData.summary.initialDeposit || 0),
                    );
                    const isProfitable = displayedProfit >= 0;

                    if (!selectedSection) {
                      return (
                        <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '24px 8px' }}>
                          <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>👈</div>
                          <div style={{ fontSize: '0.9rem' }}>Нажмите на строку слева, чтобы открыть детали</div>
                        </div>
                      );
                    }

                    if (selectedSection === 'summary') {
                      return (
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, fontSize: '1rem' }}>💰 Рабочий депозит</div>

                          <div style={{ display: 'grid', gap: 0, fontSize: '0.95rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>Итого</span>
                              <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{displayedTotalUsdt.toFixed(2)} USDT</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                              <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                Начальный депозит
                                {user?.role === UserRole.ADMIN && !isEditingInitialDeposit && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setInitialDepositDraft(String(Number(workingDepositData.summary.initialDeposit || 0)));
                                      setIsEditingInitialDeposit(true);
                                    }}
                                    title="Редактировать"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      width: 26,
                                      height: 26,
                                      borderRadius: 8,
                                      border: '1px solid var(--border-color)',
                                      background: 'transparent',
                                      color: 'var(--text-secondary)',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <Edit3 size={14} />
                                  </button>
                                )}
                              </span>

                              {user?.role === UserRole.ADMIN && isEditingInitialDeposit ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <input
                                    value={initialDepositDraft}
                                    onChange={(e) => setInitialDepositDraft(e.target.value)}
                                    inputMode="decimal"
                                    placeholder="0"
                                    style={{
                                      width: 120,
                                      padding: '6px 8px',
                                      borderRadius: 8,
                                      border: '1px solid var(--border-color)',
                                      background: 'transparent',
                                      color: 'var(--text-primary)',
                                      fontSize: '0.9rem',
                                      textAlign: 'right',
                                    }}
                                  />
                                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>USDT</span>
                                  <button
                                    type="button"
                                    disabled={setInitialDepositMutation.isPending}
                                    onClick={() => {
                                      const parsed = Number(String(initialDepositDraft).replace(',', '.'));
                                      if (!Number.isFinite(parsed) || parsed < 0) {
                                        toast.error('Введите корректную сумму');
                                        return;
                                      }
                                      setInitialDepositMutation.mutate(parsed);
                                    }}
                                    title="Сохранить"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      width: 28,
                                      height: 28,
                                      borderRadius: 8,
                                      border: '1px solid var(--border-color)',
                                      background: 'transparent',
                                      color: 'var(--text-secondary)',
                                      cursor: setInitialDepositMutation.isPending ? 'not-allowed' : 'pointer',
                                      opacity: setInitialDepositMutation.isPending ? 0.6 : 1,
                                    }}
                                  >
                                    <Check size={16} />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={setInitialDepositMutation.isPending}
                                    onClick={() => setIsEditingInitialDeposit(false)}
                                    title="Отмена"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      width: 28,
                                      height: 28,
                                      borderRadius: 8,
                                      border: '1px solid var(--border-color)',
                                      background: 'transparent',
                                      color: 'var(--text-secondary)',
                                      cursor: setInitialDepositMutation.isPending ? 'not-allowed' : 'pointer',
                                      opacity: setInitialDepositMutation.isPending ? 0.6 : 1,
                                    }}
                                  >
                                    ✕
                                  </button>
                                </span>
                              ) : (
                                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{Number(workingDepositData.summary.initialDeposit || 0).toFixed(2)} USDT</span>
                              )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>{isProfitable ? 'Профит' : 'Дефицит'}</span>
                              <span style={{ color: isProfitable ? '#10b981' : '#ef4444', fontWeight: 800 }}>{isProfitable ? '+' : ''}{displayedProfit.toFixed(2)} USDT</span>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    if (selectedSection === 'profit') {
                      if (!isProfitRecorded) {
                        return (
                          <div>
                            <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, fontSize: '1rem' }}>
                              📌 Записать профит
                            </div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 12 }}>
                              Нажмите кнопку, чтобы обновить профит/дефицит в базе перед отображением.
                            </div>
                            <button
                              type="button"
                              disabled={reserveProfitMutation.isPending}
                              onClick={() => reserveProfitMutation.mutate()}
                              style={{
                                padding: '10px 12px',
                                borderRadius: 12,
                                border: '1px solid var(--border-color)',
                                background: 'transparent',
                                color: 'var(--text-primary)',
                                fontWeight: 800,
                                fontSize: '0.95rem',
                                cursor: reserveProfitMutation.isPending ? 'not-allowed' : 'pointer',
                                opacity: reserveProfitMutation.isPending ? 0.6 : 1,
                              }}
                            >
                              {reserveProfitMutation.isPending ? 'Запись...' : 'Записать профит'}
                            </button>
                          </div>
                        );
                      }

                      const parsedProfitUsdtAmount = Number(String(profitWithdrawDraft).replace(',', '.'));
                      const parsedAdminRate = Number(String(profitAdminRateDraft).replace(',', '.'));
                      const computedPesos =
                        Number.isFinite(parsedProfitUsdtAmount) && Number.isFinite(parsedAdminRate)
                          ? parsedProfitUsdtAmount * parsedAdminRate
                          : null;

                      return (
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, fontSize: '1rem' }}>{isProfitable ? '📈 Профит' : '📉 Дефицит'}</div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: isProfitable ? '#10b981' : '#ef4444', marginBottom: 10 }}>
                            {isProfitable ? '+' : ''}{displayedProfit.toFixed(2)} USDT
                          </div>
                          {Number(workingDepositData.summary.initialDeposit || 0) > 0 && (
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 12 }}>
                              ROI: {((displayedProfit / Number(workingDepositData.summary.initialDeposit || 0)) * 100).toFixed(2)}%
                            </div>
                          )}

                          {(user?.role === UserRole.ADMIN) && (
                            <div style={{ paddingTop: 12, borderTop: '1px solid var(--border-color)', marginTop: 4 }}>
                              <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10, fontSize: '0.95rem' }}>Забрать профит</div>
                              <div style={{ display: 'grid', gap: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Сумма (USDT)</span>
                                  <input
                                    value={profitWithdrawDraft}
                                    onChange={(e) => setProfitWithdrawDraft(e.target.value)}
                                    inputMode="decimal"
                                    placeholder="0"
                                    style={{
                                      width: 140,
                                      padding: '8px 10px',
                                      borderRadius: 10,
                                      border: '1px solid var(--border-color)',
                                      background: 'transparent',
                                      color: 'var(--text-primary)',
                                      fontSize: '0.95rem',
                                      textAlign: 'right',
                                    }}
                                  />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Курс админа (ARS/USDT)</span>
                                  <input
                                    value={profitAdminRateDraft}
                                    onChange={(e) => setProfitAdminRateDraft(e.target.value)}
                                    inputMode="decimal"
                                    placeholder="0"
                                    style={{
                                      width: 140,
                                      padding: '8px 10px',
                                      borderRadius: 10,
                                      border: '1px solid var(--border-color)',
                                      background: 'transparent',
                                      color: 'var(--text-primary)',
                                      fontSize: '0.95rem',
                                      textAlign: 'right',
                                    }}
                                  />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingTop: 2 }}>
                                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Вы получите (ARS)</span>
                                  <span style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.95rem' }}>
                                    {computedPesos === null ? '—' : computedPesos.toFixed(2)}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  disabled={withdrawProfitMutation.isPending}
                                  onClick={() => {
                                    const profitUsdtAmount = parsedProfitUsdtAmount;
                                    const adminRate = parsedAdminRate;

                                    if (!Number.isFinite(profitUsdtAmount) || profitUsdtAmount <= 0) {
                                      toast.error('Введите сумму профита в USDT');
                                      return;
                                    }

                                    if (!Number.isFinite(adminRate) || adminRate <= 0) {
                                      toast.error('Введите корректный курс админа');
                                      return;
                                    }

                                    withdrawProfitMutation.mutate({
                                      profitUsdtAmount,
                                      adminRate,
                                    });
                                  }}
                                  style={{
                                    marginTop: 4,
                                    padding: '10px 12px',
                                    borderRadius: 12,
                                    border: '1px solid var(--border-color)',
                                    background: 'transparent',
                                    color: 'var(--text-primary)',
                                    fontWeight: 800,
                                    fontSize: '0.95rem',
                                    cursor: withdrawProfitMutation.isPending ? 'not-allowed' : 'pointer',
                                    opacity: withdrawProfitMutation.isPending ? 0.6 : 1,
                                  }}
                                >
                                  {withdrawProfitMutation.isPending ? 'Вывод...' : 'Забрать профит'}
                                </button>
                              </div>
                            </div>
                          )}

                          <div style={{ paddingTop: 12, borderTop: '1px solid var(--border-color)', marginTop: 12 }}>
                            <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10, fontSize: '0.95rem' }}>История выводов</div>
                            {isProfitHistoryLoading ? (
                              <div style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Загрузка...</div>
                            ) : profitWithdrawalsHistory?.items?.length ? (
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                                <thead>
                                  <tr style={{ backgroundColor: 'rgba(100, 116, 139, 0.08)' }}>
                                    <th style={{ textAlign: 'left', padding: '8px', color: 'var(--text-secondary)' }}>Дата</th>
                                    <th style={{ textAlign: 'right', padding: '8px', color: 'var(--text-secondary)' }}>USDT</th>
                                    <th style={{ textAlign: 'right', padding: '8px', color: 'var(--text-secondary)' }}>Курс</th>
                                    <th style={{ textAlign: 'right', padding: '8px', color: 'var(--text-secondary)' }}>ARS</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {profitWithdrawalsHistory.items.slice(0, 10).map((item) => (
                                    <tr key={item.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                                      <td style={{ padding: '8px', color: 'var(--text-primary)' }}>
                                        {new Date(item.createdAt).toLocaleString('ru-RU')}
                                      </td>
                                      <td style={{ padding: '8px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 700 }}>
                                        {Number(item.withdrawnUsdt || 0).toFixed(2)}
                                      </td>
                                      <td style={{ padding: '8px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>
                                        {Number(item.adminRate || 0).toFixed(2)}
                                      </td>
                                      <td style={{ padding: '8px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 700 }}>
                                        {Number(item.profitPesos || 0).toFixed(2)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <div style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Пока нет выводов</div>
                            )}
                          </div>
                        </div>
                      );
                    }

                    if (selectedSection === 'platforms') {
                      const platforms = workingDepositData.platformBalances.platforms || [];
                      return (
                        <div>
                          <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: 10 }}>💎 Площадки</div>
                          {platforms.length ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                              <thead>
                                <tr style={{ backgroundColor: 'rgba(100, 116, 139, 0.08)' }}>
                                  <th style={{ textAlign: 'left', padding: '8px', color: 'var(--text-secondary)' }}>Площадка</th>
                                  <th style={{ textAlign: 'right', padding: '8px', color: 'var(--text-secondary)' }}>USDT</th>
                                </tr>
                              </thead>
                              <tbody>
                                {platforms.map((p: any) => (
                                  <tr key={p.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '8px', color: 'var(--text-primary)' }}>{p.name}</td>
                                    <td style={{ padding: '8px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>{Number(p.balance || 0).toFixed(2)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Нет данных</div>
                          )}
                        </div>
                      );
                    }

                    if (selectedSection === 'blocked' || selectedSection === 'unpaid') {
                      const title = selectedSection === 'blocked' ? '🔒 Заблокированные песо' : '⏳ Неоплаченные песо';
                      const accounts = selectedSection === 'blocked' ? workingDepositData.blockedPesos.accounts : workingDepositData.unpaidPesos.accounts;
                      const rows = accounts || [];
                      return (
                        <div>
                          <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: 10 }}>{title}</div>
                          {rows.length ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                              <thead>
                                <tr style={{ backgroundColor: 'rgba(100, 116, 139, 0.08)' }}>
                                  <th style={{ textAlign: 'left', padding: '8px', color: 'var(--text-secondary)' }}>Счёт</th>
                                  <th style={{ textAlign: 'right', padding: '8px', color: 'var(--text-secondary)' }}>USDT</th>
                                </tr>
                              </thead>
                              <tbody>
                                {rows.map((a: any) => (
                                  <tr key={`${a.type}-${a.id}`} style={{ borderTop: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '8px', color: 'var(--text-primary)' }}>{a.identifier}</td>
                                    <td style={{ padding: '8px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>{Number(a.balanceUsdt || 0).toFixed(2)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Нет данных</div>
                          )}
                        </div>
                      );
                    }

                    if (selectedSection === 'free') {
                      const conversions = workingDepositData.freeUsdt.conversions || [];
                      return (
                        <div>
                          <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: 10 }}>✨ Свободные USDT</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <div>Доступно сейчас</div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{Number(workingDepositData.freeUsdt.total || 0).toFixed(2)} USDT</div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <div>Зарезервированный профит</div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{Number(workingDepositData.profitReserve?.totalUsdt || 0).toFixed(2)} USDT</div>
                          </div>
                          {conversions.length ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                              <thead>
                                <tr style={{ backgroundColor: 'rgba(100, 116, 139, 0.08)' }}>
                                  <th style={{ textAlign: 'left', padding: '8px', color: 'var(--text-secondary)' }}>Дата</th>
                                  <th style={{ textAlign: 'right', padding: '8px', color: 'var(--text-secondary)' }}>USDT</th>
                                </tr>
                              </thead>
                              <tbody>
                                {conversions.map((c: any) => (
                                  <tr key={c.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '8px', color: 'var(--text-primary)' }}>{new Date(c.createdAt).toLocaleString('ru-RU')}</td>
                                    <td style={{ padding: '8px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>{Number(c.usdtAmount || 0).toFixed(2)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Нет данных</div>
                          )}
                        </div>
                      );
                    }

                    if (selectedSection === 'deficit') {
                      const withdrawals = workingDepositData.deficit.withdrawals || [];
                      return (
                        <div>
                          <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: 10 }}>💱 В обмене</div>
                          {withdrawals.length ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                              <thead>
                                <tr style={{ backgroundColor: 'rgba(100, 116, 139, 0.08)' }}>
                                  <th style={{ textAlign: 'left', padding: '8px', color: 'var(--text-secondary)' }}>Дата</th>
                                  <th style={{ textAlign: 'right', padding: '8px', color: 'var(--text-secondary)' }}>USDT</th>
                                </tr>
                              </thead>
                              <tbody>
                                {withdrawals.map((w: any) => (
                                  <tr key={w.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '8px', color: 'var(--text-primary)' }}>{new Date(w.createdAt).toLocaleString('ru-RU')}</td>
                                    <td style={{ padding: '8px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>{Number(w.amountUsdt || 0).toFixed(2)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Нет операций</div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Нет данных</div>
                    );
                  })()
                ) : (
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Нет данных</div>
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
