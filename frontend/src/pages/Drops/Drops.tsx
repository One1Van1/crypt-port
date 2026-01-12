import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  operatorService,
  TransactionForOperator,
  DropTransactionsParams,
} from '../../services/operator.service';
import { useAuthStore } from '../../store/authStore';
import { dropsService } from '../../services/drops.service';
import './Drops.css';

const Drops = () => {
  type DropsListItem = {
    id: number;
    name: string;
    comment: string | null;
    status: string;
    accountsCount: number;
    banks: { id: number; name: string; code: string | null }[];
  };

  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);

  const [drops, setDrops] = useState<DropsListItem[]>([]);
  const [selectedDropId, setSelectedDropId] = useState<number | null>(null);
  const [dropTransactions, setDropTransactions] = useState<TransactionForOperator[]>([]);
  const [dropTransactionsTotal, setDropTransactionsTotal] = useState(0);
  const [showFullDropHistory, setShowFullDropHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createComment, setCreateComment] = useState('');
  const [creating, setCreating] = useState(false);

  const createNameInputRef = useRef<HTMLInputElement | null>(null);

  const isAdminOrTeamlead = user?.role === 'admin' || user?.role === 'teamlead';

  useEffect(() => {
    fetchDrops();
  }, []);

  useEffect(() => {
    if (!isCreateModalOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCreateModalOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isCreateModalOpen]);

  useEffect(() => {
    if (!isCreateModalOpen) return;

    setTimeout(() => {
      createNameInputRef.current?.focus();
    }, 0);
  }, [isCreateModalOpen]);

  const fetchDrops = async () => {
    try {
      const data = await dropsService.getAll();

      const mapped: DropsListItem[] = data.items.map((drop: any) => ({
        id: Number(drop.id),
        name: drop.name,
        comment: drop.comment ?? null,
        status: drop.status,
        accountsCount: 0,
        banks: [],
      }));

      setDrops(mapped);
    } catch (error) {
      console.error('Error fetching drops:', error);
    }
  };

  const getErrorMessage = (error: unknown, fallback: string) => {
    const maybeAxios = error as {
      response?: { data?: { message?: string | string[] } };
      message?: string;
    };

    const apiMessage = maybeAxios?.response?.data?.message;
    if (Array.isArray(apiMessage)) return apiMessage.join(', ');
    if (typeof apiMessage === 'string' && apiMessage.trim()) return apiMessage;
    if (typeof maybeAxios?.message === 'string' && maybeAxios.message.trim()) return maybeAxios.message;
    return fallback;
  };

  const handleDropClick = async (dropId: number) => {
    if (selectedDropId === dropId && !showFullDropHistory) {
      setSelectedDropId(null);
      setDropTransactions([]);
      return;
    }

    setLoading(true);
    setSelectedDropId(dropId);
    setShowFullDropHistory(false);

    try {
      const params: DropTransactionsParams = { limit: 5 };
      const data = await operatorService.getDropTransactions(dropId, params);
      setDropTransactions(data.items);
      setDropTransactionsTotal(data.total);
    } catch (error) {
      console.error('Error fetching drop transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDrop = async () => {
    const name = createName.trim();
    const comment = createComment.trim();

    if (!name) {
      toast.error('Введите название дропа');
      createNameInputRef.current?.focus();
      return;
    }

    setCreating(true);
    try {
      await dropsService.create({
        name,
        ...(comment ? { comment } : {}),
      });

      setCreateName('');
      setCreateComment('');

      // Обновляем список дропов, чтобы сразу отобразить
      // созданный дроп из актуальных данных бэкенда.
      await fetchDrops();

      toast.success('Дроп создан');
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating drop:', error);
      toast.error(getErrorMessage(error, 'Не удалось создать дроп'));
    } finally {
      setCreating(false);
    }
  };

  const loadFullDropHistory = async () => {
    if (!selectedDropId) return;

    setLoading(true);
    try {
      const params: DropTransactionsParams = { limit: 100 };
      const data = await operatorService.getDropTransactions(selectedDropId, params);
      setDropTransactions(data.items);
      setShowFullDropHistory(true);
    } catch (error) {
      console.error('Error fetching full drop history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: string } = {
      active: 'status-active',
      inactive: 'status-inactive',
      frozen: 'status-frozen',
      working: 'status-working',
      idle: 'status-idle',
      blocked: 'status-blocked',
      pending: 'status-pending',
      completed: 'status-completed',
      failed: 'status-failed',
      cancelled: 'status-cancelled',
    };
    return statusMap[status] || 'status-default';
  };

  const translateStatus = (status: string) => {
    return t(`statuses.${status}`, status);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('ru-RU');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="operator-drops">
      <h1>Дропы</h1>

      <div className="section">
        <div className="drops-section-header">
          <h2>Дропы</h2>
          {isAdminOrTeamlead && (
            <button
              className="drops-create-btn"
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Создать дроп
            </button>
          )}
        </div>

        {isAdminOrTeamlead && isCreateModalOpen && (
          <div
            className="modal-overlay"
            role="dialog"
            aria-modal="true"
            onClick={() => setIsCreateModalOpen(false)}
          >
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Создать дроп</h3>
              </div>

              <div className="modal-body">
                <label className="modal-label">
                  Название
                  <input
                    className="modal-input"
                    placeholder="Введите название дропа"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    ref={createNameInputRef}
                  />
                </label>

                <label className="modal-label">
                  Комментарий
                  <input
                    className="modal-input"
                    placeholder="Опционально: комментарий к дропу"
                    value={createComment}
                    onChange={(e) => setCreateComment(e.target.value)}
                  />
                </label>
              </div>

              <div className="modal-footer">
                <button
                  className="modal-btn"
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={creating}
                >
                  Отмена
                </button>
                <button
                  className="load-more-btn modal-primary-btn"
                  type="button"
                  onClick={handleCreateDrop}
                  disabled={creating}
                >
                  {creating ? 'Создаем…' : 'Создать'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="content-wrapper">
          <div className="drops-grid">
            {drops.map((drop) => (
              <div
                key={drop.id}
                className={`drop-card ${selectedDropId === drop.id ? 'selected' : ''}`}
                onClick={() => handleDropClick(drop.id)}
              >
                <div className="drop-header">
                  <h3>{drop.name}</h3>
                  <span className={`status-badge ${getStatusBadge(drop.status)}`}>
                    {translateStatus(drop.status)}
                  </span>
                </div>

                {drop.comment && <p className="drop-comment">{drop.comment}</p>}

                <div className="drop-info">
                  <p>Счетов: {drop.accountsCount}</p>
                  <div className="drop-banks">
                    <p className="drop-banks-title">Банки:</p>
                    {drop.banks.map((bank) => (
                      <span key={bank.id} className="bank-tag">
                        {bank.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* История транзакций дропа */}
          <div className="transactions-history">
            <h3>История транзакций дропа</h3>

            {!selectedDropId ? (
              <div className="history-placeholder">
                <p>Выберите дроп для просмотра истории</p>
              </div>
            ) : (
              <>
                {loading ? (
                  <p>Загрузка...</p>
                ) : (
                  <>
                    <div className="transactions-list">
                      {dropTransactions.length === 0 ? (
                        <p>Нет транзакций</p>
                      ) : (
                        dropTransactions.map((tx) => (
                          <div key={tx.id} className="transaction-item">
                            <div className="transaction-main">
                              <span className="transaction-amount">
                                {formatCurrency(tx.amount)}
                              </span>
                              {tx.amountUSDT && (
                                <span className="transaction-usdt">
                                  ${tx.amountUSDT.toFixed(2)}
                                </span>
                              )}
                              <span className={`status-badge ${getStatusBadge(tx.status)}`}>
                                {translateStatus(tx.status)}
                              </span>
                            </div>
                            <div className="transaction-details">
                              <span>
                                {tx.bankAccountAlias} ({tx.bankAccountCbu})
                              </span>
                              {tx.bankName && <span>Банк: {tx.bankName}</span>}
                              {isAdminOrTeamlead && tx.userName && (
                                <span className="transaction-user">
                                  Оператор: {tx.userName} ({tx.userRole})
                                </span>
                              )}
                            </div>
                            <div className="transaction-meta">
                              <span>{formatDate(tx.createdAt)}</span>
                              {tx.comment && (
                                <span className="transaction-comment">{tx.comment}</span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {dropTransactionsTotal > 5 && !showFullDropHistory && (
                      <button className="load-more-btn" onClick={loadFullDropHistory}>
                        Показать всю историю ({dropTransactionsTotal} транзакций)
                      </button>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Drops;
