import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  operatorService,
  OperatorDrop,
  TransactionForOperator,
  UserFilterType,
  DropTransactionsParams,
} from '../../services/operator.service';
import { useAuthStore } from '../../store/authStore';
import CustomSelect from '../../components/CustomSelect/CustomSelect';
import CustomDatePicker from '../../components/CustomDatePicker/CustomDatePicker';
import './Drops.css';

const Drops = () => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [drops, setDrops] = useState<OperatorDrop[]>([]);
  const [selectedDropId, setSelectedDropId] = useState<number | null>(null);
  const [dropTransactions, setDropTransactions] = useState<TransactionForOperator[]>([]);
  const [dropTransactionsTotal, setDropTransactionsTotal] = useState(0);
  const [showFullDropHistory, setShowFullDropHistory] = useState(false);
  const [loading, setLoading] = useState(false);

  // Фильтры (только для admin/teamlead)
  const [filters, setFilters] = useState<DropTransactionsParams>({
    limit: 5,
    userFilter: UserFilterType.ALL,
  });
  const [showFilters, setShowFilters] = useState(false);

  const isAdminOrTeamlead = user?.role === 'admin' || user?.role === 'teamlead';

  useEffect(() => {
    fetchDrops();
  }, []);

  const fetchDrops = async () => {
    try {
      const data = await operatorService.getMyDrops();
      setDrops(data.drops);
    } catch (error) {
      console.error('Error fetching drops:', error);
    }
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
      const params: DropTransactionsParams = isAdminOrTeamlead
        ? { ...filters, limit: 5 }
        : { limit: 5 };
      const data = await operatorService.getDropTransactions(dropId, params);
      setDropTransactions(data.items);
      setDropTransactionsTotal(data.total);
    } catch (error) {
      console.error('Error fetching drop transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFullDropHistory = async () => {
    if (!selectedDropId) return;

    setLoading(true);
    try {
      const params: DropTransactionsParams = isAdminOrTeamlead
        ? { ...filters, limit: 100 }
        : { limit: 100 };
      const data = await operatorService.getDropTransactions(selectedDropId, params);
      setDropTransactions(data.items);
      setShowFullDropHistory(true);
    } catch (error) {
      console.error('Error fetching full drop history:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    if (selectedDropId === null) return;
    setLoading(true);
    try {
      const params: DropTransactionsParams = {
        ...filters,
        limit: showFullDropHistory ? 100 : 5,
      };
      const data = await operatorService.getDropTransactions(selectedDropId, params);
      setDropTransactions(data.items);
      setDropTransactionsTotal(data.total);
    } catch (error) {
      console.error('Failed to apply filters:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    const newFilters = {
      limit: showFullDropHistory ? 100 : 5,
      userFilter: UserFilterType.ALL,
    };
    setFilters(newFilters);
    // Автоматически применяем после сброса
    if (selectedDropId) {
      setLoading(true);
      operatorService
        .getDropTransactions(selectedDropId, newFilters)
        .then((data) => {
          setDropTransactions(data.items);
          setDropTransactionsTotal(data.total);
        })
        .catch((error) => console.error('Failed to reset filters:', error))
        .finally(() => setLoading(false));
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
        <h2>Дропы</h2>
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
        {selectedDropId && (
          <div className="transactions-history">
            <div className="history-header">
              <h3>История транзакций дропа</h3>
              {isAdminOrTeamlead && (
                <button
                  className="toggle-filters-btn"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
                </button>
              )}
            </div>

            {/* Фильтры для admin/teamlead */}
            {isAdminOrTeamlead && showFilters && (
              <div className="filters-section">
                <div className="filters-row">
                  <div className="filter-group">
                    <label>Показать:</label>
                    <CustomSelect
                      value={filters.userFilter || UserFilterType.ALL}
                      onChange={(value) =>
                        setFilters({ ...filters, userFilter: value as UserFilterType })
                      }
                      options={[
                        { value: UserFilterType.ALL, label: 'Все' },
                        { value: UserFilterType.MY, label: 'Мои' },
                        { value: UserFilterType.OTHERS, label: 'Чужие' },
                      ]}
                      placeholder="Выберите..."
                    />
                  </div>

                  <div className="filter-group">
                    <label>Роль оператора:</label>
                    <CustomSelect
                      value={filters.userRole || ''}
                      onChange={(value) => setFilters({ ...filters, userRole: value || undefined })}
                      options={[
                        { value: '', label: 'Все роли' },
                        { value: 'operator', label: 'Оператор' },
                        { value: 'teamlead', label: 'Тимлид' },
                        { value: 'admin', label: 'Админ' },
                      ]}
                      placeholder="Все роли"
                    />
                  </div>

                  <div className="filter-group">
                    <label>Имя оператора:</label>
                    <input
                      type="text"
                      placeholder="Введите имя..."
                      value={filters.username || ''}
                      onChange={(e) => setFilters({ ...filters, username: e.target.value || undefined })}
                    />
                  </div>

                  <div className="filter-group">
                    <label>Название банка:</label>
                    <input
                      type="text"
                      placeholder="Название банка..."
                      value={filters.bankName || ''}
                      onChange={(e) =>
                        setFilters({ ...filters, bankName: e.target.value || undefined })
                      }
                    />
                  </div>

                  <div className="filter-group">
                    <label>Статус:</label>
                    <CustomSelect
                      value={filters.status || ''}
                      onChange={(value) => setFilters({ ...filters, status: value || undefined })}
                      options={[
                        { value: '', label: 'Все' },
                        { value: 'pending', label: 'В ожидании' },
                        { value: 'paid', label: 'Оплачено' },
                        { value: 'expired', label: 'Истек' },
                        { value: 'cancelled', label: 'Отменено' },
                      ]}
                      placeholder="Все"
                    />
                  </div>
                </div>

                <div className="filters-row">
                  <div className="filter-group">
                    <label>Дата от:</label>
                    <CustomDatePicker
                      value={filters.startDate || ''}
                      onChange={(value) => setFilters({ ...filters, startDate: value || undefined })}
                      placeholder="дд.мм.гггг"
                    />
                  </div>

                  <div className="filter-group">
                    <label>Дата до:</label>
                    <CustomDatePicker
                      value={filters.endDate || ''}
                      onChange={(value) => setFilters({ ...filters, endDate: value || undefined })}
                      placeholder="дд.мм.гггг"
                    />
                  </div>

                  <div className="filter-group">
                    <label>Сумма от:</label>
                    <input
                      type="number"
                      placeholder="Мин..."
                      value={filters.minAmount || ''}
                      onChange={(e) =>
                        setFilters({ ...filters, minAmount: e.target.value ? +e.target.value : undefined })
                      }
                    />
                  </div>

                  <div className="filter-group">
                    <label>Сумма до:</label>
                    <input
                      type="number"
                      placeholder="Макс..."
                      value={filters.maxAmount || ''}
                      onChange={(e) =>
                        setFilters({ ...filters, maxAmount: e.target.value ? +e.target.value : undefined })
                      }
                    />
                  </div>
                </div>

                <div className="filters-actions">
                  <button className="apply-filters-btn" onClick={applyFilters}>
                    Применить фильтры
                  </button>
                  <button className="reset-filters-btn" onClick={resetFilters}>
                    Сбросить
                  </button>
                </div>
              </div>
            )}

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
          </div>
        )}
      </div>
    </div>
  );
};

export default Drops;
