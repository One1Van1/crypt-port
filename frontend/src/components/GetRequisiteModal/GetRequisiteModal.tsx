import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { 
  Copy, 
  Check, 
  Building, 
  CreditCard, 
  Tag, 
  TrendingUp, 
  AlertTriangle,
  Loader,
  CheckCircle,
  Wallet
} from 'lucide-react';
import {
  bankAccountsService,
  BankAccount,
  GetRequisiteV2NeoBank,
} from '../../services/bank-accounts.service';
import { transactionsService, CreateTransactionRequest } from '../../services/transactions.service';
import { getProviderBadgeClass } from '../../utils/providerBadgeClass';
import './GetRequisiteModal.css';

interface GetRequisiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Step = 'loading' | 'select-source' | 'amount' | 'success';

export default function GetRequisiteModal({ isOpen, onClose }: GetRequisiteModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>('loading');
  const [selectedNeoBank, setSelectedNeoBank] = useState<number | null>(null);
  const [requisite, setRequisite] = useState<BankAccount | null>(null);
  const [submittedRequisite, setSubmittedRequisite] = useState<BankAccount | null>(null);
  const [submittedAmount, setSubmittedAmount] = useState<number | null>(null);
  const [neoBanks, setNeoBanks] = useState<GetRequisiteV2NeoBank[]>([]);
  const [neoBankProviderFilter, setNeoBankProviderFilter] = useState<string>('all');
  const [neoBankDropFilter, setNeoBankDropFilter] = useState<string>('all');
  const [neoBankAccountFilter, setNeoBankAccountFilter] = useState<string>('all');
  const [neoBanksUi, setNeoBanksUi] = useState<GetRequisiteV2NeoBank[]>([]);
  const [requisiteReservationToken, setRequisiteReservationToken] = useState<string>('');
  const [reservingRequisite, setReservingRequisite] = useState<boolean>(false);
  const [waitingForRequisiteRelease, setWaitingForRequisiteRelease] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [copiedField, setCopiedField] = useState<'cbu' | 'alias' | null>(null);
  const [error, setError] = useState<string>('');

  const formatNeoBankLimit = (value?: number | null) => {
    return value === null || value === undefined ? '—' : formatCurrency(value);
  };

  // Блокировка скролла body когда модалка открыта
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Блокировка событий клавиатуры на заднем фоне
  useEffect(() => {
    if (!isOpen) return;

    // Убираем фокус с кнопки, которая открыла модальное окно
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Останавливаем всплытие событий клавиатуры
      e.stopPropagation();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Останавливаем всплытие событий клавиатуры
      e.stopPropagation();
    };

    // Добавляем обработчики в фазе захвата (capture phase)
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyUp, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [isOpen]);

  // Автоматически получаем реквизит при открытии модалки
  useEffect(() => {
    if (isOpen && step === 'loading') {
      handleGetRequisite();
    }
  }, [isOpen]);

  // Auto-refresh bank account limit + reservation status while modal is open.
  // This prevents manual refresh when another operator changes the requisite.
  useEffect(() => {
    if (!isOpen) return;
    if (!requisite) return;
    if (step !== 'select-source' && step !== 'amount') return;

    const bankAccountId = requisite.id;
    let cancelled = false;

    const formatReservedMsg = (status: any) => {
      const who =
        status?.reservedByUsername ||
        status?.reservedByEmail ||
        (status?.reservedByUserId ? `ID ${status.reservedByUserId}` : 'другим оператором');

      const until = status?.expiresAt
        ? new Date(status.expiresAt).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : null;

      return until
        ? `Реквизит сейчас занят: ${who} (до ${until}). Возьмите следующий.`
        : `Реквизит сейчас занят: ${who}. Возьмите следующий.`;
    };

    const tick = async () => {
      // 1) Refresh bank account (limit) regardless of reservation state
      try {
        const fresh = await bankAccountsService.getById(String(bankAccountId));
        if (cancelled) return;
        setRequisite((prev) => {
          if (!prev || prev.id !== bankAccountId) return prev;
          return {
            ...prev,
            ...fresh,
            bankName: fresh.bankName ?? prev.bankName,
            dropName: fresh.dropName ?? prev.dropName,
            bank: fresh.bank ?? prev.bank,
            drop: fresh.drop ?? prev.drop,
          };
        });
      } catch {
        // ignore
      }

      // 2) If we're waiting for release, refresh reservation status
      if (!waitingForRequisiteRelease) return;

      try {
        const status = await bankAccountsService.getReservationStatusV3(bankAccountId);
        if (cancelled) return;

        if (!status?.reserved) {
          setWaitingForRequisiteRelease(false);
          setError('');
          toast.success('Реквизит снова доступен');
          return;
        }

        // Update message without spamming toast
        setError(formatReservedMsg(status));
      } catch {
        // ignore
      }
    };

    tick();
    const intervalId = window.setInterval(tick, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [isOpen, requisite, step, waitingForRequisiteRelease]);

  // Создать транзакцию
  const createTransaction = useMutation({
    mutationFn: (data: CreateTransactionRequest) => transactionsService.createV4(data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['current-shift'] });
      queryClient.invalidateQueries({ queryKey: ['my-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['my-transactions-recent'] });
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      
      // Обновить реквизит + остатки лимитов по нео-банкам
      try {
        const updated = await bankAccountsService.getRequisiteV3();
        setRequisite(updated.bankAccount);
        setNeoBanks(updated.neoBanks);

        try {
          const neoBanksResp = await bankAccountsService.searchNeoBanksV3({ limit: 200, page: 1 });
          setNeoBanksUi((neoBanksResp.items ?? []) as unknown as GetRequisiteV2NeoBank[]);
        } catch {
          setNeoBanksUi([]);
        }
      } catch (error) {
        console.error('Failed to refresh requisite-v2:', error);
      }
      
      setStep('success');
      toast.success('Операция успешно зафиксирована!');
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.message || 'Ошибка при фиксации операции';
      setError(errorMsg);
      toast.error(errorMsg);
    },
  });

  const handleGetRequisite = async () => {
    setError('');
    setWaitingForRequisiteRelease(false);
    setStep('loading');
    
    try {
      const result = await bankAccountsService.getRequisiteV3();
      setRequisite(result.bankAccount);
      setNeoBanks(result.neoBanks);

      try {
        const neoBanksResp = await bankAccountsService.searchNeoBanksV3({ limit: 200, page: 1 });
        setNeoBanksUi((neoBanksResp.items ?? []) as unknown as GetRequisiteV2NeoBank[]);
      } catch {
        setNeoBanksUi([]);
      }

      setStep('select-source');
      toast.success('Реквизит успешно получен');
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message || 'Не удалось получить реквизит';
      setError(errorMsg);
      toast.error(errorMsg);
      onClose();
    }
  };

  const handleCopy = async (text: string, field: 'cbu' | 'alias') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field === 'cbu' ? 'CBU' : 'Alias'} скопирован в буфер обмена`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Не удалось скопировать');
    }
  };

  const handleSubmitAmount = () => {
    if (!requisite) return;

    if (!requisiteReservationToken) {
      setError('Реквизит не зарезервирован. Нажмите "Далее" ещё раз.');
      return;
    }

    const amountNum = parseFloat(amount);
    const availableAmount = requisite.currentLimitAmount || 0;

    // Валидация
    if (!amount || amountNum <= 0) {
      setError('Введите корректную сумму');
      return;
    }

    if (amountNum > availableAmount) {
      setError(`Сумма превышает доступный лимит (${formatCurrency(availableAmount)})`);
      return;
    }

    setError('');
    // Snapshot values before mutation; onSuccess we refresh requisite, so success screen
    // must not subtract the amount twice.
    setSubmittedRequisite(requisite);
    setSubmittedAmount(amountNum);
    createTransaction.mutate({
      amount: amountNum,
      sourceDropNeoBankId: Number(selectedNeoBank),
      bankAccountId: requisite.id,
      reservationToken: requisiteReservationToken,
      comment: comment?.trim() || undefined,
    });
  };

  const handleClose = () => {
    // Best-effort release reservation
    if (requisite && requisiteReservationToken) {
      bankAccountsService.releaseRequisiteV3({
        bankAccountId: requisite.id,
        reservationToken: requisiteReservationToken,
      }).catch(() => undefined);
    }

    setStep('loading');
    setSelectedNeoBank(null);
    setRequisite(null);
    setSubmittedRequisite(null);
    setSubmittedAmount(null);
    setNeoBanks([]);
    setNeoBankProviderFilter('all');
    setNeoBankDropFilter('all');
    setNeoBankAccountFilter('all');
    setNeoBanksUi([]);
    setRequisiteReservationToken('');
    setReservingRequisite(false);
    setWaitingForRequisiteRelease(false);
    setAmount('');
    setComment('');
    setError('');
    setCopiedField(null);
    onClose();
  };

  const formatCurrency = (value: number) => {
    return `ARS ${value.toLocaleString('es-AR')}`;
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  };

  const selectedNeoBankData = (neoBanksUi.length ? neoBanksUi : neoBanks).find(
    (nb) => nb.id === selectedNeoBank,
  );

  const getProviderLabel = (provider: string) => {
    const labels: Record<string, string> = {
      ripio: 'Ripio',
      lemon_cash: 'Lemon Cash',
      satoshi_tango: 'Satoshi Tango',
      yont: 'Yont',
    };
    return labels[provider] || provider;
  };

  type NeoBankWithDropName = GetRequisiteV2NeoBank & { dropName?: string };

  const neoBanksForFilters: NeoBankWithDropName[] = (
    (neoBanksUi.length ? neoBanksUi : neoBanks) as unknown as NeoBankWithDropName[]
  ) ?? [];

  const filteredNeoBanks: NeoBankWithDropName[] = neoBanksForFilters;

  const providerOptions = Array.from(
    new Set(neoBanksForFilters.map((nb) => String(nb.provider || '')).filter(Boolean)),
  ).sort((a, b) => getProviderLabel(a).localeCompare(getProviderLabel(b), 'ru'));

  const dropOptions = Array.from(
    new Set(
      neoBanksForFilters
        .map((nb) => String((nb as NeoBankWithDropName).dropName || ''))
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b, 'ru'));

  const accountOptions = Array.from(
    new Set(
      neoBanksForFilters
        .map((nb) => String(nb.accountId || ''))
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b, 'en'));

  const filteredNeoBanksWithDropdowns: NeoBankWithDropName[] = filteredNeoBanks
    .filter((nb) => neoBankProviderFilter === 'all' || nb.provider === neoBankProviderFilter)
    .filter(
      (nb) =>
        neoBankDropFilter === 'all' ||
        String((nb as NeoBankWithDropName).dropName || '').trim() === neoBankDropFilter,
    )
    .filter(
      (nb) => neoBankAccountFilter === 'all' || String(nb.accountId || '').trim() === neoBankAccountFilter,
    );

  useEffect(() => {
    if (step !== 'select-source') return;
    if (!selectedNeoBank) return;

    const stillVisible = filteredNeoBanksWithDropdowns.some((nb) => nb.id === selectedNeoBank);
    if (!stillVisible) {
      setSelectedNeoBank(null);
    }
  }, [step, selectedNeoBank, filteredNeoBanksWithDropdowns]);

  if (!isOpen) return null;

  const successAmount = submittedAmount ?? (Number.isFinite(parseFloat(amount)) ? parseFloat(amount) : 0);
  const successRequisite = submittedRequisite ?? requisite;
  const successRemaining = submittedRequisite
    ? Math.max(0, (submittedRequisite.currentLimitAmount || 0) - (submittedAmount || 0))
    : Math.max(0, (requisite?.currentLimitAmount || 0));

  return (
    <div className="modal-overlay" onClick={handleClose} onKeyDown={handleModalKeyDown}>
      <div 
        className="modal-content get-requisite-modal" 
        onClick={handleModalClick}
        onKeyDown={handleModalKeyDown}
      >
        {/* Header */}
        <div className="modal-header">
          <h2>
            {step === 'loading' && 'Получить реквизит'}
            {step === 'select-source' && 'Выберите банк вывода для вывода'}
            {step === 'amount' && 'Введите сумму вывода'}
            {step === 'success' && 'Операция выполнена'}
          </h2>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>

        {/* Body */}
        <div className={`modal-body ${step === 'select-source' ? 'has-sticky-footer' : ''}`}>
          {/* Step 1: Loading */}
          {step === 'loading' && (
            <div className="step-loading">
              <Loader size={48} className="spin" />
              <p>Подбираем оптимальный реквизит по приоритетам...</p>
              {error && (
                <div className="error-message">
                  <AlertTriangle size={18} />
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Source Neo-Bank + Show Requisite */}
          {step === 'select-source' && requisite && (
            <div className="step-select-source">
              <div className="requisite-info">
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Реквизит для вывода:</h3>
                
                <div className="info-row bank-row">
                  <Building size={20} />
                  <div>
                    <span className="label">Банк</span>
                    <span className="value">{requisite.bankName || requisite.bank?.name || t('common.unknownBank')}</span>
                  </div>
                </div>

                <div className="info-row">
                  <Tag size={20} />
                  <div>
                    <span className="label">Владелец (Дроп)</span>
                    <span className="value">
                      {requisite.dropName || requisite.drop?.name || 'Неизвестный'}
                    </span>
                  </div>
                </div>

                <div className="info-row">
                  <CreditCard size={20} />
                  <div className="copy-section">
                    <span className="label">CBU</span>
                    <div className="copy-wrapper">
                      <span className="value cbu-value">{requisite.cbu}</span>
                      <button 
                        className="btn-copy"
                        onClick={() => handleCopy(requisite.cbu, 'cbu')}
                      >
                        {copiedField === 'cbu' ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="info-row">
                  <Tag size={20} />
                  <div className="copy-section">
                    <span className="label">Alias</span>
                    <div className="copy-wrapper">
                      <span className="value">{requisite.alias}</span>
                      <button 
                        className="btn-copy"
                        onClick={() => handleCopy(requisite.alias, 'alias')}
                      >
                        {copiedField === 'alias' ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="divider"></div>

                <div className="info-row balance-row">
                  <TrendingUp size={20} />
                  <div>
                    <span className="label">Доступно для вывода</span>
                    <span className="value amount-value">{formatCurrency(requisite.currentLimitAmount || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="divider" style={{ margin: '1.5rem 0' }}></div>

              {neoBanks.length === 0 ? (
                <div className="empty-state">
                  <Wallet size={48} />
                  <p>Нет доступных нео-банков для этой платформы</p>
                  <small>Обратитесь к администратору</small>
                </div>
              ) : (
                <>
                  <div className="instructions">
                    <p>Выберите нео-банк, через который проведём операцию (для истории)</p>
                  </div>

                  <div className="neo-bank-filters">
                    <div className="neo-bank-filter">
                      <label className="neo-bank-filter-label">Банк</label>
                      <select
                        className="neo-bank-filter-select"
                        value={neoBankProviderFilter}
                        onChange={(e) => setNeoBankProviderFilter(e.target.value)}
                      >
                        <option value="all">Все</option>
                        {providerOptions.map((p) => (
                          <option key={p} value={p}>
                            {getProviderLabel(p)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="neo-bank-filter">
                      <label className="neo-bank-filter-label">Дроп</label>
                      <select
                        className="neo-bank-filter-select"
                        value={neoBankDropFilter}
                        onChange={(e) => setNeoBankDropFilter(e.target.value)}
                      >
                        <option value="all">Все</option>
                        {dropOptions.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="neo-bank-filter">
                      <label className="neo-bank-filter-label">СВУ</label>
                      <select
                        className="neo-bank-filter-select"
                        value={neoBankAccountFilter}
                        onChange={(e) => setNeoBankAccountFilter(e.target.value)}
                      >
                        <option value="all">Все</option>
                        {accountOptions.map((a) => (
                          <option key={a} value={a}>
                            …{a.slice(-4)} ({a})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="neo-banks-list">
                    {filteredNeoBanksWithDropdowns.map((neoBank) => (
                      <div
                        key={neoBank.id}
                        className={`neo-bank-card ${selectedNeoBank === neoBank.id ? 'selected' : ''}`}
                        onClick={() => setSelectedNeoBank(neoBank.id)}
                      >
                        <div className="neo-bank-header">
                          <span className={`provider-badge ${getProviderBadgeClass(neoBank.provider)}`}>
                            {getProviderLabel(neoBank.provider)}
                          </span>
                          {selectedNeoBank === neoBank.id && (
                            <Check size={20} className="check-icon" />
                          )}
                        </div>
                        <div className="neo-bank-info">
                          <div className="info-item">
                            <span className="label">Дроп:</span>
                            <span className="value">{(neoBank as NeoBankWithDropName).dropName || '—'}</span>
                          </div>
                          <div className="info-item">
                            <span className="label">СВУ:</span>
                            <span className="value">{neoBank.accountId}</span>
                          </div>
                          <div className="info-item">
                            <span className="label">Alias:</span>
                            <span className="value">{neoBank.alias || '—'}</span>
                          </div>
                          <div className="info-item">
                            <span className="label">Дневной лимит:</span>
                            <span className="value">{formatNeoBankLimit(neoBank.dailyLimit)}</span>
                          </div>
                          <div className="info-item">
                            <span className="label">Месячный лимит:</span>
                            <span className="value">{formatNeoBankLimit(neoBank.monthlyLimit)}</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {(neoBankProviderFilter !== 'all' || neoBankDropFilter !== 'all' || neoBankAccountFilter !== 'all') && filteredNeoBanksWithDropdowns.length === 0 && (
                      <div className="neo-banks-empty">
                        <Wallet size={42} />
                        <div className="neo-banks-empty-title">Нео-банки не найдены</div>
                        <div className="neo-banks-empty-subtitle">Попробуйте другой запрос</div>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="error-message">
                      <AlertTriangle size={18} />
                      {error}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Step 3: Amount Input */}
          {step === 'amount' && requisite && selectedNeoBankData && (
            <div className="step-amount">
              <div className="requisite-summary">
                <p><strong>Исходный нео-банк:</strong> <span className={`provider-badge ${getProviderBadgeClass(selectedNeoBankData.provider)}`}>{getProviderLabel(selectedNeoBankData.provider)}</span></p>
                <p><small>СВУ: {selectedNeoBankData.accountId} | Alias: {selectedNeoBankData.alias || '—'}</small></p>
                <p><small>Лимиты: дневной {formatNeoBankLimit(selectedNeoBankData.dailyLimit)} / месячный {formatNeoBankLimit(selectedNeoBankData.monthlyLimit)}</small></p>
                <div className="divider"></div>
                <p><strong>Реквизит для вывода:</strong> {requisite.bankName || requisite.bank?.name}</p>
                <p><strong>Владелец:</strong> {requisite.dropName}</p>
                <p><small>CBU: ...{requisite.cbu.slice(-4)} | Alias: {requisite.alias}</small></p>
              </div>

              <div className="form-group">
                <label>Фактическая сумма вывода *</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={error ? 'error' : ''}
                  autoFocus
                />
                <span className="hint">Введите фактическую сумму, которую вывели. Доступно: {formatCurrency(requisite?.currentLimitAmount || 0)}</span>
              </div>

              <div className="form-group">
                <label>Комментарий (опционально)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Необязательный комментарий"
                  rows={3}
                />
              </div>

              {error && (
                <div className="error-message">
                  <AlertTriangle size={18} />
                  {error}
                </div>
              )}

              <div className="modal-footer">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    if (requisite && requisiteReservationToken) {
                      bankAccountsService
                        .releaseRequisiteV3({
                          bankAccountId: requisite.id,
                          reservationToken: requisiteReservationToken,
                        })
                        .catch(() => undefined);
                    }
                    setRequisiteReservationToken('');
                    setWaitingForRequisiteRelease(false);
                    setStep('select-source');
                  }}
                >
                  Назад
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleSubmitAmount}
                  disabled={createTransaction.isPending}
                >
                  {createTransaction.isPending ? 'Фиксируем...' : 'Зафиксировать операцию ✓'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && successRequisite && (
            <div className="step-success">
              <CheckCircle size={64} className="success-icon" />
              <h3>Операция зафиксирована!</h3>
              
              <div className="success-details">
                <div className="detail-item">
                  <span className="label">Сумма вывода</span>
                  <span className="value">{formatCurrency(successAmount)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Реквизит</span>
                  <span className="value">{successRequisite.bankName || successRequisite.bank?.name}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Владелец</span>
                  <span className="value">{successRequisite.dropName}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Остаток на реквизите</span>
                  <span className="value">{formatCurrency(successRemaining)}</span>
                </div>
                {comment && (
                  <div className="detail-item comment-item">
                    <span className="label">Комментарий</span>
                    <span className="value">{comment}</span>
                  </div>
                )}
              </div>

              <div className="success-actions">
                <button className="btn-secondary" onClick={handleClose}>
                  Закрыть
                </button>
                <button className="btn-primary" onClick={() => {
                  setStep('select-source');
                  setSelectedNeoBank(null);
                  setRequisite(null);
                  setRequisiteReservationToken('');
                  setReservingRequisite(false);
                  handleGetRequisite();
                }}>
                  Получить следующий реквизит →
                </button>
              </div>
            </div>
          )}
        </div>

        {step === 'select-source' && requisite && neoBanks.length > 0 && (
          <div className="modal-sticky-footer">
            {error && (
              <div className="error-message" style={{ marginBottom: '0.75rem' }}>
                <AlertTriangle size={18} />
                {error}
              </div>
            )}

            <button
              className="btn-primary btn-large"
              onClick={() => {
                if (!selectedNeoBank) {
                  setError('Выберите нео-банк');
                  toast.error('Выберите нео-банк');
                  return;
                }
                if (!requisite) return;

                setReservingRequisite(true);
                setError('');
                setWaitingForRequisiteRelease(false);
                bankAccountsService
                  .reserveRequisiteV3(requisite.id)
                  .then((resp) => {
                    setRequisiteReservationToken(resp.reservationToken);
                    setStep('amount');
                  })
                  .catch((err: any) => {
                    const baseMsg = err?.response?.data?.message || 'Реквизит сейчас занят другим оператором';

                    bankAccountsService
                      .getReservationStatusV3(requisite.id)
                      .then((status) => {
                        if (!status?.reserved) {
                          setError(String(baseMsg));
                          toast.error(String(baseMsg));
                          return;
                        }

                        const who =
                          status.reservedByUsername || status.reservedByEmail || (status.reservedByUserId ? `ID ${status.reservedByUserId}` : 'другим оператором');

                        const until = status.expiresAt
                          ? new Date(status.expiresAt).toLocaleTimeString('ru-RU', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : null;

                        const msg = until
                          ? `Реквизит сейчас занят: ${who} (до ${until}). Возьмите следующий.`
                          : `Реквизит сейчас занят: ${who}. Возьмите следующий.`;

                        setWaitingForRequisiteRelease(true);
                        setError(msg);
                        toast.error(msg);
                      })
                      .catch(() => {
                        setError(String(baseMsg));
                        toast.error(String(baseMsg));
                      });
                  })
                  .finally(() => setReservingRequisite(false));
              }}
              disabled={!selectedNeoBank || reservingRequisite}
            >
              {reservingRequisite ? 'Проверяем...' : 'Далее - Ввести сумму →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
