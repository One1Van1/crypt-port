import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, TrendingUp, Clock, Award } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/user.types';
import './TeamLeadDashboard.css';

export default function TeamLeadDashboard() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<'requisites' | 'operators' | 'analytics'>('requisites');

  // Проверка доступа
  if (user?.role !== UserRole.TEAMLEAD && user?.role !== UserRole.ADMIN) {
    return (
      <div className="access-denied">
        <h2>{t('errors.accessDenied')}</h2>
        <p>{t('errors.teamleadOnly')}</p>
      </div>
    );
  }

  return (
    <div className="teamlead-dashboard">
      <div className="teamlead-header">
        <div className="teamlead-title">
          <Award size={32} className="title-icon" />
          <div>
            <h1>{t('teamlead.dashboard')}</h1>
            <p className="subtitle">{t('teamlead.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="teamlead-tabs">
        <button
          className={`teamlead-tab ${activeTab === 'requisites' ? 'active' : ''}`}
          onClick={() => setActiveTab('requisites')}
        >
          <TrendingUp size={20} />
          <span>{t('teamlead.requisites')}</span>
        </button>
        <button
          className={`teamlead-tab ${activeTab === 'operators' ? 'active' : ''}`}
          onClick={() => setActiveTab('operators')}
        >
          <Users size={20} />
          <span>{t('teamlead.operators')}</span>
        </button>
        <button
          className={`teamlead-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <Clock size={20} />
          <span>{t('teamlead.analytics')}</span>
        </button>
      </div>

      <div className="teamlead-content">
        {activeTab === 'requisites' && <RequisitesSection />}
        {activeTab === 'operators' && <OperatorsSection />}
        {activeTab === 'analytics' && <AnalyticsSection />}
      </div>
    </div>
  );
}

// Секция управления приоритетами реквизитов
function RequisitesSection() {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bank-accounts?limit=100');
      const data = await response.json();
      setAccounts(data.items || []);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePriorityChange = async (accountId: number, newPriority: number) => {
    setUpdating(accountId);
    try {
      await fetch(`/api/bank-accounts/${accountId}/priority`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority }),
      });
      await loadAccounts();
    } catch (error) {
      console.error('Failed to update priority:', error);
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      working: { label: t('bankAccounts.statusWorking'), className: 'status-working' },
      not_working: { label: t('bankAccounts.statusNotWorking'), className: 'status-not-working' },
      blocked: { label: t('bankAccounts.statusBlocked'), className: 'status-blocked' },
    };
    return statusMap[status] || { label: status, className: '' };
  };

  if (loading) {
    return (
      <div className="section requisites-section">
        <div className="section-header">
          <h2>{t('teamlead.requisitesTitle')}</h2>
          <p className="section-description">{t('teamlead.requisitesDescription')}</p>
        </div>
        <div className="section-content">
          <p className="placeholder">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section requisites-section">
      <div className="section-header">
        <h2>{t('teamlead.requisitesTitle')}</h2>
        <p className="section-description">{t('teamlead.requisitesDescription')}</p>
      </div>
      <div className="section-content">
        <div className="requisites-table">
          <table>
            <thead>
              <tr>
                <th>{t('teamlead.priority')}</th>
                <th>{t('bankAccounts.bank')}</th>
                <th>{t('bankAccounts.cbu')}</th>
                <th>{t('bankAccounts.alias')}</th>
                <th>{t('bankAccounts.status')}</th>
                <th>{t('teamlead.available')}</th>
                <th>{t('teamlead.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => {
                const status = getStatusBadge(account.status);
                const available = account.limitAmount - account.withdrawnAmount;
                return (
                  <tr key={account.id}>
                    <td>
                      <input
                        type="number"
                        value={account.priority}
                        onChange={(e) => handlePriorityChange(account.id, parseInt(e.target.value))}
                        disabled={updating === account.id}
                        className="priority-input"
                        min="0"
                        max="999"
                      />
                    </td>
                    <td>{account.bank?.name || account.bankName || '-'}</td>
                    <td className="cbu-cell">{account.cbu}</td>
                    <td>{account.alias}</td>
                    <td>
                      <span className={`status-badge ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="amount-cell">
                      ${available.toFixed(2)} / ${account.limitAmount.toFixed(2)}
                    </td>
                    <td>
                      {updating === account.id ? (
                        <span className="updating-text">{t('common.saving')}</span>
                      ) : (
                        <span className="priority-hint">{t('teamlead.changePriority')}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Секция контроля операторов
function OperatorsSection() {
  const { t } = useTranslation();
  const [operators, setOperators] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersResponse, shiftsResponse] = await Promise.all([
        fetch('/api/users?role=operator&limit=100'),
        fetch('/api/shifts?status=active&limit=100'),
      ]);
      
      const usersData = await usersResponse.json();
      const shiftsData = await shiftsResponse.json();
      
      setOperators(usersData.items || []);
      setShifts(shiftsData.items || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getCurrentShift = (operatorId: string) => {
    return shifts.find(shift => shift.operator?.id === parseInt(operatorId));
  };

  if (loading) {
    return (
      <div className="section operators-section">
        <div className="section-header">
          <h2>{t('teamlead.operatorsTitle')}</h2>
          <p className="section-description">{t('teamlead.operatorsDescription')}</p>
        </div>
        <div className="section-content">
          <p className="placeholder">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section operators-section">
      <div className="section-header">
        <h2>{t('teamlead.operatorsTitle')}</h2>
        <p className="section-description">{t('teamlead.operatorsDescription')}</p>
      </div>
      <div className="section-content">
        <div className="operators-grid">
          {operators.map((operator) => {
            const currentShift = getCurrentShift(operator.id);
            const isWorking = !!currentShift;
            
            return (
              <div key={operator.id} className={`operator-card ${isWorking ? 'working' : ''}`}>
                <div className="operator-header">
                  <div className="operator-info">
                    <h3>{operator.username}</h3>
                    <p className="operator-email">{operator.email}</p>
                  </div>
                  <div className={`operator-status ${isWorking ? 'active' : 'inactive'}`}>
                    {isWorking ? t('teamlead.working') : t('teamlead.offline')}
                  </div>
                </div>
                
                {isWorking && currentShift ? (
                  <div className="shift-info">
                    <div className="shift-detail">
                      <span className="shift-label">{t('teamlead.platform')}:</span>
                      <span className="shift-value">{currentShift.platformName}</span>
                    </div>
                    <div className="shift-detail">
                      <span className="shift-label">{t('teamlead.duration')}:</span>
                      <span className="shift-value">{formatDuration(currentShift.currentDuration)}</span>
                    </div>
                    <div className="shift-detail">
                      <span className="shift-label">{t('teamlead.operations')}:</span>
                      <span className="shift-value">{currentShift.operationsCount}</span>
                    </div>
                    <div className="shift-detail">
                      <span className="shift-label">{t('teamlead.totalAmount')}:</span>
                      <span className="shift-value">${currentShift.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="no-shift">
                    <p>{t('teamlead.noActiveShift')}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {operators.length === 0 && (
          <p className="placeholder">{t('teamlead.noOperators')}</p>
        )}
      </div>
    </div>
  );
}

// Секция аналитики
function AnalyticsSection() {
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/operators?period=${period}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="section analytics-section">
        <div className="section-header">
          <h2>{t('teamlead.analyticsTitle')}</h2>
          <p className="section-description">{t('teamlead.analyticsDescription')}</p>
        </div>
        <div className="section-content">
          <p className="placeholder">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section analytics-section">
      <div className="section-header">
        <div>
          <h2>{t('teamlead.analyticsTitle')}</h2>
          <p className="section-description">{t('teamlead.analyticsDescription')}</p>
        </div>
        <div className="period-selector">
          <button
            className={`period-btn ${period === 'today' ? 'active' : ''}`}
            onClick={() => setPeriod('today')}
          >
            {t('teamlead.today')}
          </button>
          <button
            className={`period-btn ${period === 'week' ? 'active' : ''}`}
            onClick={() => setPeriod('week')}
          >
            {t('teamlead.week')}
          </button>
          <button
            className={`period-btn ${period === 'month' ? 'active' : ''}`}
            onClick={() => setPeriod('month')}
          >
            {t('teamlead.month')}
          </button>
        </div>
      </div>
      <div className="section-content">
        {analytics?.operators && analytics.operators.length > 0 ? (
          <div className="analytics-table">
            <table>
              <thead>
                <tr>
                  <th>{t('teamlead.operator')}</th>
                  <th>{t('teamlead.shifts')}</th>
                  <th>{t('teamlead.totalHours')}</th>
                  <th>{t('teamlead.transactions')}</th>
                  <th>{t('teamlead.totalAmount')}</th>
                  <th>{t('teamlead.successRate')}</th>
                  <th>{t('teamlead.avgPerHour')}</th>
                </tr>
              </thead>
              <tbody>
                {analytics.operators.map((op: any) => {
                  const avgPerHour = op.totalDuration > 0 
                    ? (op.completedAmount / (op.totalDuration / 60)).toFixed(2)
                    : '0.00';
                  
                  return (
                    <tr key={op.operatorId}>
                      <td className="operator-name">{op.operatorUsername}</td>
                      <td>{op.totalShifts}</td>
                      <td>{formatDuration(op.totalDuration)}</td>
                      <td>{op.completedTransactions} / {op.totalTransactions}</td>
                      <td className="amount-cell">${op.completedAmount.toFixed(2)}</td>
                      <td>
                        <span className={`success-rate ${op.successRate >= 90 ? 'high' : op.successRate >= 70 ? 'medium' : 'low'}`}>
                          {op.successRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="amount-cell">${avgPerHour}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="placeholder">{t('teamlead.noAnalytics')}</p>
        )}
      </div>
    </div>
  );
}
