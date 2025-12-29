import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  operatorService,
  OperatorBank,
  OperatorDrop,
  TransactionForOperator,
} from '../../services/operator.service';
import './OperatorDashboard.css';

const OperatorDashboard = () => {
  const { t } = useTranslation();
  const [banks, setBanks] = useState<OperatorBank[]>([]);
  const [drops, setDrops] = useState<OperatorDrop[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);
  const [selectedDropId, setSelectedDropId] = useState<number | null>(null);
  const [bankTransactions, setBankTransactions] = useState<TransactionForOperator[]>([]);
  const [dropTransactions, setDropTransactions] = useState<TransactionForOperator[]>([]);
  const [bankTransactionsTotal, setBankTransactionsTotal] = useState(0);
  const [dropTransactionsTotal, setDropTransactionsTotal] = useState(0);
  const [showFullBankHistory, setShowFullBankHistory] = useState(false);
  const [showFullDropHistory, setShowFullDropHistory] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [banksData, dropsData] = await Promise.all([
        operatorService.getMyBanks(),
        operatorService.getMyDrops(),
      ]);
      setBanks(banksData.banks);
      setDrops(dropsData.drops);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleBankClick = async (bankId: number) => {
    if (selectedBankId === bankId && !showFullBankHistory) {
      setSelectedBankId(null);
      setBankTransactions([]);
      return;
    }

    setLoading(true);
    setSelectedBankId(bankId);
    setShowFullBankHistory(false);

    try {
      const data = await operatorService.getBankTransactions(bankId, { limit: 5 });
      setBankTransactions(data.items);
      setBankTransactionsTotal(data.total);
    } catch (error) {
      console.error('Error fetching bank transactions:', error);
    } finally {
      setLoading(false);
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

  const loadFullBankHistory = async () => {
    if (!selectedBankId) return;

    setLoading(true);
    try {
      const data = await operatorService.getBankTransactions(selectedBankId, {
        limit: 100,
      });
      setBankTransactions(data.items);
      setShowFullBankHistory(true);
    } catch (error) {
      console.error('Error fetching full bank history:', error);
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
    <div className="operator-dashboard">
      <h1>Панель оператора</h1>

      {/* Секция банков */}
      <div className="section">
        <h2>Банки (по приоритету)</h2>
        <div className="banks-grid">
          {banks.map((bank) => (
            <div
              key={bank.id}
              className={`bank-card ${selectedBankId === bank.id ? 'selected' : ''}`}
              onClick={() => handleBankClick(bank.id)}
            >
              <div className="bank-header">
                <h3>{bank.name}</h3>
                <span className={`status-badge ${getStatusBadge(bank.status)}`}>
                  {translateStatus(bank.status)}
                </span>
              </div>

              <div className="bank-accounts">
                <p className="accounts-count">Счетов: {bank.accounts.length}</p>
                <div className="accounts-list">
                  {bank.accounts.slice(0, 3).map((account) => (
                    <div key={account.id} className="account-item">
                      <div className="account-info">
                        <span className="account-alias">{account.alias}</span>
                        <span className="account-priority">
                          Приоритет: {account.priority}
                        </span>
                      </div>
                      <div className="account-limits">
                        <span>
                          {formatCurrency(account.withdrawnAmount)} /{' '}
                          {formatCurrency(account.limitAmount)}
                        </span>
                      </div>
                      <span className={`status-badge ${getStatusBadge(account.status)}`}>
                        {translateStatus(account.status)}
                      </span>
                    </div>
                  ))}
                  {bank.accounts.length > 3 && (
                    <p className="more-accounts">
                      И еще {bank.accounts.length - 3} счетов...
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* История транзакций банка */}
        {selectedBankId && (
          <div className="transactions-history">
            <h3>История транзакций банка</h3>
            {loading ? (
              <p>Загрузка...</p>
            ) : (
              <>
                <div className="transactions-list">
                  {bankTransactions.length === 0 ? (
                    <p>Нет транзакций</p>
                  ) : (
                    bankTransactions.map((tx) => (
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
                          {tx.dropName && <span>Дроп: {tx.dropName}</span>}
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
                {bankTransactionsTotal > 5 && !showFullBankHistory && (
                  <button className="load-more-btn" onClick={loadFullBankHistory}>
                    Показать всю историю ({bankTransactionsTotal} транзакций)
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Секция дропов */}
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

export default OperatorDashboard;
