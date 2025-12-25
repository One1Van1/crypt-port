import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  CheckCircle
} from 'lucide-react';
import { bankAccountsService, BankAccount } from '../../services/bank-accounts.service';
import { transactionsService, CreateTransactionRequest } from '../../services/transactions.service';
import { shiftsService } from '../../services/shifts.service';
import './GetRequisiteModal.css';

interface GetRequisiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Step = 'loading' | 'display' | 'amount' | 'success';

export default function GetRequisiteModal({ isOpen, onClose, onSuccess }: GetRequisiteModalProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>('loading');
  const [requisite, setRequisite] = useState<BankAccount | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [copiedField, setCopiedField] = useState<'cbu' | 'alias' | null>(null);
  const [error, setError] = useState<string>('');

  // Получить текущую смену
  const { data: currentShift } = useQuery({
    queryKey: ['current-shift'],
    queryFn: () => shiftsService.getMyCurrentShift(),
    enabled: isOpen,
  });

  // Получить доступный реквизит
  const { refetch: fetchRequisite, isFetching } = useQuery({
    queryKey: ['available-requisite'],
    queryFn: async () => {
      const account = await bankAccountsService.getAvailable();
      const availableAmount = account.limitAmount - account.withdrawnAmount;
      return { ...account, availableAmount };
    },
    enabled: false,
    retry: false,
  });

  // Создать транзакцию
  const createTransaction = useMutation({
    mutationFn: (data: CreateTransactionRequest) => transactionsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-shift'] });
      queryClient.invalidateQueries({ queryKey: ['my-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      setStep('success');
      toast.success('Транзакция успешно создана!');
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.message || 'Ошибка при создании транзакции';
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
      const result = await fetchRequisite();
      if (result.data) {
        setRequisite(result.data);
        setStep('display');
        toast.success('Реквизит успешно получен');
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message || 'Не удалось получить реквизит';
      setError(errorMsg);
      toast.error(errorMsg);
      setStep('loading');
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

  const handleNextToAmount = () => {
    setStep('amount');
    setAmount('');
    setComment('');
    setError('');
  };

  const handleSubmitAmount = () => {
    if (!requisite || !currentShift) return;

    const amountNum = parseFloat(amount);
    const availableAmount = requisite.limitAmount - requisite.withdrawnAmount;

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
      bankAccountId: requisite.id,
      amount: amountNum,
      comment: comment || undefined,
      shiftId: currentShift.id.toString(),
    });
  };

  const handleClose = () => {
    setStep('loading');
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

  if (!isOpen) return null;

  const availableAmount = requisite ? requisite.limitAmount - requisite.withdrawnAmount : 0;
  const isLowBalance = availableAmount > 0 && availableAmount < 50000;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content get-requisite-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>
            {step === 'loading' && 'Получить реквизит'}
            {step === 'display' && 'Реквизит для вывода'}
            {step === 'amount' && 'Введите сумму вывода'}
            {step === 'success' && 'Операция выполнена'}
          </h2>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Step 1: Loading / Get Requisite */}
          {step === 'loading' && (
            <div className="step-loading">
              {isFetching ? (
                <>
                  <Loader size={48} className="spin" />
                  <p>Подбираем оптимальный реквизит...</p>
                </>
              ) : (
                <>
                  <CreditCard size={48} />
                  <p>Получите доступный реквизит для выполнения вывода</p>
                  {error && (
                    <div className="error-message">
                      <AlertTriangle size={18} />
                      {error}
                    </div>
                  )}
                  <button 
                    className="btn-primary btn-large" 
                    onClick={handleGetRequisite}
                    disabled={isFetching || !currentShift}
                  >
                    Получить реквизит
                  </button>
                  {!currentShift && (
                    <p className="hint-text">Начните смену перед получением реквизита</p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Step 2: Display Requisite */}
          {step === 'display' && requisite && (
            <div className="step-display">
              <div className="requisite-info">
                <div className="info-row bank-row">
                  <Building size={20} />
                  <div>
                    <span className="label">Банк</span>
                    <span className="value">{requisite.bank?.name || 'Unknown Bank'}</span>
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
                    <span className="value amount-value">{formatCurrency(availableAmount)}</span>
                  </div>
                </div>

                {isLowBalance && (
                  <div className="warning-message">
                    <AlertTriangle size={16} />
                    Низкий остаток на реквизите
                  </div>
                )}
              </div>

              <div className="instructions">
                <p>Выполните перевод вручную и введите фактическую сумму</p>
              </div>

              <button className="btn-primary btn-large" onClick={handleNextToAmount}>
                Далее - Ввести сумму →
              </button>
            </div>
          )}

          {/* Step 3: Amount Input */}
          {step === 'amount' && requisite && (
            <div className="step-amount">
              <div className="requisite-summary">
                <p><strong>Реквизит:</strong> {requisite.bank?.name}</p>
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
                <span className="hint">Доступно: {formatCurrency(availableAmount)}</span>
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
                <button className="btn-secondary" onClick={() => setStep('display')}>
                  Назад
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleSubmitAmount}
                  disabled={createTransaction.isPending}
                >
                  {createTransaction.isPending ? 'Обработка...' : 'Подтвердить вывод ✓'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && requisite && (
            <div className="step-success">
              <CheckCircle size={64} className="success-icon" />
              <h3>Операция выполнена успешно!</h3>
              
              <div className="success-details">
                <div className="detail-item">
                  <span className="label">Сумма вывода</span>
                  <span className="value">{formatCurrency(parseFloat(amount))}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Реквизит</span>
                  <span className="value">{requisite.bank?.name}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Остаток на реквизите</span>
                  <span className="value">{formatCurrency(availableAmount - parseFloat(amount))}</span>
                </div>
              </div>

              <div className="success-actions">
                <button className="btn-secondary" onClick={handleClose}>
                  Закрыть
                </button>
                <button className="btn-primary" onClick={() => {
                  setStep('loading');
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
