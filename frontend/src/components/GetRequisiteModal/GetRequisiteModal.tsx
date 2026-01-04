import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { bankAccountsService, BankAccount } from '../../services/bank-accounts.service';
import { transactionsService, CreateTransactionRequest } from '../../services/transactions.service';
import { shiftsService } from '../../services/shifts.service';
import dropNeoBanksService from '../../services/drop-neo-banks.service';
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
  const [amount, setAmount] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [copiedField, setCopiedField] = useState<'cbu' | 'alias' | null>(null);
  const [error, setError] = useState<string>('');

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

  // Получить текущую смену
  const { data: currentShift } = useQuery({
    queryKey: ['current-shift'],
    queryFn: () => shiftsService.getMyCurrentShift(),
    enabled: isOpen,
  });

  // Получить активные нео-банки платформы текущей смены
  const { data: neoBanks = [], isLoading: neoBanksLoading } = useQuery({
    queryKey: ['neo-banks-for-platform', currentShift?.platformId],
    queryFn: async () => {
      if (!currentShift?.platformId) return [];
      const result = await dropNeoBanksService.getAll({ 
        platformId: currentShift.platformId,
        status: 'active' 
      });
      return result.items;
    },
    enabled: isOpen && !!currentShift?.platformId,
  });

  // Автоматически получаем реквизит при открытии модалки
  useEffect(() => {
    if (isOpen && currentShift && step === 'loading') {
      handleGetRequisite();
    }
  }, [isOpen, currentShift]);

  // Создать транзакцию
  const createTransaction = useMutation({
    mutationFn: (data: CreateTransactionRequest) => transactionsService.create(data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['current-shift'] });
      queryClient.invalidateQueries({ queryKey: ['my-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['my-transactions-recent'] });
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['neo-banks-for-platform'] });
      
      // Обновить реквизит с сервера чтобы показать новый лимит
      if (requisite?.id) {
        try {
          const updatedRequisite = await bankAccountsService.getById(String(requisite.id));
          setRequisite(updatedRequisite);
        } catch (error) {
          console.error('Failed to refresh requisite:', error);
        }
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
    if (!currentShift) {
      const errorMsg = 'Нет активной смены. Начните смену перед получением реквизита.';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setError('');
    setStep('loading');
    
    try {
      // Система автоматически подбирает оптимальный реквизит по приоритетам
      const result = await bankAccountsService.getAvailable();
      setRequisite(result);
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
    if (!requisite || !currentShift) return;

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
    createTransaction.mutate({
      amount: amountNum,
      sourceDropNeoBankId: Number(selectedNeoBank),
      bankAccountId: requisite.id,
      comment: comment?.trim() || undefined,
    });
  };

  const handleClose = () => {
    setStep('loading');
    setSelectedNeoBank(null);
    setRequisite(null);
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

  if (!isOpen) return null;

  const selectedNeoBankData = neoBanks.find(nb => nb.id === selectedNeoBank);

  const getProviderLabel = (provider: string) => {
    const labels: Record<string, string> = {
      ripio: 'Ripio',
      lemon_cash: 'Lemon Cash',
      satoshi_tango: 'Satoshi Tango',
      yont: 'Yont',
    };
    return labels[provider] || provider;
  };

  const getProviderBadgeClass = (provider: string) => {
    const classes: Record<string, string> = {
      ripio: 'badge-ripio',
      lemon_cash: 'badge-lemon',
      satoshi_tango: 'badge-satoshi',
      yont: 'badge-yont',
    };
    return classes[provider] || 'badge-default';
  };

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
            {step === 'select-source' && 'Выберите нео-банк для вывода'}
            {step === 'amount' && 'Введите сумму вывода'}
            {step === 'success' && 'Операция выполнена'}
          </h2>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>

        {/* Body */}
        <div className="modal-body">
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
                    <span className="value">{requisite.dropName || 'Неизвестный'}</span>
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

              {neoBanksLoading ? (
                <div className="step-loading">
                  <Loader size={48} className="spin" />
                  <p>Загрузка нео-банков...</p>
                </div>
              ) : neoBanks.length === 0 ? (
                <div className="empty-state">
                  <Wallet size={48} />
                  <p>Нет доступных нео-банков для этого дропа</p>
                  <small>Обратитесь к администратору</small>
                </div>
              ) : (
                <>
                  <div className="instructions">
                    <p>Выберите нео-банк <strong>({requisite.dropName})</strong>, с которого будете выводить средства</p>
                  </div>

                  <div className="neo-banks-list">
                    {neoBanks.map((neoBank) => (
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
                            <span className="label">Аккаунт:</span>
                            <span className="value">{neoBank.accountId}</span>
                          </div>
                          <div className="info-item">
                            <span className="label">Баланс:</span>
                            <span className="value balance">{formatCurrency(neoBank.currentBalance || 0)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {error && (
                    <div className="error-message">
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
                      setStep('amount');
                    }}
                    disabled={!selectedNeoBank}
                  >
                    Далее - Ввести сумму →
                  </button>
                </>
              )}
            </div>
          )}

          {/* Step 3: Amount Input */}
          {step === 'amount' && requisite && selectedNeoBankData && (
            <div className="step-amount">
              <div className="requisite-summary">
                <p><strong>Исходный нео-банк:</strong> <span className={`provider-badge ${getProviderBadgeClass(selectedNeoBankData.provider)}`}>{getProviderLabel(selectedNeoBankData.provider)}</span></p>
                <p><small>Дроп: {selectedNeoBankData.drop?.name || 'Unknown'} | Баланс: {formatCurrency(selectedNeoBankData.currentBalance || 0)}</small></p>
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
                <button className="btn-secondary" onClick={() => setStep('select-source')}>
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
          {step === 'success' && requisite && (
            <div className="step-success">
              <CheckCircle size={64} className="success-icon" />
              <h3>Операция зафиксирована!</h3>
              
              <div className="success-details">
                <div className="detail-item">
                  <span className="label">Сумма вывода</span>
                  <span className="value">{formatCurrency(parseFloat(amount))}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Реквизит</span>
                  <span className="value">{requisite.bankName || requisite.bank?.name}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Владелец</span>
                  <span className="value">{requisite.dropName}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Остаток на реквизите</span>
                  <span className="value">{formatCurrency((requisite?.currentLimitAmount || 0) - parseFloat(amount))}</span>
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
                  handleGetRequisite();
                }}>
                  Получить следующий реквизит →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
