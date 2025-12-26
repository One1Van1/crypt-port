import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  RefreshCw, 
  Building, 
  Calendar, 
  Hash,
  Clock,
  Filter,
  X
} from 'lucide-react';
import { transactionsService } from '../../services/transactions.service';
import { shiftsService } from '../../services/shifts.service';
import { useAppStore } from '../../store/appStore';
import CustomSelect from '../../components/CustomSelect/CustomSelect';
import './Transactions.css';

export default function Transactions() {
  const { t, i18n } = useTranslation();
  const timeFormat = useAppStore((state) => state.timeFormat);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedShiftId, setSelectedShiftId] = useState<string>('');
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const limit = 10;

  // Fetch shifts for filter
  const { data: shiftsData } = useQuery({
    queryKey: ['my-shifts'],
    queryFn: () => shiftsService.getMyShifts(),
  });

  // Fetch banks for filter
  const { data: banksData } = useQuery({
    queryKey: ['my-banks'],
    queryFn: () => transactionsService.getMyBanks(),
  });

  const shifts = shiftsData?.items || [];
  const banks = banksData?.items || [];

  // Fetch transactions
  const { data, refetch } = useQuery({
    queryKey: ['my-transactions', page, selectedShiftId],
    queryFn: () => transactionsService.getMy({ 
      page, 
      limit,
      shiftId: selectedShiftId ? Number(selectedShiftId) : undefined,
    }),
  });

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedShiftId, selectedBankId, minAmount, maxAmount, searchQuery]);

  const transactions = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const formatTime = (date: string) => {
    return new Date(date).toLocaleString(i18n.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: timeFormat === '12h',
    });
  };

  const formatCurrency = (value: number) => {
    return `ARS ${value.toLocaleString('es-AR')}`;
  };

  // Filter transactions by search and filters
  const filteredTransactions = transactions.filter((transaction) => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const bankName = (transaction.bankName || transaction.bankAccount?.bank?.name || '').toLowerCase();
      const cbu = transaction.bankAccountCbu || transaction.bankAccount?.cbu || '';
      const alias = transaction.bankAccount?.alias?.toLowerCase() || '';
      
      if (!bankName.includes(searchLower) && 
          !cbu.includes(searchLower) && 
          !alias.includes(searchLower)) {
        return false;
      }
    }

    // Bank filter
    if (selectedBankId) {
      const bankName = transaction.bankName || transaction.bankAccount?.bank?.name || '';
      const selectedBank = banks.find(b => b.id === selectedBankId);
      
      if (!selectedBank || !bankName || bankName !== selectedBank.name) {
        return false;
      }
    }

    // Amount filter
    if (minAmount && transaction.amount < parseFloat(minAmount)) {
      return false;
    }
    if (maxAmount && transaction.amount > parseFloat(maxAmount)) {
      return false;
    }

    return true;
  });

  const clearFilters = () => {
    setSelectedShiftId('');
    setSelectedBankId('');
    setMinAmount('');
    setMaxAmount('');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedShiftId || selectedBankId || minAmount || maxAmount || searchQuery;

  return (
    <div className="transactions-page">
      <div className="transactions-header">
        <div>
          <h1 className="transactions-title">{t('transactions.title')}</h1>
          <p className="transactions-subtitle">{t('transactions.subtitle')}</p>
        </div>
      </div>

      <div className="transactions-filters">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder={t('transactions.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button 
          className={`btn-filter ${showFilters ? 'active' : ''}`} 
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} />
          Фильтры
          {hasActiveFilters && <span className="filter-badge">{[
            selectedShiftId, selectedBankId, minAmount, maxAmount, searchQuery
          ].filter(Boolean).length}</span>}
        </button>

        {hasActiveFilters && (
          <button className="btn-clear-filters" onClick={clearFilters}>
            <X size={18} />
            Очистить
          </button>
        )}

        <div className="transactions-stats">
          <span className="stat-item">
            <Hash size={16} />
            {t('transactions.totalOperations')}: <strong>{filteredTransactions.length}</strong>
          </span>
        </div>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Смена</label>
            <CustomSelect
              value={selectedShiftId}
              onChange={setSelectedShiftId}
              options={[
                { value: '', label: 'Все смены' },
                ...shifts.map((shift) => ({
                  value: String(shift.id),
                  label: `${shift.platform?.name || shift.platformName} - ${new Date(shift.startTime).toLocaleDateString(i18n.language)}`
                }))
              ]}
              placeholder="Все смены"
            />
          </div>

          <div className="filter-group">
            <label>Банк</label>
            <CustomSelect
              value={selectedBankId}
              onChange={setSelectedBankId}
              options={[
                { value: '', label: 'Все банки' },
                ...banks.map((bank) => ({
                  value: bank.id,
                  label: bank.name
                }))
              ]}
              placeholder="Все банки"
            />
          </div>

          <div className="filter-group">
            <label>Сумма от</label>
            <input
              type="number"
              placeholder="0"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Сумма до</label>
            <input
              type="number"
              placeholder="∞"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              className="filter-input"
            />
          </div>
        </div>
      )}

      {filteredTransactions.length === 0 ? (
        <div className="empty-state">
          <Building size={48} />
          <p>{t('transactions.noTransactions')}</p>
        </div>
      ) : (
        <>
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
                        {transaction.bankName || transaction.bankAccount?.bank?.name || t('common.unknownBank')}
                      </h3>
                      <div className="bank-details">
                        <span>CBU: ...{(transaction.bankAccountCbu || transaction.bankAccount?.cbu || '').slice(-4)}</span>
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
        </>
      )}
    </div>
  );
}
