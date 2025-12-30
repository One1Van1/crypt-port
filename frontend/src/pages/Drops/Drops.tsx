import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  operatorService,
  OperatorDrop,
  TransactionForOperator,
} from '../../services/operator.service';
import './Drops.css';

const Drops = () => {
  const { t } = useTranslation();
  const [drops, setDrops] = useState<OperatorDrop[]>([]);
  const [selectedDropId, setSelectedDropId] = useState<number | null>(null);
  const [dropTransactions, setDropTransactions] = useState<TransactionForOperator[]>([]);
  const [dropTransactionsTotal, setDropTransactionsTotal] = useState(0);
  const [showFullDropHistory, setShowFullDropHistory] = useState(false);
  const [loading, setLoading] = useState(false);

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
      const data = await operatorService.getDropTransactions(dropId, { limit: 5 });
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
      const data = await operatorService.getDropTransactions(selectedDropId, {
        limit: 100,
      });
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
            <h3>История транзакций дропа</h3>
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
