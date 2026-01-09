import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  operatorService,
  OperatorBank,
  TransactionForOperator,
} from '../../services/operator.service';
import { banksService } from '../../services/banks.service';
import { banksAdminService } from '../../services/banks-admin.service';
import { useAuthStore } from '../../store/authStore';
import './Banks.css';

const Banks = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [banks, setBanks] = useState<OperatorBank[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);
  const [bankTransactions, setBankTransactions] = useState<TransactionForOperator[]>([]);
  const [bankTransactionsTotal, setBankTransactionsTotal] = useState(0);
  const [showFullBankHistory, setShowFullBankHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteConfirmBank, setDeleteConfirmBank] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [createName, setCreateName] = useState('');
  const [createCode, setCreateCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const createNameInputRef = useRef<HTMLInputElement | null>(null);

  const isAdminOrTeamlead = user?.role === 'admin' || user?.role === 'teamlead';
  const isAdmin = user?.role === 'admin';

  const getErrorMessage = (error: unknown, fallback: string) => {
    const maybeAxios = error as {
      response?: { data?: { message?: string | string[] } };
      message?: string;
    };

    const apiMessage = maybeAxios?.response?.data?.message;
    if (Array.isArray(apiMessage)) return apiMessage.join(', ');
    if (typeof apiMessage === 'string' && apiMessage.trim()) return apiMessage;
    if (typeof maybeAxios?.message === 'string' && maybeAxios.message.trim()) return maybeAxios.message;
    return fallback;
  };

  useEffect(() => {
    if (!isCreateModalOpen && !deleteConfirmBank) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCreateModalOpen(false);
        setDeleteConfirmBank(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isCreateModalOpen, deleteConfirmBank]);

  useEffect(() => {
    if (isCreateModalOpen) {
      // Ensure focus moves into modal.
      setTimeout(() => createNameInputRef.current?.focus(), 0);
    }
  }, [isCreateModalOpen]);

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      const myBanksPromise = operatorService.getMyBanks();

      if (!isAdminOrTeamlead) {
        const myBanks = await myBanksPromise;
        setBanks(myBanks.banks);
        return;
      }

      const [myBanks, allBanks] = await Promise.all([
        myBanksPromise,
        banksService.getAll(),
      ]);

      const existingIds = new Set<number>(myBanks.banks.map((b) => b.id));

      const merged: OperatorBank[] = [
        ...myBanks.banks,
        ...allBanks.items
          .filter((b) => !existingIds.has(Number(b.id)))
          .map((b) => ({
            id: Number(b.id),
            name: b.name,
            code: b.code ?? null,
            status: b.status,
            accounts: [],
          })),
      ];

      setBanks(merged);
    } catch (error) {
      console.error('Error fetching banks:', error);
    }
  };

  const handleCreateBank = async () => {
    const name = createName.trim();
    const code = createCode.trim();
    if (!name) {
      toast.error(t('banksPage.enterNameError'));
      createNameInputRef.current?.focus();
      return;
    }

    setCreating(true);
    try {
      console.log('[banks] create request', { name, code: code || undefined });
      await banksAdminService.create({
        name,
        ...(code ? { code } : {}),
      });
      setCreateName('');
      setCreateCode('');
      await fetchBanks();
      toast.success(t('banksPage.createdToast'));
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating bank:', error);
      toast.error(getErrorMessage(error, t('banksPage.createFailed')));
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBank = async (bankId: number) => {
    setDeletingId(bankId);
    try {
      console.log('[banks] delete request', { bankId });
      await banksAdminService.delete(bankId);
      if (selectedBankId === bankId) {
        setSelectedBankId(null);
        setBankTransactions([]);
      }
      await fetchBanks();
      toast.success(t('banksPage.deletedToast'));
      setDeleteConfirmBank(null);
    } catch (error) {
      console.error('Error deleting bank:', error);
      toast.error(getErrorMessage(error, t('banksPage.deleteFailed')));
    } finally {
      setDeletingId(null);
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
    <div className="operator-banks">
      <h1>{t('nav.banks')}</h1>

      <div className="section">
        <div className="banks-section-header">
          <h2>{t('banksPage.priorityTitle')}</h2>
          {isAdmin && (
            <button
              className="banks-create-btn"
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
            >
              {t('banksPage.createBank')}
            </button>
          )}
        </div>

        {isAdmin && isCreateModalOpen && (
          <div
            className="modal-overlay"
            role="dialog"
            aria-modal="true"
            onClick={() => setIsCreateModalOpen(false)}
          >
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Создать банк</h3>
              </div>

              <div className="modal-body">
                <label className="modal-label">
                  {t('banksPage.nameLabel')}
                  <input
                    className="modal-input"
                    placeholder={t('banksPage.namePlaceholder')}
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    ref={createNameInputRef}
                  />
                </label>

                <label className="modal-label">
                  {t('banksPage.codeLabel')}
                  <input
                    className="modal-input"
                    placeholder={t('banksPage.codePlaceholder')}
                    value={createCode}
                    onChange={(e) => setCreateCode(e.target.value)}
                  />
                </label>
              </div>

              <div className="modal-footer">
                <button
                  className="modal-btn"
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={creating}
                >
                  {t('common.cancel')}
                </button>
                <button
                  className="load-more-btn modal-primary-btn"
                  type="button"
                  onClick={handleCreateBank}
                  disabled={creating}
                >
                  {creating ? t('banksPage.creating') : t('banksPage.create')}
                </button>
              </div>
            </div>
          </div>
        )}

        {isAdmin && deleteConfirmBank && (
          <div
            className="modal-overlay"
            role="dialog"
            aria-modal="true"
            onClick={() => setDeleteConfirmBank(null)}
          >
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">{t('banksPage.deleteBankTitle')}</h3>
              </div>

              <div className="modal-body">
                <div className="modal-text">
                  {t('banksPage.deleteConfirmQuestion', { name: deleteConfirmBank.name })}
                </div>
                <div className="modal-text">
                  {t('banksPage.deleteSoftInfo')}
                </div>
                <div className="modal-text">
                  {t('banksPage.deleteLinkedInfo')}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="modal-btn"
                  type="button"
                  onClick={() => setDeleteConfirmBank(null)}
                  disabled={deletingId === deleteConfirmBank.id}
                >
                  {t('common.cancel')}
                </button>
                <button
                  className="modal-danger-btn"
                  type="button"
                  onClick={() => handleDeleteBank(deleteConfirmBank.id)}
                  disabled={deletingId === deleteConfirmBank.id}
                >
                  {deletingId === deleteConfirmBank.id ? t('banksPage.deleting') : t('common.delete')}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="content-wrapper">
          <div className="banks-grid">
            {banks.map((bank) => (
              <div
                key={bank.id}
                className={`bank-card ${selectedBankId === bank.id ? 'selected' : ''}`}
                onClick={() => handleBankClick(bank.id)}
              >
                <div className="bank-header">
                  <h3>{bank.name}</h3>
                  {isAdmin && (
                    <button
                      className="banks-admin-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmBank({ id: bank.id, name: bank.name });
                      }}
                      disabled={deletingId === bank.id}
                      title="Удалить банк"
                    >
                      {deletingId === bank.id ? t('banksPage.deleting') : t('common.delete')}
                    </button>
                  )}
                </div>

                <div className="bank-accounts">
                  <p className="accounts-count">Счетов: {bank.accounts.length}</p>
                  <div className="accounts-list">
                    {bank.accounts.slice(0, 3).map((account) => (
                      <div
                        key={account.id}
                        className={`account-item ${isAdminOrTeamlead ? 'account-item-clickable' : ''}`}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          if (!isAdminOrTeamlead) return;
                          navigate('/teamlead-dashboard', {
                            state: { highlightBankAccountId: account.id },
                          });
                        }}
                      >
                        <div className="account-info">
                          <span className="account-alias">{account.alias}</span>
                          <span className="account-priority">
                            Приоритет: {account.priority}
                          </span>
                        </div>
                        <div className="account-limits">
                          <span>
                            {formatCurrency(account.withdrawnAmount)} /{' '}
                            {formatCurrency(account.initialLimitAmount)}
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
          <div className="transactions-history">
            <h3>История транзакций банка</h3>
            {!selectedBankId ? (
              <div className="history-placeholder">
                <p>Выберите банк для просмотра истории</p>
              </div>
            ) : loading ? (
              <p>Загрузка...</p>
            ) : (
              <>
                <div className="transactions-list">
                  {bankTransactions.length === 0 ? (
                    <p>Нет транзакций</p>
                  ) : (
                    bankTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className={`transaction-item ${isAdminOrTeamlead ? 'transaction-item-clickable' : ''}`}
                        onDoubleClick={() => {
                          if (!isAdminOrTeamlead) return;
                          navigate('/transactions', {
                            state: { highlightTransactionId: tx.id, viewMode: 'all', source: 'banks' },
                          });
                        }}
                      >
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
                          {isAdminOrTeamlead && tx.userName && (
                            <span className="transaction-user">
                              Оператор: {tx.userName} ({tx.userRole})
                            </span>
                          )}
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
        </div>
      </div>
    </div>
  );
};

export default Banks;
