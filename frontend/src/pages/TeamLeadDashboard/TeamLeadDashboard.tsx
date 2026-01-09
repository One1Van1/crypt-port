import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, DollarSign, ArrowRightLeft, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/user.types';
import { bankAccountsService } from '../../services/bank-accounts.service';
import { banksService, Bank } from '../../services/banks.service';
import { dropsService, Drop } from '../../services/drops.service';
import { apiClient } from '../../services/api';
import { cashWithdrawalsService, CashWithdrawal } from '../../services/cash-withdrawals.service';
import './TeamLeadDashboard.css';

export default function TeamLeadDashboard() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'requisites' | 'withdrawals' | 'conversions'>('requisites');
  const [highlightBankAccountId, setHighlightBankAccountId] = useState<number | null>(null);

  useEffect(() => {
    const state = location.state as { highlightBankAccountId?: unknown } | null;
    const maybeId = state?.highlightBankAccountId;
    const id = typeof maybeId === 'number' ? maybeId : Number(maybeId);

    if (Number.isFinite(id) && id > 0) {
      setActiveTab('requisites');
      setHighlightBankAccountId(id);
    }
  }, [location.state]);

  // Проверка доступа - переместили ПОСЛЕ всех хуков
  useEffect(() => {
    // Пустой useEffect для соблюдения rules of hooks
  }, []);

  if (user?.role !== UserRole.TEAMLEAD && user?.role !== UserRole.ADMIN) {
    return (
      <div className="access-denied">
        <h2>{t('errors.accessDenied')}</h2>
        <p>{t('errors.teamleadOnly')}</p>
      </div>
    );
  }

  return (
    <div className="teamlead-dashboard">
      <div className="teamlead-header">
        <div className="teamlead-title">
          <Award size={32} className="title-icon" />
          <div>
            <h1>{user?.role === UserRole.ADMIN ? 'Панель админа' : 'Панель тимлида'}</h1>
            <p className="subtitle">{t('teamlead.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="teamlead-tabs">
        <button
          className={`teamlead-tab ${activeTab === 'requisites' ? 'active' : ''}`}
          onClick={() => setActiveTab('requisites')}
        >
          <TrendingUp size={20} />
          <span>{t('teamlead.requisites')}</span>
        </button>
        <button
          className={`teamlead-tab ${activeTab === 'withdrawals' ? 'active' : ''}`}
          onClick={() => setActiveTab('withdrawals')}
        >
          <DollarSign size={20} />
          <span>{t('teamlead.withdrawals')}</span>
        </button>
        <button
          className={`teamlead-tab ${activeTab === 'conversions' ? 'active' : ''}`}
          onClick={() => setActiveTab('conversions')}
        >
          <ArrowRightLeft size={20} />
          <span>{t('teamlead.conversions')}</span>
        </button>
      </div>

      <div className="teamlead-content">
        {activeTab === 'requisites' && (
          <RequisitesSection
            highlightBankAccountId={highlightBankAccountId}
            onHighlightHandled={() => setHighlightBankAccountId(null)}
          />
        )}
        {activeTab === 'withdrawals' && <WithdrawalsSection />}
        {activeTab === 'conversions' && <ConversionsSection />}
      </div>
    </div>
  );
}

// Секция управления приоритетами реквизитов
function RequisitesSection({
  highlightBankAccountId,
  onHighlightHandled,
}: {
  highlightBankAccountId: number | null;
  onHighlightHandled: () => void;
}) {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);
  const [limitUpdatingId, setLimitUpdatingId] = useState<number | null>(null);
  const [editingLimitId, setEditingLimitId] = useState<number | null>(null);
  const [limitDraft, setLimitDraft] = useState<Record<number, string>>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [drops, setDrops] = useState<Drop[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [openCreateDropdown, setOpenCreateDropdown] = useState<'bank' | 'drop' | null>(null);
  const [openStatusDropdownId, setOpenStatusDropdownId] = useState<number | null>(null);
  const [deleteConfirmAccount, setDeleteConfirmAccount] = useState<any | null>(null);
  const [createForm, setCreateForm] = useState({
    bankId: '',
    dropId: '',
    cbu: '',
    alias: '',
    initialLimitAmount: '',
    priority: '1',
  });
  const rowRefs = useRef<Map<number, HTMLTableRowElement>>(new Map());
  const positionsRef = useRef<Map<number, DOMRect>>(new Map());

  const canCreateRequisite = user?.role === UserRole.ADMIN || user?.role === UserRole.TEAMLEAD;

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (canCreateRequisite) {
      loadCreateOptions();
    }
  }, [canCreateRequisite]);

  useEffect(() => {
    if (!highlightBankAccountId) return;
    if (loading) return;

    const row = rowRefs.current.get(highlightBankAccountId);
    if (!row) return;

    setHighlightedId(highlightBankAccountId);
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    onHighlightHandled();
  }, [highlightBankAccountId, loading, accounts, onHighlightHandled]);

  useEffect(() => {
    if (!highlightedId) return;
    const timeoutId = window.setTimeout(() => setHighlightedId(null), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [highlightedId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.modal-custom-select')) {
        setOpenCreateDropdown(null);
      }
    };

    if (openCreateDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openCreateDropdown]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.status-custom-select')) {
        setOpenStatusDropdownId(null);
      }
    };

    if (openStatusDropdownId !== null) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openStatusDropdownId]);

  const loadCreateOptions = async () => {
    setOptionsLoading(true);
    try {
      const [banksData, dropsData] = await Promise.all([
        banksService.getAll(),
        dropsService.getAll(),
      ]);
      setBanks(banksData.items || []);
      setDrops(dropsData.items || []);
    } catch (error) {
      console.error('Failed to load requisite create options:', error);
      setBanks([]);
      setDrops([]);
    } finally {
      setOptionsLoading(false);
    }
  };

  const openCreateModal = () => {
    setCreateForm({
      bankId: '',
      dropId: '',
      cbu: '',
      alias: '',
      initialLimitAmount: '',
      priority: '1',
    });
    setOpenCreateDropdown(null);
    setIsCreateModalOpen(true);
  };

  const validateCreateForm = () => {
    if (!createForm.bankId || !createForm.dropId || !createForm.cbu || !createForm.alias || !createForm.initialLimitAmount) {
      return false;
    }
    if (!/^\d{22}$/.test(createForm.cbu)) {
      return false;
    }
    if (createForm.alias.trim().length < 6) {
      return false;
    }
    const limit = Number(createForm.initialLimitAmount);
    if (!Number.isFinite(limit) || limit <= 0) {
      return false;
    }
    const priority = Number(createForm.priority);
    if (!Number.isFinite(priority) || priority < 1 || priority > 99) {
      return false;
    }
    return true;
  };

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCreateForm()) {
      toast.error(t('common.fillRequired'));
      return;
    }

    setCreating(true);
    try {
      const createdResponse = await apiClient.post('/bank-accounts', {
        bankId: Number(createForm.bankId),
        dropId: Number(createForm.dropId),
        cbu: createForm.cbu,
        alias: createForm.alias,
        initialLimitAmount: Number(createForm.initialLimitAmount),
        priority: Number(createForm.priority) || 1,
      });

      const created = createdResponse?.data as any;

      toast.success(t('teamlead.requisiteCreated'));
      setIsCreateModalOpen(false);

      if (created?.id) {
        await reorderAndPersistPriorities(created.id, Number(createForm.priority) || 1, { fetchFresh: true });
      } else {
        await loadAccounts();
      }
    } catch (error) {
      console.error('Failed to create requisite:', error);
      toast.error(t('teamlead.requisiteCreateError'));
    } finally {
      setCreating(false);
    }
  };

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await bankAccountsService.getAll();
      setAccounts(data.items || []);
    } catch (error) {
      console.error('Failed to load accounts:', error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const startEditAvailable = (account: any) => {
    const id = Number(account?.id);
    if (!Number.isFinite(id)) return;
    if (limitUpdatingId === id || updating === id || statusUpdatingId === id) return;
    setLimitDraft((prev) => ({
      ...prev,
      [id]: String(Number(account?.currentLimitAmount ?? 0)),
    }));
    setEditingLimitId(id);
  };

  const cancelEditAvailable = () => {
    setEditingLimitId(null);
  };

  const saveAvailable = async (account: any) => {
    const id = Number(account?.id);
    if (!Number.isFinite(id)) return;

    const raw = (limitDraft[id] ?? '').trim().replace(',', '.');
    const desiredAvailable = Number(raw);
    if (!Number.isFinite(desiredAvailable) || desiredAvailable < 0) {
      toast.error(t('common.fillRequired'));
      return;
    }

    const withdrawn = Number(account?.withdrawnAmount ?? 0);
    const newLimit = desiredAvailable + (Number.isFinite(withdrawn) ? withdrawn : 0);

    setLimitUpdatingId(id);
    try {
      await apiClient.patch(`/bank-accounts/${id}`, { limit: newLimit });

      // If available becomes 0, we treat it as reaching the limit: status=blocked and move to the end.
      if (desiredAvailable <= 0) {
        await bankAccountsService.updateStatus(String(id), 'blocked');
        await reorderAndPersistPriorities(id, Number.MAX_SAFE_INTEGER, { fetchFresh: true });
        setEditingLimitId(null);
        return;
      }

      // If it was blocked due to limit but we increased available again, switch back to working.
      if (String(account?.status) === 'blocked') {
        await bankAccountsService.updateStatus(String(id), 'working');
      }

      await loadAccounts();
      setEditingLimitId(null);
    } catch (error: any) {
      console.error('Failed to update available limit:', error);
      toast.error(error?.response?.data?.message || t('common.error'));
    } finally {
      setLimitUpdatingId(null);
    }
  };

  const normalizePriority = (value: any) => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 999999;
  };

  const sortAccountsStable = (list: any[]) => {
    return [...list].sort((a, b) => {
      const pa = normalizePriority(a?.priority);
      const pb = normalizePriority(b?.priority);
      if (pa !== pb) return pa - pb;
      const da = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    });
  };

  const buildReorderedPriorities = (list: any[], targetId: number, targetPriority: number) => {
    const desiredPriority = Math.max(1, Math.floor(Number(targetPriority) || 1));
    const target = list.find((a) => a?.id === targetId);
    const others = sortAccountsStable(list.filter((a) => a?.id !== targetId));

    const ordered: any[] = [];
    const insertIndex = Math.max(0, desiredPriority - 1);

    for (let i = 0; i < others.length; i++) {
      if (ordered.length === insertIndex && target) {
        ordered.push(target);
      }
      ordered.push(others[i]);
    }

    if (target && !ordered.some((a) => a?.id === targetId)) {
      ordered.push(target);
    }

    return ordered.map((a, idx) => ({
      id: a.id,
      priority: idx + 1,
      currentPriority: normalizePriority(a?.priority),
    }));
  };

  const animateReorder = () => {
    setTimeout(() => {
      requestAnimationFrame(() => {
        rowRefs.current.forEach((row, id) => {
          if (!row) return;
          const oldPos = positionsRef.current.get(id);
          if (!oldPos) return;
          const newPos = row.getBoundingClientRect();
          const deltaY = oldPos.top - newPos.top;
          if (Math.abs(deltaY) <= 1) return;

          row.style.transform = `translateY(${deltaY}px)`;
          row.style.transition = 'none';

          requestAnimationFrame(() => {
            row.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            row.style.transform = 'translateY(0)';

            setTimeout(() => {
              row.style.transition = '';
              row.style.transform = '';
            }, 800);
          });
        });
      });
    }, 10);
  };

  const reorderAndPersistPriorities = async (
    targetId: number,
    targetPriority: number,
    opts?: { fetchFresh?: boolean },
  ) => {
    setUpdating(targetId);

    try {
      // Capture old positions for animation
      positionsRef.current.clear();
      rowRefs.current.forEach((row, id) => {
        if (row) {
          positionsRef.current.set(id, row.getBoundingClientRect());
        }
      });

      const sourceList = opts?.fetchFresh
        ? (await bankAccountsService.getAll()).items || []
        : accounts;

      const updates = buildReorderedPriorities(sourceList, targetId, targetPriority)
        .filter((u) => u.currentPriority !== u.priority);

      for (const u of updates) {
        await bankAccountsService.updatePriority(String(u.id), u.priority);
      }

      await loadAccounts();
      animateReorder();
    } catch (error) {
      console.error('Failed to reorder priorities:', error);
      await loadAccounts();
    } finally {
      setUpdating(null);
    }
  };

  const handlePriorityChange = async (accountId: number, newPriority: number) => {
    if (isNaN(newPriority)) return;

    await reorderAndPersistPriorities(accountId, newPriority);
  };

  const handlePriorityInput = (accountId: number, newValue: string) => {
    // Разрешаем пустое поле и любые цифры при вводе
    // Блокируем только если явно больше 99
    if (newValue !== '') {
      const numValue = parseInt(newValue);
      if (!isNaN(numValue) && numValue > 99) {
        return; // Не даем ввести больше 99
      }
    }
    
    // Локальное обновление при вводе (сохраняем как есть)
    setAccounts(prevAccounts => 
      prevAccounts.map(account => 
        account.id === accountId 
          ? { ...account, priority: newValue === '' ? '' as any : parseInt(newValue) || '' as any }
          : account
      )
    );
  };

  const getStatusBadge = (account: any) => {
    const status = String(account?.status ?? '');
    const available = Number(account?.currentLimitAmount ?? 0);

    if (status === 'blocked' || (status === 'working' && available <= 0)) {
      return { label: t('bankAccounts.statusLimitReached'), className: 'status-limit-reached' };
    }

    if (status === 'working') {
      return { label: t('bankAccounts.statusWorking'), className: 'status-working' };
    }

    if (status === 'not_working') {
      return { label: t('bankAccounts.statusNotWorking'), className: 'status-not-working' };
    }

    return { label: status || '-', className: '' };
  };

  const canEditStatus = user?.role === UserRole.ADMIN || user?.role === UserRole.TEAMLEAD;

  const updateAccountStatus = async (accountId: number, status: 'working' | 'not_working') => {
    setStatusUpdatingId(accountId);
    try {
      await bankAccountsService.updateStatus(String(accountId), status);
      await loadAccounts();
    } catch (error: any) {
      console.error('Failed to update status:', error);
      toast.error(error?.response?.data?.message || t('common.error'));
    } finally {
      setStatusUpdatingId(null);
      setOpenStatusDropdownId(null);
    }
  };

  const requestDeleteRequisite = (account: any) => {
    const id = Number(account?.id);
    if (!Number.isFinite(id)) return;

    const withdrawn = Number(account?.withdrawnAmount ?? 0);
    if (Number.isFinite(withdrawn) && withdrawn > 0) {
      return;
    }

    setDeleteConfirmAccount(account);
  };

  const confirmDeleteRequisite = async () => {
    const account = deleteConfirmAccount;
    const id = Number(account?.id);
    if (!Number.isFinite(id)) return;

    const withdrawn = Number(account?.withdrawnAmount ?? 0);
    if (Number.isFinite(withdrawn) && withdrawn > 0) {
      return;
    }

    setUpdating(id);
    try {
      await bankAccountsService.delete(String(id));
      toast.success(t('teamlead.requisiteDeleted'));
      await loadAccounts();
    } catch (error: any) {
      console.error('Failed to delete requisite:', error);
      toast.error(error?.response?.data?.message || t('teamlead.requisiteDeleteError'));
    } finally {
      setUpdating(null);
      setDeleteConfirmAccount(null);
    }
  };

  if (loading) {
    return (
      <div className="section requisites-section">
        <div className="section-header">
          <h2>{t('teamlead.requisitesTitle')}</h2>
          {canCreateRequisite && (
            <button
              className="btn btn-primary teamlead-create-requisite-btn"
              type="button"
              onClick={openCreateModal}
            >
              {t('teamlead.createRequisite')}
            </button>
          )}
        </div>
        <div className="section-content">
          <p className="placeholder">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section requisites-section">
      <div className="section-header">
        <h2>{t('teamlead.requisitesTitle')}</h2>
        {canCreateRequisite && (
          <button
            className="btn btn-primary teamlead-create-requisite-btn"
            type="button"
            onClick={openCreateModal}
          >
            {t('teamlead.createRequisite')}
          </button>
        )}
      </div>
      <div className="section-content">
        <div className="requisites-table">
          <table>
            <thead>
              <tr>
                <th>Приоритет</th>
                <th>Банк</th>
                <th>CBU</th>
                <th>Alias</th>
                <th>Статус</th>
                <th>Выведенно / Доступно</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => {
                const status = getStatusBadge(account);
                const currentLimitAmount = account.currentLimitAmount || 0;
                const withdrawn = account.withdrawnAmount || 0;
                const available = currentLimitAmount;
                const canDeleteThis =
                  canCreateRequisite && Number(withdrawn) <= 0 && updating !== account.id;
                return (
                  <tr 
                    key={account.id}
                    ref={(el) => {
                      if (el) {
                        rowRefs.current.set(account.id, el);
                      } else {
                        rowRefs.current.delete(account.id);
                      }
                    }}
                    className={[
                      updating === account.id ? 'updating-row' : '',
                      highlightedId === account.id ? 'requisite-highlight' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <td>
                      <input
                        type="number"
                        value={account.priority === '' ? '' : (account.priority || 1)}
                        onChange={(e) => handlePriorityInput(account.id, e.target.value)}
                        onBlur={(e) => {
                          const value = parseInt(e.target.value) || 1;
                          const validValue = Math.max(1, Math.min(99, value));
                          handlePriorityChange(account.id, validValue);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur();
                          }
                        }}
                        disabled={updating === account.id}
                        className="priority-input"
                        min="1"
                        max="99"
                      />
                    </td>
                    <td>{account.bank?.name || account.bankName || '-'}</td>
                    <td className="cbu-cell">{account.cbu || '-'}</td>
                    <td>{account.alias || '-'}</td>
                    <td>
                      {canEditStatus ? (
                        <div className="status-custom-select">
                          <button
                            type="button"
                            className="status-select-trigger"
                            disabled={statusUpdatingId === account.id || updating === account.id}
                            onClick={() =>
                              setOpenStatusDropdownId(
                                openStatusDropdownId === account.id ? null : account.id,
                              )
                            }
                          >
                            <span className={`status-badge ${status.className}`}>
                              {status.label}
                            </span>
                          </button>

                          {openStatusDropdownId === account.id && (
                            <div className="modal-dropdown status-dropdown">
                              <div
                                className={`modal-option ${account.status === 'working' ? 'active' : ''}`}
                                onClick={() => updateAccountStatus(account.id, 'working')}
                              >
                                {t('bankAccounts.statusWorking')}
                              </div>
                              <div
                                className={`modal-option ${account.status === 'not_working' ? 'active' : ''}`}
                                onClick={() => updateAccountStatus(account.id, 'not_working')}
                              >
                                {t('bankAccounts.statusNotWorking')}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className={`status-badge ${status.className}`}>
                          {status.label}
                        </span>
                      )}
                    </td>
                    <td className="amount-cell">
                      ${withdrawn.toFixed(2)} /
                      {editingLimitId === account.id ? (
                        <input
                          className="available-edit-input"
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="0.01"
                          value={limitDraft[account.id] ?? ''}
                          disabled={limitUpdatingId === account.id}
                          autoFocus
                          onChange={(e) =>
                            setLimitDraft((prev) => ({ ...prev, [account.id]: e.target.value }))
                          }
                          onBlur={() => saveAvailable(account)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur();
                            }
                            if (e.key === 'Escape') {
                              cancelEditAvailable();
                            }
                          }}
                        />
                      ) : (
                        <button
                          type="button"
                          className="available-edit-button"
                          disabled={limitUpdatingId === account.id}
                          onClick={() => startEditAvailable(account)}
                        >
                          ${available.toFixed(2)}
                        </button>
                      )}
                      {(updating === account.id || limitUpdatingId === account.id) && (
                        <span className="saving-indicator"> (сохранение...)</span>
                      )}
                    </td>
                    <td className="requisite-actions-cell">
                      {canCreateRequisite && Number(withdrawn) <= 0 && (
                        <button
                          type="button"
                          className="requisite-delete-btn"
                          disabled={!canDeleteThis}
                          onClick={() => requestDeleteRequisite(account)}
                        >
                          {t('teamlead.deleteRequisite')}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {deleteConfirmAccount && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmAccount(null)}>
          <div
            className="modal-content modal-small teamlead-delete-requisite-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{t('teamlead.deleteRequisiteTitle')}</h2>
              <button className="modal-close" onClick={() => setDeleteConfirmAccount(null)}>
                ×
              </button>
            </div>

            <div className="modal-body teamlead-delete-requisite-body">
              <p className="teamlead-delete-requisite-text">{t('teamlead.deleteRequisiteConfirm')}</p>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeleteConfirmAccount(null)}
                disabled={updating === Number(deleteConfirmAccount?.id)}
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={confirmDeleteRequisite}
                disabled={updating === Number(deleteConfirmAccount?.id)}
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {canCreateRequisite && isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-content modal-medium teamlead-create-requisite-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('teamlead.createRequisiteTitle')}</h2>
              <button className="modal-close" onClick={() => setIsCreateModalOpen(false)}>×</button>
            </div>

            <form onSubmit={submitCreate}>
              <div className="form-group">
                <label>{t('teamlead.fields.bank')} *</label>
                <div className="modal-custom-select">
                  <button
                    type="button"
                    className="modal-select-button"
                    disabled={optionsLoading || creating}
                    onClick={() =>
                      setOpenCreateDropdown(openCreateDropdown === 'bank' ? null : 'bank')
                    }
                  >
                    <span>
                      {createForm.bankId
                        ? banks.find((b) => String(b.id) === String(createForm.bankId))?.name
                        : optionsLoading
                          ? t('common.loading')
                          : t('teamlead.selectBank')}
                    </span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                    </svg>
                  </button>

                  {openCreateDropdown === 'bank' && (
                    <div className="modal-dropdown">
                      <div
                        className={`modal-option ${!createForm.bankId ? 'active' : ''}`}
                        onClick={() => {
                          setCreateForm((p) => ({ ...p, bankId: '' }));
                          setOpenCreateDropdown(null);
                        }}
                      >
                        {t('teamlead.selectBank')}
                      </div>
                      {banks.map((b) => (
                        <div
                          key={String(b.id)}
                          className={`modal-option ${String(createForm.bankId) === String(b.id) ? 'active' : ''}`}
                          onClick={() => {
                            setCreateForm((p) => ({ ...p, bankId: String(b.id) }));
                            setOpenCreateDropdown(null);
                          }}
                        >
                          {b.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>{t('teamlead.fields.drop')} *</label>
                <div className="modal-custom-select">
                  <button
                    type="button"
                    className="modal-select-button"
                    disabled={optionsLoading || creating}
                    onClick={() =>
                      setOpenCreateDropdown(openCreateDropdown === 'drop' ? null : 'drop')
                    }
                  >
                    <span>
                      {createForm.dropId
                        ? drops.find((d) => String(d.id) === String(createForm.dropId))?.name
                        : optionsLoading
                          ? t('common.loading')
                          : t('teamlead.selectDrop')}
                    </span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                    </svg>
                  </button>

                  {openCreateDropdown === 'drop' && (
                    <div className="modal-dropdown">
                      <div
                        className={`modal-option ${!createForm.dropId ? 'active' : ''}`}
                        onClick={() => {
                          setCreateForm((p) => ({ ...p, dropId: '' }));
                          setOpenCreateDropdown(null);
                        }}
                      >
                        {t('teamlead.selectDrop')}
                      </div>
                      {drops.map((d) => (
                        <div
                          key={String(d.id)}
                          className={`modal-option ${String(createForm.dropId) === String(d.id) ? 'active' : ''}`}
                          onClick={() => {
                            setCreateForm((p) => ({ ...p, dropId: String(d.id) }));
                            setOpenCreateDropdown(null);
                          }}
                        >
                          {d.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>{t('teamlead.fields.cbu')} *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={createForm.cbu}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, cbu: e.target.value.trim() }))}
                  placeholder="1234567890123456789012"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>{t('teamlead.fields.alias')} *</label>
                <input
                  type="text"
                  value={createForm.alias}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, alias: e.target.value }))}
                  placeholder="john.doe.wallet"
                  required
                />
              </div>

              <div className="form-group">
                <label>{t('teamlead.fields.initialLimitAmount')} *</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={createForm.initialLimitAmount}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, initialLimitAmount: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label>{t('teamlead.fields.priority')} *</label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  step="1"
                  value={createForm.priority}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, priority: e.target.value }))}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? t('common.saving') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Секция обналички песо
function WithdrawalsSection() {
  const { t } = useTranslation();
  const [withdrawals, setWithdrawals] = useState<CashWithdrawal[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [selectedBankAccount, setSelectedBankAccount] = useState<any | null>(null);
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);
  const [banks, setBanks] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    amountPesos: '',
    comment: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accountsData, withdrawalsResponse] = await Promise.all([
        bankAccountsService.getAll(),
        cashWithdrawalsService.getAllWithdrawals(),
      ]);
      const accounts = accountsData.items || [];
      
      setBankAccounts(accounts);
      setWithdrawals(withdrawalsResponse.items as any);
      
      // Получаем уникальные банки по bankName (используем alias для определения банка)
      const banksMap = new Map();
      accounts.forEach((acc: any) => {
        if (acc.bankName) {
          // Создаем уникальный ID на основе имени банка
          const bankId = acc.bankName;
          if (!banksMap.has(bankId)) {
            banksMap.set(bankId, {
              id: bankId,
              name: acc.bankName
            });
          }
        }
      });
      
      const uniqueBanks = Array.from(banksMap.values());
      
      setBanks(uniqueBanks);
      
      // Выбираем первый банк по умолчанию
      if (uniqueBanks.length > 0) {
        setSelectedBankId(uniqueBanks[0].id);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setBankAccounts([]);
      setWithdrawals([]);
      setBanks([]);
    } finally {
      setLoading(false);
    }
  };

  const openWithdrawModal = (account: any) => {
    setSelectedBankAccount(account);
    setFormData({ amountPesos: '', comment: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBankAccount || !formData.amountPesos) {
      toast.error(t('common.fillRequired'));
      return;
    }

    try {
      await cashWithdrawalsService.withdraw({
        bankAccountId: selectedBankAccount.id,
        amountPesos: parseFloat(formData.amountPesos),
        comment: formData.comment || undefined,
      });
      
      toast.success(t('teamlead.withdrawalCreated'));
      setIsModalOpen(false);
      setSelectedBankAccount(null);
      setFormData({ amountPesos: '', comment: '' });
      loadData();
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      toast.error(error.response?.data?.message || t('teamlead.withdrawalError'));
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getWithdrawalsForAccount = (accountId: number) => {
    return withdrawals.filter(w => w.bankAccountId === accountId);
  };

  const getStatusBadge = (status: string) => {
    return status === 'converted' ? 'status-success' : 'status-pending';
  };

  const filteredAccounts = selectedBankId 
    ? bankAccounts.filter(acc => acc.bankName === selectedBankId)
    : [];

  if (loading) {
    return (
      <div className="section withdrawals-section">
        <div className="section-header">
          <h2>{t('teamlead.withdrawalsTitle')}</h2>
          <p className="section-description">{t('teamlead.withdrawalsDescription')}</p>
        </div>
        <div className="section-content">
          <p className="placeholder">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section withdrawals-section">
      <div className="section-header">
        <h2>{t('teamlead.withdrawalsTitle')}</h2>
        <p className="section-description">{t('teamlead.withdrawalsDescription')}</p>
      </div>

      {/* Bank Selector */}
      <div className="bank-selector">
        {banks.length > 0 ? (
          banks.map((bank) => (
            <button
              key={bank.id}
              className={`bank-selector-btn ${selectedBankId === bank.id ? 'active' : ''}`}
              onClick={() => setSelectedBankId(bank.id)}
            >
              🏦 {bank.name}
            </button>
          ))
        ) : (
          <p className="placeholder">{t('common.loading')}</p>
        )}
      </div>
      
      <div className="section-content">
        {filteredAccounts.length > 0 ? (
          <div className="bank-accounts-grid">
            {filteredAccounts.map((account) => {
              const accountWithdrawals = getWithdrawalsForAccount(account.id);
              const availableBalance = account.withdrawnAmount || 0;
              
              return (
                <div key={account.id} className="bank-account-card">
                  <div className="bank-account-header">
                    <div className="bank-account-info">
                      <h3>💳 {account.alias || `Счет #${account.id}`}</h3>
                      <p className="bank-account-details">
                        <span>CBU: {account.cbu}</span>
                      </p>
                      <p className="bank-account-balance">
                        {t('teamlead.availableForWithdrawal')}: <strong>${availableBalance.toLocaleString()} ARS</strong>
                      </p>
                    </div>
                    <button 
                      className="btn btn-primary btn-withdraw"
                      onClick={() => openWithdrawModal(account)}
                      disabled={availableBalance <= 0}
                    >
                      <DollarSign size={18} />
                      {t('teamlead.withdraw')}
                    </button>
                  </div>

                  <div className="bank-account-history">
                    <h4>{t('teamlead.withdrawalHistory')}</h4>
                    {accountWithdrawals.length > 0 ? (
                      <div className="withdrawal-history-list">
                        {accountWithdrawals.map((withdrawal) => (
                          <div key={withdrawal.id} className="withdrawal-history-item">
                            <div className="withdrawal-info">
                              <span className="withdrawal-date">{formatDate(withdrawal.createdAt)}</span>
                              <span className="withdrawal-user">
                                👤 {(withdrawal as any).withdrawnByUser?.username || `User #${withdrawal.withdrawnByUserId}`}
                              </span>
                              <span className="withdrawal-amount">${withdrawal.amountPesos.toLocaleString()}</span>
                              <span className="withdrawal-rate">@ {withdrawal.withdrawalRate.toFixed(2)}</span>
                              <span className={`status-badge ${getStatusBadge(withdrawal.status)}`}>
                                {withdrawal.status === 'converted' ? t('teamlead.converted') : t('teamlead.pending')}
                              </span>
                            </div>
                            {withdrawal.comment && (
                              <p className="withdrawal-comment">💬 {withdrawal.comment}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="history-empty">{t('teamlead.historyEmpty')}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="placeholder">
            {selectedBankId ? t('teamlead.noAccountsForBank') : t('teamlead.selectBank')}
          </p>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && selectedBankAccount && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('teamlead.withdrawFrom')} {selectedBankAccount.bank?.name}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>

            <div className="bank-info">
              <p><strong>{t('teamlead.dropAccount')}:</strong> {selectedBankAccount.alias || `#${selectedBankAccount.id}`}</p>
              <p><strong>CBU:</strong> {selectedBankAccount.cbu}</p>
              <p><strong>{t('teamlead.availableForWithdrawal')}:</strong> ${(selectedBankAccount.withdrawnAmount || 0).toLocaleString()} ARS</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t('teamlead.amountPesos')} *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selectedBankAccount.withdrawnAmount || 0}
                  value={formData.amountPesos}
                  onChange={(e) => {
                    const value = e.target.value;
                    const maxAmount = selectedBankAccount.withdrawnAmount || 0;
                    
                    if (value === '') {
                      setFormData({ ...formData, amountPesos: value });
                    } else {
                      const numValue = parseFloat(value);
                      if (numValue > maxAmount) {
                        setFormData({ ...formData, amountPesos: maxAmount.toString() });
                      } else {
                        setFormData({ ...formData, amountPesos: value });
                      }
                    }
                  }}
                  placeholder="100000.00"
                  required
                  autoFocus
                />
                <p className="helper-text">
                  {t('teamlead.maxAmount')}: ${(selectedBankAccount.withdrawnAmount || 0).toLocaleString()} ARS
                </p>
              </div>

              <div className="form-group">
                <label>{t('teamlead.comment')}</label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder={t('teamlead.commentPlaceholder')}
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t('teamlead.withdraw')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Секция конвертации в USDT
function ConversionsSection() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [conversions, setConversions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    amountPesos: '',
    exchangeRate: '',
    comment: '',
  });

  const calculatedUsdt = formData.amountPesos && formData.exchangeRate
    ? (parseFloat(formData.amountPesos) / parseFloat(formData.exchangeRate)).toFixed(2)
    : '0.00';

  // Подсчитать общую сумму собранных пesos текущим пользователем (только pending)
  // Подсчитать общую сумму собранных pesos текущим пользователем (только pending)
  const totalCollectedPesos = useMemo(() => {
    if (!Array.isArray(withdrawals) || !user?.id) return 0;
    
    return withdrawals
      .filter(w => 
        w?.withdrawnByUser?.id && 
        String(w.withdrawnByUser.id) === String(user.id) &&
        w?.status === 'pending' // Только те, что еще не отправлены в конвертацию
      )
      .reduce((sum, w) => sum + (Number(w.amountPesos) || 0), 0);
  }, [withdrawals, user?.id]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [conversionsData, withdrawalsData] = await Promise.all([
        cashWithdrawalsService.getAllConversions(),
        cashWithdrawalsService.getAllWithdrawals(),
      ]);
      
      // Проверяем разные возможные структуры ответа
      let conversionsArray: any[] = [];
      if (Array.isArray(conversionsData)) {
        conversionsArray = conversionsData;
      } else if (conversionsData && Array.isArray(conversionsData.conversions)) {
        conversionsArray = conversionsData.conversions;
      }
      
      let withdrawalsArray: any[] = [];
      if (Array.isArray(withdrawalsData)) {
        withdrawalsArray = withdrawalsData;
      } else if (withdrawalsData && Array.isArray(withdrawalsData.items)) {
        withdrawalsArray = withdrawalsData.items;
      }
      
      setConversions(conversionsArray);
      setWithdrawals(withdrawalsArray);
    } catch (error) {
      console.error('Failed to load data:', error);
      setConversions([]);
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openModal = () => {
    setFormData({
      amountPesos: '',
      exchangeRate: '',
      comment: '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amountPesos || !formData.exchangeRate) {
      toast.error(t('common.fillRequired'));
      return;
    }

    try {
      await cashWithdrawalsService.directConvert({
        amountPesos: parseFloat(formData.amountPesos),
        exchangeRate: parseFloat(formData.exchangeRate),
        comment: formData.comment || undefined,
      });
      
      toast.success(t('teamlead.usdtAdded'));
      setIsModalOpen(false);
      setFormData({ amountPesos: '', exchangeRate: '', comment: '' });
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('teamlead.conversionError'));
    }
  };

  const handleConfirm = async (id: number) => {
    try {
      await cashWithdrawalsService.confirmConversion(id);
      toast.success(t('teamlead.conversionConfirmed'));
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('teamlead.confirmError'));
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="section conversions-section">
        <div className="section-header">
          <h2>{t('teamlead.conversionsTitle')}</h2>
          <p className="section-description">{t('teamlead.conversionsDescription')}</p>
        </div>
        <div className="section-content">
          <p className="placeholder">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section conversions-section">
      <div className="section-header">
        <div>
          <h2>{t('teamlead.conversionsTitle')}</h2>
          <p className="section-description">{t('teamlead.conversionsDescription')}</p>
        </div>
        <button className="btn btn-primary" onClick={openModal}>
          <ArrowRightLeft size={20} />
          {t('teamlead.addUsdt')}
        </button>
      </div>
      
      <div className="section-content">
        {loading ? (
          <p className="placeholder">{t('common.loading')}</p>
        ) : Array.isArray(conversions) && conversions.length > 0 ? (
          <div className="conversions-grid">
            {conversions.map((conversion) => {
              // Защита от undefined/null значений и преобразование строк в числа
              const usdtAmount = Number(conversion?.usdtAmount) || 0;
              const pesosAmount = Number(conversion?.pesosAmount) || 0;
              const exchangeRate = Number(conversion?.exchangeRate) || 0;
              const status = conversion?.status ?? 'pending';
              const convertedByUser = conversion?.convertedByUser?.username ?? 'Unknown';
              const withdrawnByUser = conversion?.withdrawnByUser?.username;
              const createdAt = conversion?.createdAt ?? new Date().toISOString();
              
              return (
                <div key={conversion.id} className="conversion-card">
                  <div className="conversion-header">
                    <div className="conversion-amount">
                      <span className="conversion-usdt">{usdtAmount.toFixed(2)} USDT</span>
                      <span className="conversion-pesos">{pesosAmount.toLocaleString()} ARS</span>
                    </div>
                    <span className={`conversion-status status-${status}`}>
                      {status === 'pending' ? t('teamlead.statusPending') : t('teamlead.statusConfirmed')}
                    </span>
                  </div>

                  <div className="conversion-details">
                    <div className="conversion-row">
                      <span className="detail-label">{t('teamlead.exchangeRate')}:</span>
                      <span className="detail-value">{exchangeRate.toFixed(2)}</span>
                    </div>
                    <div className="conversion-row">
                      <span className="detail-label">{t('teamlead.convertedBy')}:</span>
                      <span className="detail-value">{convertedByUser}</span>
                    </div>
                    {withdrawnByUser && (
                      <div className="conversion-row">
                        <span className="detail-label">{t('teamlead.withdrawnBy')}:</span>
                        <span className="detail-value">{withdrawnByUser}</span>
                      </div>
                    )}
                    <div className="conversion-row">
                      <span className="detail-label">{t('teamlead.date')}:</span>
                      <span className="detail-value">{formatDate(createdAt)}</span>
                    </div>
                  </div>

                  {user?.role === 'admin' && status === 'pending' && (
                    <button 
                      className="btn btn-success btn-confirm"
                      onClick={() => handleConfirm(conversion.id)}
                    >
                      <Award size={16} />
                      {t('teamlead.confirmReceipt')}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="placeholder">{t('teamlead.noConversionsYet')}</p>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content modal-medium" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('teamlead.addUsdt')}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>

            <div className="user-balance-info">
              <p><strong>💰 {t('teamlead.yourCollectedPesos')}:</strong> ${totalCollectedPesos.toLocaleString()} ARS</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t('teamlead.amountPesos')} *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={totalCollectedPesos || 0}
                  value={formData.amountPesos}
                  onChange={(e) => {
                    const value = e.target.value;
                    const maxAmount = totalCollectedPesos || 0;
                    
                    if (value === '') {
                      setFormData({ ...formData, amountPesos: value });
                    } else {
                      const numValue = parseFloat(value);
                      if (numValue > maxAmount) {
                        setFormData({ ...formData, amountPesos: maxAmount.toString() });
                      } else {
                        setFormData({ ...formData, amountPesos: value });
                      }
                    }
                  }}
                  placeholder="100000.00"
                  required
                  autoFocus
                />
                {totalCollectedPesos > 0 && (
                  <small className="form-help-text">
                    {t('teamlead.maxAmount')}: ${totalCollectedPesos.toLocaleString()} ARS
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>{t('teamlead.exchangeRate')} *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.exchangeRate}
                  onChange={(e) => setFormData({ ...formData, exchangeRate: e.target.value })}
                  placeholder="1050.00"
                  required
                />
              </div>

              <div className="form-group">
                <label>{t('teamlead.comment')}</label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder={t('teamlead.commentPlaceholder')}
                  rows={3}
                />
              </div>

              {formData.amountPesos && formData.exchangeRate && (
                <div className="conversion-result">
                  <div className="result-box">
                    <span className="result-label">{t('teamlead.youWillReceive')}:</span>
                    <span className="result-value">{calculatedUsdt} USDT</span>
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t('teamlead.addUsdt')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
