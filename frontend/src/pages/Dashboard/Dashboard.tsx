import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/user.types';
import GetRequisiteModal from '../../components/GetRequisiteModal/GetRequisiteModal';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
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

  // Fetch recent transactions
  const { data: transactionsData } = useQuery({
    queryKey: ['my-transactions-recent'],
    queryFn: () => transactionsService.getMy({ limit: 5 }),
    enabled: user?.role === UserRole.OPERATOR,
  });

  const isOperator = user?.role === UserRole.OPERATOR;
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
    return new Date(date).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
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
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">
            {isOperator ? 'Рабочая панель оператора' : 'Обзор системы'}
          </p>
        </div>
      </div>

      {/* Operator Dashboard */}
      {isOperator && (
        <>
          {/* Active Shift Widget */}
          {hasActiveShift ? (
            <div className="active-shift-widget">
              <div className="shift-header">
                <div className="shift-status">
                  <span className="pulse-dot"></span>
                  <span>Активная смена</span>
                </div>
                <div className="shift-platform">
                  {currentShift.platform?.name || 'Unknown Platform'}
                </div>
              </div>

              <div className="shift-stats-grid">
                <div className="shift-stat">
                  <Clock size={24} />
                  <div>
                    <div className="stat-label">Длительность</div>
                    <div className="stat-value time-value">
                      {`${String(duration.hours).padStart(2, '0')}:${String(duration.minutes).padStart(2, '0')}:${String(duration.seconds).padStart(2, '0')}`}
                    </div>
                  </div>
                </div>

                <div className="shift-stat">
                  <TrendingUp size={24} />
                  <div>
                    <div className="stat-label">Сумма выводов</div>
                    <div className="stat-value">{formatCurrency(currentShift.totalAmount || 0)}</div>
                  </div>
                </div>

                <div className="shift-stat">
                  <Hash size={24} />
                  <div>
                    <div className="stat-label">Операций</div>
                    <div className="stat-value">{currentShift.operationsCount || 0}</div>
                  </div>
                </div>
              </div>

              <button 
                className="btn-get-requisite"
                onClick={() => setIsRequisiteModalOpen(true)}
              >
                <CreditCard size={20} />
                Получить реквизит
              </button>
            </div>
          ) : (
            <div className="no-shift-widget">
              <PlayCircle size={48} />
              <h3>Нет активной смены</h3>
              <p>Начните смену, чтобы получать реквизиты и выполнять операции</p>
              <button 
                className="btn-primary"
                onClick={() => navigate('/shifts')}
              >
                Начать смену
              </button>
            </div>
          )}

          {/* Recent Transactions */}
          <div className="recent-transactions-section">
            <div className="section-header">
              <h2>Последние операции</h2>
              <button 
                className="btn-link"
                onClick={() => navigate('/transactions')}
              >
                Смотреть все →
              </button>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="empty-transactions">
                <p>Пока нет операций за эту смену</p>
              </div>
            ) : (
              <div className="transactions-list">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="transaction-item">
                    <div className="transaction-icon">
                      <Building size={20} />
                    </div>
                    <div className="transaction-details">
                      <div className="transaction-bank">
                        {transaction.bankAccount?.bank?.name || 'Unknown Bank'}
                      </div>
                      <div className="transaction-meta">
                        <Calendar size={12} />
                        {formatTime(transaction.createdAt)}
                      </div>
                    </div>
                    <div className="transaction-amount">
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Admin/TeamLead Dashboard */}
      {!isOperator && (
        <div className="admin-dashboard">
          <p>Панель администратора / тимлида</p>
          <p>Здесь будет общая статистика команды</p>
        </div>
      )}

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
