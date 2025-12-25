import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  RefreshCw, 
  Building, 
  Calendar, 
  Hash,
  Clock
} from 'lucide-react';
import { transactionsService } from '../../services/transactions.service';
import './Transactions.css';

export default function Transactions() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  // Fetch transactions
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['my-transactions', page, searchQuery],
    queryFn: () => transactionsService.getMy({ 
      page, 
      limit,
    }),
  });

  const transactions = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const formatTime = (date: string) => {
    return new Date(date).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value: number) => {
    return `ARS ${value.toLocaleString('es-AR')}`;
  };

  // Filter transactions by search
  const filteredTransactions = transactions.filter((transaction) => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    const bankName = transaction.bankAccount?.bank?.name?.toLowerCase() || '';
    const cbu = transaction.bankAccount?.cbu || '';
    const alias = transaction.bankAccount?.alias?.toLowerCase() || '';
    
    return (
      bankName.includes(searchLower) ||
      cbu.includes(searchLower) ||
      alias.includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="transactions-page">
        <div className="loading-state">
          <RefreshCw size={32} className="spin" />
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transactions-page">
      <div className="transactions-header">
        <div>
          <h1 className="transactions-title">Мои операции</h1>
          <p className="transactions-subtitle">История всех выполненных операций</p>
        </div>
      </div>

      <div className="transactions-filters">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Поиск по банку, CBU, Alias..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="transactions-stats">
          <span className="stat-item">
            <Hash size={16} />
            Всего операций: <strong>{total}</strong>
          </span>
        </div>

        <button className="btn-secondary" onClick={() => refetch()}>
          <RefreshCw size={18} />
          Обновить
        </button>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="empty-state">
          <Building size={48} />
          <p>Операции не найдены</p>
        </div>
      ) : (
        <>
          <div className="transactions-list">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="transaction-card">
                <div className="transaction-card-header">
                  <div className="bank-info">
                    <div className="bank-icon">
                      <Building size={20} />
                    </div>
                    <div>
                      <h3 className="bank-name">
                        {transaction.bankAccount?.bank?.name || 'Unknown Bank'}
                      </h3>
                      <div className="bank-details">
                        <span>CBU: ...{transaction.bankAccount?.cbu?.slice(-4)}</span>
                        <span>•</span>
                        <span>Alias: {transaction.bankAccount?.alias}</span>
                      </div>
                    </div>
                  </div>
                  <div className="transaction-amount">
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>

                <div className="transaction-card-body">
                  <div className="transaction-meta-grid">
                    <div className="meta-item">
                      <Calendar size={14} />
                      <span>{formatTime(transaction.createdAt)}</span>
                    </div>
                    {transaction.shift?.platform && (
                      <div className="meta-item">
                        <Clock size={14} />
                        <span>
                          Смена: {transaction.shift.platform.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {transaction.comment && (
                    <div className="transaction-comment">
                      <span className="comment-label">Комментарий:</span>
                      <span>{transaction.comment}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="btn-pagination"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Назад
              </button>
              <span className="pagination-info">
                Страница {page} из {totalPages}
              </span>
              <button 
                className="btn-pagination"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Вперёд →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
