import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useLocation } from 'react-router-dom';
import { 
  Search, 
  Building, 
  Calendar, 
  Hash,
  Filter,
  X
} from 'lucide-react';
import { transactionsService } from '../../services/transactions.service';
import { shiftsService } from '../../services/shifts.service';
import { platformsService } from '../../services/platforms.service';
import { usersService } from '../../services/users.service';
import { banksService } from '../../services/banks.service';
import dropNeoBanksService from '../../services/drop-neo-banks.service';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/user.types';
import CustomSelect from '../../components/CustomSelect/CustomSelect';
import DatePicker from '../../components/DatePicker/DatePicker';
import './Transactions.css';

export default function Transactions() {
  const { t, i18n } = useTranslation();
  const timeFormat = useAppStore((state) => state.timeFormat);
  const user = useAuthStore((state) => state.user);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [viewMode, setViewMode] = useState<'my' | 'all'>('my');
  const [highlightTransactionId, setHighlightTransactionId] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [transactionIdFilter, setTransactionIdFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedShiftId, setSelectedShiftId] = useState<string>('');
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedDropNeoBankId, setSelectedDropNeoBankId] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const limit = 10;

  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const isTeamLeadOrAdmin = user?.role === UserRole.TEAMLEAD || user?.role === UserRole.ADMIN;

  // Auto-highlight a transaction from navigation state
  useEffect(() => {
    const state = location.state as
      | { highlightTransactionId?: unknown; viewMode?: unknown; source?: unknown }
      | null;
    const maybeId = state?.highlightTransactionId;
    const isFromBanks = state?.source === 'banks';
    const id =
      typeof maybeId === 'string'
        ? maybeId.trim()
        : typeof maybeId === 'number' && Number.isFinite(maybeId)
          ? String(maybeId)
          : '';

    if (id) {
      if (isTeamLeadOrAdmin) {
        setViewMode('all');
      }
      setHighlightTransactionId(id);
      setTransactionIdFilter(id);
      setShowFilters(true);
      setPage(1);
      setSelectedShiftId('');
      setSelectedBankId('');
      setSelectedPlatformId('');
      setSelectedUserId('');
      setSelectedDropNeoBankId('');
      setDateFrom(null);
      setDateTo(null);
      setMinAmount('');
      setMaxAmount('');

      const idNum = Number(id);
      if (isTeamLeadOrAdmin && isFromBanks && Number.isFinite(idNum)) {
        (async () => {
          try {
            const tx = await transactionsService.getByIdV2(idNum);

            const createdAt = new Date(tx.createdAt);
            const from = new Date(createdAt);
            from.setHours(0, 0, 0, 0);
            const to = new Date(from);
            to.setDate(to.getDate() + 1);

            setDateFrom(from);
            setDateTo(to);
            setSelectedUserId(String(tx.user?.id ?? ''));
            setSelectedBankId(String(tx.bank?.id ?? ''));
            setSelectedDropNeoBankId(tx.dropNeoBank?.id ? String(tx.dropNeoBank.id) : '');
            setMinAmount(String(tx.amount));
            setMaxAmount(String(tx.amount));
          } catch {
            try {
              const dto = await transactionsService.getByIdAdmin(idNum);

              const createdAt = new Date(dto.createdAt);
              const from = new Date(createdAt);
              from.setHours(0, 0, 0, 0);
              const to = new Date(from);
              to.setDate(to.getDate() + 1);

              setDateFrom(from);
              setDateTo(to);
              setSelectedUserId(dto.operatorId ? String(dto.operatorId) : '');
              setSelectedBankId(dto.bankId ? String(dto.bankId) : '');
              setMinAmount(String(dto.amount));
              setMaxAmount(String(dto.amount));
            } catch {
              // ignore; keep empty filters
            }
          }
        })();
      }

      // Clear state so it doesn't re-apply on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, isTeamLeadOrAdmin]);

  // Auto-apply date filter from location state
  useEffect(() => {
    const state = location.state as { filterDate?: string } | null;
    if (state?.filterDate) {
      // Parse date as local date to avoid timezone issues
      const [year, month, day] = state.filterDate.split('-').map(Number);
      const start = new Date(year, month - 1, day, 0, 0, 0, 0);
      const end = new Date(year, month - 1, day, 0, 0, 0, 0);
      end.setDate(end.getDate() + 1);
      setDateFrom(start);
      setDateTo(end);
      setShowFilters(true);
      setViewMode('all');
      // Clear location state to prevent reapplying on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Auto-apply userId filter from URL params
  useEffect(() => {
    const userIdParam = searchParams.get('userId');
    if (userIdParam && isTeamLeadOrAdmin) {
      setViewMode('all');
      setSelectedUserId(userIdParam);
    }
  }, [searchParams, isTeamLeadOrAdmin]);

  // Fetch shifts for filter
  const { data: shiftsData } = useQuery({
    queryKey: ['my-shifts'],
    queryFn: () => shiftsService.getMyShifts(),
  });

  // Fetch banks for filter
  const { data: banksData } = useQuery({
    queryKey: ['banks'],
    queryFn: () => banksService.getAll(),
  });

  // Fetch platforms for filter
  const { data: platformsData } = useQuery({
    queryKey: ['platforms'],
    queryFn: () => platformsService.getAll(),
  });

  // Fetch users for filter (only for teamlead and admin)
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.getAll(),
    enabled: isTeamLeadOrAdmin,
  });

  // Fetch neo-banks for filter
  const { data: neoBanksData } = useQuery({
    queryKey: ['neo-banks'],
    queryFn: () => dropNeoBanksService.getAll(),
  });

  const shifts = shiftsData?.items || [];
  const banks = banksData?.items || [];
  const platforms = platformsData?.items || [];
  const users = usersData?.items || [];
  const neoBanks = neoBanksData?.items || [];

  // Fetch MY transactions
  const { data: myTransactionsData } = useQuery({
    queryKey: ['my-transactions-view', page, selectedShiftId],
    queryFn: () => transactionsService.getMyTransactions({ 
      shiftId: selectedShiftId || undefined,
    }),
    enabled: viewMode === 'my',
  });

  // Fetch ALL transactions (для админа/тимлида)
  const { data: allTransactionsData } = useQuery({
    queryKey: [
      'all-transactions',
      page,
      selectedUserId,
      selectedPlatformId,
      selectedBankId,
      selectedDropNeoBankId,
      searchQuery,
      transactionIdFilter,
      dateFrom,
      dateTo,
      minAmount,
      maxAmount,
    ],
    queryFn: () => {
      const txIdTrimmed = transactionIdFilter.trim();
      const txIdNum = /^[0-9]+$/.test(txIdTrimmed) ? Number(txIdTrimmed) : NaN;

      const matchesOtherFilters = (tx: any): boolean => {
        if (selectedUserId && String(tx.user?.id) !== selectedUserId) return false;
        if (selectedPlatformId && String(tx.platform?.id) !== selectedPlatformId) return false;
        if (selectedBankId && String(tx.bank?.id) !== selectedBankId) return false;
        if (selectedDropNeoBankId && String(tx.dropNeoBank?.id) !== selectedDropNeoBankId) return false;

        const amount = Number(tx.amount);
        if (minAmount && Number.isFinite(Number(minAmount)) && amount < Number(minAmount)) return false;
        if (maxAmount && Number.isFinite(Number(maxAmount)) && amount > Number(maxAmount)) return false;

        const createdAt = new Date(tx.createdAt).getTime();
        if (dateFrom && createdAt < dateFrom.getTime()) return false;
        if (dateTo && createdAt >= dateTo.getTime()) return false;

        return true;
      };

      if (txIdTrimmed && Number.isFinite(txIdNum)) {
        return (async () => {
          try {
            const tx = await transactionsService.getByIdV2(txIdNum);
            return matchesOtherFilters(tx) ? { items: [tx], total: 1 } : { items: [], total: 0 };
          } catch {
            return { items: [], total: 0 };
          }
        })();
      }

      let startDate: string | undefined;
      let endDate: string | undefined;

      if (dateFrom) {
        const year = dateFrom.getFullYear();
        const month = String(dateFrom.getMonth() + 1).padStart(2, '0');
        const day = String(dateFrom.getDate()).padStart(2, '0');
        startDate = `${year}-${month}-${day}T00:00:00.000Z`;
      }

      if (dateTo) {
        const year = dateTo.getFullYear();
        const month = String(dateTo.getMonth() + 1).padStart(2, '0');
        const day = String(dateTo.getDate()).padStart(2, '0');
        endDate = `${year}-${month}-${day}T00:00:00.000Z`;
      }
      
      const params = {
        page,
        limit,
        userId: selectedUserId ? Number(selectedUserId) : undefined,
        platformId: selectedPlatformId ? Number(selectedPlatformId) : undefined,
        bankId: selectedBankId ? Number(selectedBankId) : undefined,
        dropNeoBankId: selectedDropNeoBankId ? Number(selectedDropNeoBankId) : undefined,
        search: searchQuery || undefined,
        startDate,
        endDate,
        minAmount: minAmount ? parseFloat(minAmount) : undefined,
        maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
      };

      const isNumericSearch = typeof searchQuery === 'string' && /^[0-9]+$/.test(searchQuery.trim());
      return isNumericSearch ? transactionsService.getAllV2(params) : transactionsService.getAll(params);
    },
    enabled: isTeamLeadOrAdmin && viewMode === 'all',
  });

  const data = viewMode === 'my' ? myTransactionsData : allTransactionsData;

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [
    selectedUserId,
    selectedPlatformId,
    selectedBankId,
    selectedDropNeoBankId,
    dateFrom,
    dateTo,
    minAmount,
    maxAmount,
    searchQuery,
    transactionIdFilter,
  ]);

  const transactions = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    if (!highlightTransactionId) return;
    const el = cardRefs.current.get(highlightTransactionId);
    if (!el) return;
    setHighlightedId(highlightTransactionId);
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightTransactionId(null);
  }, [highlightTransactionId, transactions]);

  useEffect(() => {
    if (!highlightedId) return;
    const timeoutId = window.setTimeout(() => setHighlightedId(null), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [highlightedId]);

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

  const clearFilters = () => {
    setSelectedShiftId('');
    setSelectedBankId('');
    setSelectedPlatformId('');
    setSelectedUserId('');
    setSelectedDropNeoBankId('');
    setDateFrom(null);
    setDateTo(null);
    setMinAmount('');
    setMaxAmount('');
    setSearchQuery('');
    setTransactionIdFilter('');
  };

  const hasActiveFilters = 
    selectedShiftId || 
    selectedBankId || 
    selectedPlatformId || 
    selectedUserId || 
    selectedDropNeoBankId || 
    dateFrom || 
    dateTo || 
    minAmount || 
    maxAmount || 
    searchQuery ||
    transactionIdFilter;

  return (
    <div className="transactions-page">
      <div className="transactions-header">
        <div>
          <h1 className="transactions-title">{t('transactions.title')}</h1>
          <p className="transactions-subtitle">{t('transactions.subtitle')}</p>
        </div>
      </div>

      {/* View Mode Switcher для тимлида и админа */}
      {isTeamLeadOrAdmin && (
        <div className="view-mode-switcher">
          <button
            className={`view-mode-btn ${viewMode === 'my' ? 'active' : ''}`}
            onClick={() => setViewMode('my')}
          >
            {t('transactions.myTransactions')}
          </button>
          <button
            className={`view-mode-btn ${viewMode === 'all' ? 'active' : ''}`}
            onClick={() => setViewMode('all')}
          >
            {t('transactions.operatorsTransactions')}
          </button>
        </div>
      )}

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
            selectedShiftId, 
            selectedBankId, 
            selectedPlatformId, 
            selectedUserId, 
            selectedDropNeoBankId, 
            dateFrom, 
            dateTo, 
            minAmount, 
            maxAmount, 
            searchQuery,
            transactionIdFilter
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
            {t('transactions.totalOperations')}: <strong>{total}</strong>
          </span>
        </div>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>ID транзакции</label>
            <input
              type="number"
              placeholder="ID"
              value={transactionIdFilter}
              onChange={(e) => setTransactionIdFilter(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Площадка</label>
            <CustomSelect
              value={selectedPlatformId}
              onChange={setSelectedPlatformId}
              options={[
                { value: '', label: 'Все площадки' },
                ...platforms.map((platform) => ({
                  value: String(platform.id),
                  label: platform.name
                }))
              ]}
              placeholder="Все площадки"
            />
          </div>

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

          {viewMode === 'all' && isTeamLeadOrAdmin && (
            <div className="filter-group">
              <label>Сотрудник</label>
              <CustomSelect
                value={selectedUserId}
                onChange={setSelectedUserId}
                options={[
                  { value: '', label: 'Все сотрудники' },
                  ...users.map((user) => ({
                    value: String(user.id),
                    label: `${user.username} (${user.email})`
                  }))
                ]}
                placeholder="Все сотрудники"
              />
            </div>
          )}

          <div className="filter-group">
            <label>Физ. банк</label>
            <CustomSelect
              value={selectedBankId}
              onChange={setSelectedBankId}
              options={[
                { value: '', label: 'Все банки' },
                ...banks.map((bank) => ({
                  value: String(bank.id),
                  label: bank.name
                }))
              ]}
              placeholder="Все банки"
            />
          </div>

          <div className="filter-group">
            <label>Банк вывода</label>
            <CustomSelect
              value={selectedDropNeoBankId}
              onChange={setSelectedDropNeoBankId}
              options={[
                { value: '', label: 'Все банки вывода' },
                ...neoBanks.map((neoBank) => ({
                  value: String(neoBank.id),
                  label: `${neoBank.provider} - ${neoBank.accountId}`
                }))
              ]}
              placeholder="Все банки вывода"
            />
          </div>

          <div className="filter-group">
            <label>Дата от</label>
            <DatePicker
              selected={dateFrom}
              onChange={(date) => {
                setDateFrom(date);
              }}
              placeholder="Выберите дату"
              maxDate={dateTo || undefined}
            />
          </div>

          <div className="filter-group">
            <label>Дата до</label>
            <DatePicker
              selected={dateTo}
              onChange={(date) => {
                setDateTo(date);
              }}
              placeholder="Выберите дату"
              minDate={dateFrom || undefined}
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

      {transactions.length === 0 ? (
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
            {transactions.map((transaction: any) => {
              const txId = String(transaction.id);
              return (
              <div
                key={txId}
                ref={(el) => {
                  if (el) {
                    cardRefs.current.set(txId, el);
                  } else {
                    cardRefs.current.delete(txId);
                  }
                }}
                className={`transaction-card ${highlightedId === txId ? 'transaction-highlight' : ''}`}
              >
                <div className="transaction-card-header">
                  <div className="bank-icon">
                    <Building size={20} />
                  </div>
                  <div className="bank-content">
                    <h3 className="bank-name">
                      {t('transactions.physicalBank')} {transaction.bank?.name || t('common.unknownBank')}
                    </h3>
                    <div className="bank-details">
                      <span>CBU: ...{(transaction.bankAccount?.cbu || '').slice(-4)}</span>
                    </div>
                    {transaction.dropNeoBank && (
                      <div className="bank-details">
                        <span>{t('transactions.withdrawalBank')} {transaction.dropNeoBank.provider} - {transaction.dropNeoBank.accountId}</span>
                      </div>
                    )}
                    {transaction.user && (
                      <div className="operator-info">
                        <span className="operator-label">{t('transactions.employee')}</span>
                        <span className="operator-name">
                          {transaction.user.username}
                        </span>
                      </div>
                    )}
                    {transaction.platform && (
                      <div className="platform-info">
                        <span className="platform-label">{t('transactions.platform')}</span>
                        <span className="platform-name"> {transaction.platform.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="transaction-card-body">
                  <div className="transaction-meta-grid">
                    <div className="meta-item">
                      <Calendar size={14} />
                      <span>{formatTime(transaction.createdAt)}</span>
                    </div>
                    <div className="transaction-amount">
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        </>
      )}
    </div>
  );
}
