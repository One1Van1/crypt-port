import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, DollarSign, PiggyBank, Users, Download, RefreshCw, Calendar, Filter } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { analyticsService } from '../../services/analytics.service';
import './Analytics.css';

export default function Analytics() {
  const { t } = useTranslation();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['analytics'],
    queryFn: analyticsService.getGeneral,
  });

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
    return `ARS ${value.toLocaleString('es-AR')}`;
  };

  const metrics = [
    {
      icon: DollarSign,
      title: t('analytics.totalWithdrawn'),
      value: formatCurrency(data?.totalWithdrawn || 0),
      change: '+12.5%',
      positive: true,
      bgColor: '#e0e7ff',
      iconColor: '#6366f1',
    },
    {
      icon: PiggyBank,
      title: t('analytics.currentBalance'),
      value: formatCurrency(data?.currentBalance || 0),
      change: '+8.2%',
      positive: true,
      bgColor: '#f3e8ff',
      iconColor: '#a855f7',
    },
    {
      icon: TrendingUp,
      title: t('analytics.totalEarnings'),
      value: formatCurrency(data?.totalEarnings || 0),
      change: '+15.8%',
      positive: true,
      bgColor: '#d1fae5',
      iconColor: '#10b981',
    },
    {
      icon: Users,
      title: t('analytics.totalOperators'),
      value: String(data?.totalOperators || 0),
      subtitle: `${data?.activeOperators || 0} ${t('analytics.activeOperators')}`,
      bgColor: '#fed7aa',
      iconColor: '#f59e0b',
    },
  ];

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1 className="analytics-title">{t('analytics.title')}</h1>
        <div className="analytics-actions">
          <button className="btn-filter">
            <Calendar size={18} />
            {t('analytics.last7days')}
          </button>
          <button className="btn-filter">
            <Filter size={18} />
            {t('analytics.allOperators')}
          </button>
          <button className="btn-secondary">
            <Download size={18} />
            {t('analytics.exportCSV')}
          </button>
          <button className="btn-primary" onClick={() => refetch()}>
            <RefreshCw size={18} />
            {t('common.refresh')}
          </button>
        </div>
      </div>

      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-card">
            <div className="metric-icon" style={{ backgroundColor: metric.bgColor }}>
              <metric.icon size={24} color={metric.iconColor} />
            </div>
            <div className="metric-content">
              <div className="metric-title">{metric.title}</div>
              <div className="metric-value">{metric.value}</div>
              {metric.change && (
                <div className={`metric-change ${metric.positive ? 'positive' : 'negative'}`}>
                  {metric.change}
                </div>
              )}
              {metric.subtitle && (
                <div className="metric-subtitle">{metric.subtitle}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <h2 className="chart-title">{t('analytics.depositsVsWithdrawals')}</h2>
          <div className="chart-tabs">
            <button className="chart-tab">7D</button>
            <button className="chart-tab active">30D</button>
            <button className="chart-tab">90D</button>
            <button className="chart-tab">1Y</button>
          </div>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data?.trend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis 
                dataKey="date" 
                stroke="var(--text-tertiary)"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="var(--text-tertiary)"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                }}
                formatter={(value: any) => formatCurrency(Number(value))}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="withdrawals" 
                stroke="#6366f1" 
                strokeWidth={2}
                name={t('analytics.withdrawals')}
                dot={{ fill: '#6366f1', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="deposits" 
                stroke="#10b981" 
                strokeWidth={2}
                name={t('analytics.deposits')}
                dot={{ fill: '#10b981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
