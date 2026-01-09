import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { 
  CreditCard, 
  Clock, 
  TrendingUp, 
  Hash, 
  Calendar,
  Building,
  PlayCircle
} from 'lucide-react';
import { shiftsService } from '../../services/shifts.service';
import { transactionsService } from '../../services/transactions.service';
import { useAppStore } from '../../store/appStore';
import GetRequisiteModal from '../../components/GetRequisiteModal/GetRequisiteModal';
import './Dashboard.css';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const timeFormat = useAppStore((state) => state.timeFormat);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRequisiteModalOpen, setIsRequisiteModalOpen] = useState(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch current shift
  const { data: currentShift } = useQuery({
    queryKey: ['current-shift'],
    queryFn: () => shiftsService.getMyCurrentShift(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch recent transactions (for all roles)
  const { data: transactionsData } = useQuery({
    queryKey: ['my-transactions-recent'],
    queryFn: () => transactionsService.getMy({ limit: 10 }),
  });

  const hasActiveShift = !!currentShift;

  const calculateDuration = () => {
    if (!currentShift?.startTime) return { hours: 0, minutes: 0, seconds: 0 };
    
    const start = new Date(currentShift.startTime);
    const diff = currentTime.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { hours, minutes, seconds };
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = d.toDateString() === today.toDateString();
    const isYesterday = d.toDateString() === yesterday.toDateString();

    const time = d.toLocaleTimeString(i18n.language, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: timeFormat === '12h',
    });

    if (isToday) {
      return `Сегодня, ${time}`;
    } else if (isYesterday) {
      return `Вчера, ${time}`;
    } else {
      const dateStr = d.toLocaleDateString(i18n.language, {
        day: 'numeric',
        month: 'short',
      });
      return `${dateStr}, ${time}`;
    }
  };

  const formatCurrency = (value: number) => {
    return `ARS ${value.toLocaleString('es-AR')}`;
  };

  const duration = calculateDuration();
  const recentTransactions = transactionsData?.items || [];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">{t('nav.dashboard')}</h1>
          <p className="dashboard-subtitle">
            {t('dashboard.subtitle')}
          </p>
        </div>
      </div>

      {/* Dashboard Content - Same for all roles */}
      <>
        {/* Active Shift Widget */}
        {hasActiveShift ? (
          <div className="active-shift-widget">
            <div className="shift-header">
              <div className="shift-status">
                <span className="pulse-dot"></span>
                <span>{t('dashboard.activeShift')}</span>
              </div>
              <div className="shift-platform">
                {currentShift.platformName || t('common.unknownPlatform')}
              </div>
            </div>

            <div className="shift-stats-grid">
              <div className="shift-stat">
                <Clock size={24} />
                <div>
                  <div className="stat-label">{t('dashboard.duration')}</div>
                  <div className="stat-value time-value">
                    {`${String(duration.hours).padStart(2, '0')}:${String(duration.minutes).padStart(2, '0')}:${String(duration.seconds).padStart(2, '0')}`}
                  </div>
                </div>
              </div>

              <div className="shift-stat">
                <TrendingUp size={24} />
                <div>
                  <div className="stat-label">{t('dashboard.withdrawalAmount')}</div>
                  <div className="stat-value">{formatCurrency(currentShift.totalAmount || 0)}</div>
                </div>
              </div>

              <div className="shift-stat">
                <Hash size={24} />
                <div>
                  <div className="stat-label">{t('dashboard.operations')}</div>
                  <div className="stat-value">{currentShift.operationsCount || 0}</div>
                </div>
              </div>
            </div>

            <button 
              className="btn-get-requisite"
              onClick={() => setIsRequisiteModalOpen(true)}
            >
              <CreditCard size={20} />
              {t('dashboard.getRequisite')}
            </button>
          </div>
        ) : (
          <div className="no-shift-widget">
            <PlayCircle size={48} />
            <h3>{t('dashboard.noActiveShift')}</h3>
            <p>{t('dashboard.noActiveShiftMessage')}</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/shifts')}
            >
              {t('dashboard.startShift')}
            </button>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="recent-transactions-section">
          <div className="section-header">
            <h2>{t('dashboard.recentTransactions')}</h2>
            <button 
              className="btn-link"
              onClick={() => navigate('/transactions')}
            >
              {t('dashboard.viewAll')} →
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="empty-transactions">
              <p>{t('dashboard.noTransactionsYet')}</p>
            </div>
          ) : (
            <div className="dashboard-transactions-list">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-icon">
                    <Building size={24} />
                  </div>
                  <div className="transaction-bank">
                    {transaction.bank?.name || t('common.unknownBank')}
                  </div>
                  <div className="transaction-meta">
                    <Calendar size={14} />
                    {formatTime(transaction.createdAt)}
                  </div>
                  <div className="transaction-amount">
                    {formatCurrency(transaction.amount)}
                  </div>
                  {transaction.comment && (
                    <div className="transaction-comment-text">
                      <span className="comment-label">Комментарий:</span> {transaction.comment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </>

      {/* Get Requisite Modal */}
      <GetRequisiteModal 
        isOpen={isRequisiteModalOpen}
        onClose={() => setIsRequisiteModalOpen(false)}
        onSuccess={() => {
          setIsRequisiteModalOpen(false);
          // Refresh data
        }}
      />
    </div>
  );
}
