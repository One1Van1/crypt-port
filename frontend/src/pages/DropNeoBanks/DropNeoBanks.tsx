import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, DollarSign } from 'lucide-react';
import dropNeoBanksService, { DropNeoBank, CreateDropNeoBankDto, UpdateDropNeoBankDto } from '../../services/drop-neo-banks.service';
import { platformsService, Platform } from '../../services/platforms.service';
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
  const [filterPlatformId, setFilterPlatformId] = useState<number | undefined>();
  const [filterProvider, setFilterProvider] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openModalDropdown, setOpenModalDropdown] = useState<string | null>(null);

  // Форма
  const [formData, setFormData] = useState<CreateDropNeoBankDto>({
    platformId: 0,
    provider: 'ripio',
    accountId: '',
    currentBalance: 0,
    comment: '',
  });

  const [balanceAmount, setBalanceAmount] = useState<string>('');

  // Закрытие dropdown при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.custom-filter')) {
        setOpenDropdown(null);
      }
      if (!target.closest('.modal-custom-select')) {
        setOpenModalDropdown(null);
      }
    };

    if (openDropdown || openModalDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdown, openModalDropdown]);

  // Получить все банки вывода
  const { data: neoBanks, isLoading } = useQuery({
    queryKey: ['drop-neo-banks', filterPlatformId, filterProvider, filterStatus],
    queryFn: () => dropNeoBanksService.getAll({ 
      platformId: filterPlatformId, 
      provider: filterProvider || undefined,
      status: filterStatus || undefined 
    }),
  });

  // Получить площадки для селектора
  const { data: platforms } = useQuery({
    queryKey: ['platforms'],
    queryFn: () => platformsService.getAll({}),
  });

  // Создать банк вывода
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

  // Обновить банк вывода
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

  // Удалить банк вывода
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
      platformId: 0,
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
      platformId: neoBank.platform?.id || 0,
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
        {/* Platform Filter */}
        <div className="custom-filter">
          <button
            className="filter-button"
            onClick={() => setOpenDropdown(openDropdown === 'platform' ? null : 'platform')}
          >
            <span>{filterPlatformId ? platforms?.items.find(p => p.id === filterPlatformId)?.name : t('dropNeoBanks.filters.allPlatforms')}</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
            </svg>
          </button>
          {openDropdown === 'platform' && (
            <div className="filter-dropdown">
              <div
                className={`filter-option ${!filterPlatformId ? 'active' : ''}`}
                onClick={() => {
                  setFilterPlatformId(undefined);
                  setOpenDropdown(null);
                }}
              >
                {t('dropNeoBanks.filters.allPlatforms')}
              </div>
              {platforms?.items.map((platform: Platform) => (
                <div
                  key={platform.id}
                  className={`filter-option ${filterPlatformId === platform.id ? 'active' : ''}`}
                  onClick={() => {
                    setFilterPlatformId(platform.id);
                    setOpenDropdown(null);
                  }}
                >
                  {platform.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Provider Filter */}
        <div className="custom-filter">
          <button
            className="filter-button"
            onClick={() => setOpenDropdown(openDropdown === 'provider' ? null : 'provider')}
          >
            <span>{filterProvider ? PROVIDERS.find(p => p.value === filterProvider)?.label : t('dropNeoBanks.filters.allProviders')}</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
            </svg>
          </button>
          {openDropdown === 'provider' && (
            <div className="filter-dropdown">
              <div
                className={`filter-option ${!filterProvider ? 'active' : ''}`}
                onClick={() => {
                  setFilterProvider('');
                  setOpenDropdown(null);
                }}
              >
                {t('dropNeoBanks.filters.allProviders')}
              </div>
              {PROVIDERS.map((p) => (
                <div
                  key={p.value}
                  className={`filter-option ${filterProvider === p.value ? 'active' : ''}`}
                  onClick={() => {
                    setFilterProvider(p.value);
                    setOpenDropdown(null);
                  }}
                >
                  {p.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Filter */}
        <div className="custom-filter">
          <button
            className="filter-button"
            onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
          >
            <span>{filterStatus ? t(`statuses.${filterStatus}`) : t('dropNeoBanks.filters.allStatuses')}</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
            </svg>
          </button>
          {openDropdown === 'status' && (
            <div className="filter-dropdown">
              <div
                className={`filter-option ${!filterStatus ? 'active' : ''}`}
                onClick={() => {
                  setFilterStatus('');
                  setOpenDropdown(null);
                }}
              >
                {t('dropNeoBanks.filters.allStatuses')}
              </div>
              <div
                className={`filter-option ${filterStatus === 'active' ? 'active' : ''}`}
                onClick={() => {
                  setFilterStatus('active');
                  setOpenDropdown(null);
                }}
              >
                {t('statuses.active')}
              </div>
              <div
                className={`filter-option ${filterStatus === 'frozen' ? 'active' : ''}`}
                onClick={() => {
                  setFilterStatus('frozen');
                  setOpenDropdown(null);
                }}
              >
                {t('statuses.frozen')}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('dropNeoBanks.table.platform')}</th>
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
                    <strong>{neoBank.platform?.name || '-'}</strong>
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
                <label>{t('dropNeoBanks.form.platform')} *</label>
                <div className="modal-custom-select">
                  <button
                    type="button"
                    className="modal-select-button"
                    onClick={() => setOpenModalDropdown(openModalDropdown === 'platform' ? null : 'platform')}
                    disabled={!!editingNeoBank}
                  >
                    <span>{formData.platformId ? platforms?.items.find(p => p.id === formData.platformId)?.name : t('dropNeoBanks.form.selectPlatform')}</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
                    </svg>
                  </button>
                  {openModalDropdown === 'platform' && !editingNeoBank && (
                    <div className="modal-dropdown">
                      <div
                        className={`modal-option ${formData.platformId === 0 ? 'active' : ''}`}
                        onClick={() => {
                          setFormData({ ...formData, platformId: 0 });
                          setOpenModalDropdown(null);
                        }}
                      >
                        {t('dropNeoBanks.form.selectPlatform')}
                      </div>
                      {platforms?.items.map((platform: Platform) => (
                        <div
                          key={platform.id}
                          className={`modal-option ${formData.platformId === platform.id ? 'active' : ''}`}
                          onClick={() => {
                            setFormData({ ...formData, platformId: platform.id });
                            setOpenModalDropdown(null);
                          }}
                        >
                          {platform.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>{t('dropNeoBanks.form.provider')} *</label>
                <div className="modal-custom-select">
                  <button
                    type="button"
                    className="modal-select-button"
                    onClick={() => setOpenModalDropdown(openModalDropdown === 'provider' ? null : 'provider')}
                    disabled={!!editingNeoBank}
                  >
                    <span>{PROVIDERS.find(p => p.value === formData.provider)?.label}</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
                    </svg>
                  </button>
                  {openModalDropdown === 'provider' && !editingNeoBank && (
                    <div className="modal-dropdown">
                      {PROVIDERS.map((p) => (
                        <div
                          key={p.value}
                          className={`modal-option ${formData.provider === p.value ? 'active' : ''}`}
                          onClick={() => {
                            setFormData({ ...formData, provider: p.value as any });
                            setOpenModalDropdown(null);
                          }}
                        >
                          {p.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
              <p><strong>{t('dropNeoBanks.table.platform')}:</strong> {balanceNeoBank.platform?.name || '-'}</p>
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
