import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, DollarSign } from 'lucide-react';
import dropNeoBanksService, { DropNeoBank, CreateDropNeoBankDto, UpdateDropNeoBankDto } from '../../services/drop-neo-banks.service';
import { dropsService, Drop } from '../../services/drops.service';
import './DropNeoBanks.css';

const PROVIDERS = [
  { value: 'ripio', label: 'Ripio' },
  { value: 'lemon_cash', label: 'Lemon Cash' },
  { value: 'satoshi_tango', label: 'Satoshi Tango' },
  { value: 'yont', label: 'Yont' },
];

export default function DropNeoBanks() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [editingNeoBank, setEditingNeoBank] = useState<DropNeoBank | null>(null);
  const [balanceNeoBank, setBalanceNeoBank] = useState<DropNeoBank | null>(null);
  const [filterDropId, setFilterDropId] = useState<number | undefined>();
  const [filterProvider, setFilterProvider] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Форма
  const [formData, setFormData] = useState<CreateDropNeoBankDto>({
    dropId: 0,
    provider: 'ripio',
    accountId: '',
    currentBalance: 0,
    comment: '',
  });

  const [balanceAmount, setBalanceAmount] = useState<string>('');

  // Получить все нео-банки
  const { data: neoBanks, isLoading } = useQuery({
    queryKey: ['drop-neo-banks', filterDropId, filterProvider, filterStatus],
    queryFn: () => dropNeoBanksService.getAll({ 
      dropId: filterDropId, 
      provider: filterProvider || undefined,
      status: filterStatus || undefined 
    }),
  });

  // Получить дропы для селектора
  const { data: drops } = useQuery({
    queryKey: ['drops'],
    queryFn: () => dropsService.getAll({}),
  });

  // Создать нео-банк
  const createMutation = useMutation({
    mutationFn: (data: CreateDropNeoBankDto) => dropNeoBanksService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drop-neo-banks'] });
      toast.success(t('dropNeoBanks.messages.created'));
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('dropNeoBanks.messages.createError'));
    },
  });

  // Обновить нео-банк
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDropNeoBankDto }) => 
      dropNeoBanksService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drop-neo-banks'] });
      toast.success(t('dropNeoBanks.messages.updated'));
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('dropNeoBanks.messages.updateError'));
    },
  });

  // Обновить баланс
  const updateBalanceMutation = useMutation({
    mutationFn: ({ id, balance }: { id: number; balance: number }) => 
      dropNeoBanksService.updateBalance(id, { balance }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drop-neo-banks'] });
      toast.success('Balance updated successfully');
      closeBalanceModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update balance');
    },
  });

  // Удалить нео-банк
  const deleteMutation = useMutation({
    mutationFn: (id: number) => dropNeoBanksService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drop-neo-banks'] });
      toast.success('Neo-bank deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete neo-bank');
    },
  });

  const openCreateModal = () => {
    setEditingNeoBank(null);
    setFormData({
      dropId: 0,
      provider: 'ripio',
      accountId: '',
      currentBalance: 0,
      comment: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (neoBank: DropNeoBank) => {
    setEditingNeoBank(neoBank);
    setFormData({
      dropId: neoBank.drop?.id || 0,
      provider: neoBank.provider,
      accountId: neoBank.accountId,
      currentBalance: neoBank.currentBalance,
      comment: neoBank.comment,
    });
    setIsModalOpen(true);
  };

  const openBalanceModal = (neoBank: DropNeoBank) => {
    setBalanceNeoBank(neoBank);
    setBalanceAmount(neoBank.currentBalance.toString());
    setIsBalanceModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNeoBank(null);
  };

  const closeBalanceModal = () => {
    setIsBalanceModalOpen(false);
    setBalanceNeoBank(null);
    setBalanceAmount('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingNeoBank) {
      updateMutation.mutate({
        id: editingNeoBank.id,
        data: {
          accountId: formData.accountId,
          currentBalance: formData.currentBalance,
          comment: formData.comment,
        },
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleUpdateBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!balanceNeoBank) return;

    updateBalanceMutation.mutate({
      id: balanceNeoBank.id,
      balance: Number(balanceAmount),
    });
  };

  const handleDelete = (id: number) => {
    if (confirm(t('dropNeoBanks.deleteConfirm'))) {
      deleteMutation.mutate(id);
    }
  };

  const getProviderBadgeClass = (provider: string) => {
    const classes = {
      ripio: 'badge-ripio',
      lemon_cash: 'badge-lemon',
      satoshi_tango: 'badge-satoshi',
      yont: 'badge-yont',
    };
    return classes[provider as keyof typeof classes] || 'badge-default';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (isLoading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  return (
    <div className="drop-neo-banks-page">
      <div className="page-header">
        <div>
          <h1>{t('dropNeoBanks.title')}</h1>
          <p className="page-description">
            {t('dropNeoBanks.subtitle')}
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={20} />
          {t('dropNeoBanks.addNeoBank')}
        </button>
      </div>

      {/* Filters */}
      <div className="filters">
        <select
          value={filterDropId || ''}
          onChange={(e) => setFilterDropId(e.target.value ? Number(e.target.value) : undefined)}
          className="filter-select"
        >
          <option value="">{t('dropNeoBanks.filters.allDrops')}</option>
          {drops?.items.map((drop: Drop) => (
            <option key={drop.id} value={drop.id}>
              {drop.name}
            </option>
          ))}
        </select>

        <select
          value={filterProvider}
          onChange={(e) => setFilterProvider(e.target.value)}
          className="filter-select"
        >
          <option value="">{t('dropNeoBanks.filters.allProviders')}</option>
          {PROVIDERS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="">{t('dropNeoBanks.filters.allStatuses')}</option>
          <option value="active">{t('statuses.active')}</option>
          <option value="frozen">{t('statuses.frozen')}</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('dropNeoBanks.table.drop')}</th>
              <th>{t('dropNeoBanks.table.provider')}</th>
              <th>{t('dropNeoBanks.table.accountId')}</th>
              <th>{t('dropNeoBanks.table.currentBalance')}</th>
              <th>{t('dropNeoBanks.table.status')}</th>
              <th>{t('dropNeoBanks.table.comment')}</th>
              <th>{t('dropNeoBanks.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {neoBanks?.items.map((neoBank: DropNeoBank) => (
              <tr key={neoBank.id}>
                <td>
                  <div className="drop-cell">
                    <strong>{neoBank.drop?.name || '-'}</strong>
                  </div>
                </td>
                <td>
                  <span className={`badge ${getProviderBadgeClass(neoBank.provider)}`}>
                    {PROVIDERS.find(p => p.value === neoBank.provider)?.label}
                  </span>
                </td>
                <td>
                  <code>{neoBank.accountId}</code>
                </td>
                <td>
                  <strong>{formatCurrency(neoBank.currentBalance)}</strong>
                </td>
                <td>
                  <span className={`badge ${neoBank.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                    {t(`statuses.${neoBank.status}`)}
                  </span>
                </td>
                <td>
                  <span className="comment-text">{neoBank.comment || '-'}</span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-icon btn-icon-primary"
                      onClick={() => openBalanceModal(neoBank)}
                      title={t('dropNeoBanks.actions.updateBalanceTitle')}
                    >
                      <DollarSign size={16} />
                    </button>
                    <button
                      className="btn-icon btn-icon-secondary"
                      onClick={() => openEditModal(neoBank)}
                      title={t('dropNeoBanks.actions.edit')}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="btn-icon btn-icon-danger"
                      onClick={() => handleDelete(neoBank.id)}
                      title={t('dropNeoBanks.actions.delete')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {neoBanks?.items.length === 0 && (
          <div className="empty-state">
            <p>{t('dropNeoBanks.messages.notFound')}</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingNeoBank ? t('dropNeoBanks.editNeoBank') : t('dropNeoBanks.addNeoBank')}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t('dropNeoBanks.form.drop')} *</label>
                <select
                  value={formData.dropId}
                  onChange={(e) => setFormData({ ...formData, dropId: Number(e.target.value) })}
                  required
                  disabled={!!editingNeoBank}
                >
                  <option value={0}>{t('dropNeoBanks.form.selectDrop')}</option>
                  {drops?.items.map((drop: Drop) => (
                    <option key={drop.id} value={drop.id}>
                      {drop.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{t('dropNeoBanks.form.provider')} *</label>
                <select
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value as any })}
                  required
                  disabled={!!editingNeoBank}
                >
                  {PROVIDERS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{t('dropNeoBanks.form.accountId')} *</label>
                <input
                  type="text"
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                  placeholder={t('dropNeoBanks.form.accountIdPlaceholder')}
                  required
                />
              </div>

              <div className="form-group">
                <label>{t('dropNeoBanks.form.initialBalance')}</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.currentBalance}
                  onChange={(e) => setFormData({ ...formData, currentBalance: Number(e.target.value) })}
                  placeholder="0.00"
                  disabled={!!editingNeoBank}
                />
              </div>

              <div className="form-group">
                <label>{t('dropNeoBanks.form.comment')}</label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder={t('dropNeoBanks.form.commentPlaceholder')}
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  {t('common.cancel')}
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingNeoBank ? t('common.save') : t('common.add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Balance Modal */}
      {isBalanceModalOpen && balanceNeoBank && (
        <div className="modal-overlay" onClick={closeBalanceModal}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('dropNeoBanks.updateBalance')}</h2>
              <button className="modal-close" onClick={closeBalanceModal}>×</button>
            </div>

            <div className="balance-info">
              <p><strong>{t('dropNeoBanks.table.drop')}:</strong> {balanceNeoBank.drop?.name || '-'}</p>
              <p><strong>{t('dropNeoBanks.table.provider')}:</strong> {PROVIDERS.find(p => p.value === balanceNeoBank.provider)?.label}</p>
              <p><strong>{t('dropNeoBanks.table.accountId')}:</strong> {balanceNeoBank.accountId}</p>
              <p><strong>{t('dropNeoBanks.info.currentBalance')}:</strong> {formatCurrency(balanceNeoBank.currentBalance)}</p>
            </div>

            <form onSubmit={handleUpdateBalance}>
              <div className="form-group">
                <label>{t('dropNeoBanks.form.newBalance')} *</label>
                <input
                  type="number"
                  step="0.01"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  autoFocus
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeBalanceModal}>
                  {t('common.cancel')}
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={updateBalanceMutation.isPending}
                >
                  {t('dropNeoBanks.updateBalance')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
