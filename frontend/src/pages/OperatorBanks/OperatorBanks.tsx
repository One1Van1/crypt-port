import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  operatorService,
  OperatorBank,
  TransactionForOperator,
} from '../../services/operator.service';
import './OperatorBanks.css';

const OperatorBanks = () => {
  const { t } = useTranslation();
  const [banks, setBanks] = useState<OperatorBank[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);
  const [bankTransactions, setBankTransactions] = useState<TransactionForOperator[]>([]);
  const [bankTransactionsTotal, setBankTransactionsTotal] = useState(0);
  const [showFullBankHistory, setShowFullBankHistory] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      const data = await operatorService.getMyBanks();
      setBanks(data.banks);
    } catch (error) {
      console.error('Error fetching banks:', error);
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
    <div className="operator-banks">
      <h1>Банки</h1>

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
    </div>
  );
};

export default OperatorBanks;
