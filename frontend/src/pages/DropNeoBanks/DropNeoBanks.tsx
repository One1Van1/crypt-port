import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, DollarSign } from 'lucide-react';
import dropNeoBanksService, { DropNeoBank, CreateDropNeoBankDto, UpdateDropNeoBankDto } from '../../services/drop-neo-banks.service';
import { platformsService, Platform } from '../../services/platforms.service';
import { dropsService } from '../../services/drops.service';
import { exchangeUsdtToPesosService } from '../../services/exchange-usdt-to-pesos.service';
import './DropNeoBanks.css';

export default function DropNeoBanks() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [editingNeoBank, setEditingNeoBank] = useState<DropNeoBank | null>(null);
  const [exchangeNeoBank, setExchangeNeoBank] = useState<DropNeoBank | null>(null);
  const [filterDropId, setFilterDropId] = useState<number | undefined>();
  const [filterPlatformId, setFilterPlatformId] = useState<number | undefined>();
  const [filterProvider, setFilterProvider] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openModalDropdown, setOpenModalDropdown] = useState<string | null>(null);

  // Форма
  const [formData, setFormData] = useState<CreateDropNeoBankDto>({
    provider: '',
    accountId: '',
    dropId: 0,
    platformId: 0,
    currentBalance: 0,
    comment: '',
  });

  const [addUsdtInput, setAddUsdtInput] = useState<string>('');

  const [exchangeUsdtAmount, setExchangeUsdtAmount] = useState<string>('');

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
    queryKey: ['drop-neo-banks', filterDropId, filterPlatformId, filterProvider, filterStatus],
    queryFn: () => dropNeoBanksService.getAll({ 
      dropId: filterDropId,
      platformId: filterPlatformId, 
      provider: filterProvider.trim() || undefined,
      status: filterStatus || undefined 
    }),
  });

  // Получить площадки для селектора
  const { data: platforms } = useQuery({
    queryKey: ['platforms'],
    queryFn: () => platformsService.getAll({}),
  });

  // Получить дропов для селектора (создание/редактирование)
  const { data: drops } = useQuery({
    queryKey: ['drops'],
    queryFn: () => dropsService.getAll(),
  });

  // Создать банк вывода
  const createMutation = useMutation({
    mutationFn: (data: CreateDropNeoBankDto) => dropNeoBanksService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drop-neo-banks'] });
      toast.success(t('dropNeoBanks.messages.created'));
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
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('dropNeoBanks.messages.updateError'));
    },
  });

  const exchangeMutation = useMutation({
    mutationFn: (dto: { platformId: number; neoBankId: number; usdtAmount: number }) =>
      exchangeUsdtToPesosService.exchange(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drop-neo-banks'] });
      queryClient.invalidateQueries({ queryKey: ['platforms'] });
      toast.success(t('dropNeoBanks.messages.exchangeSuccess'));
      closeExchangeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('dropNeoBanks.messages.exchangeError'));
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
      provider: '',
      accountId: '',
      dropId: 0,
      platformId: 0,
      currentBalance: 0,
      comment: '',
    });
    setAddUsdtInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (neoBank: DropNeoBank) => {
    setEditingNeoBank(neoBank);
    setFormData({
      provider: neoBank.provider,
      accountId: neoBank.accountId,
      dropId: neoBank.drop?.id || 0,
      platformId: neoBank.platform?.id || 0,
      currentBalance: neoBank.currentBalance,
      comment: neoBank.comment,
    });
    setAddUsdtInput('');
    setIsModalOpen(true);
  };

  const openExchangeModal = (neoBank: DropNeoBank) => {
    setExchangeNeoBank(neoBank);
    setExchangeUsdtAmount('');
    setIsExchangeModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNeoBank(null);
  };

  const closeExchangeModal = () => {
    setIsExchangeModalOpen(false);
    setExchangeNeoBank(null);
    setExchangeUsdtAmount('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const addUsdtAmount = addUsdtInput.trim() === '' ? 0 : Number(addUsdtInput);
    if (Number.isNaN(addUsdtAmount) || addUsdtAmount < 0) {
      toast.error('Введите корректную сумму');
      return;
    }

    const platform = platforms?.items.find((p: Platform) => p.id === formData.platformId);
    const rate = Number(platform?.exchangeRate ?? 0);
    if (addUsdtAmount > 0 && rate <= 0) {
      toast.error('У площадки не установлен курс');
      return;
    }

    // Basic validation
    if (!formData.dropId) {
      toast.error('Выберите дропа');
      return;
    }

    if (!formData.platformId) {
      toast.error('Выберите площадку');
      return;
    }

    if (!formData.provider.trim()) {
      toast.error('Введите название банка');
      return;
    }
    
    (async () => {
      try {
        if (editingNeoBank) {
          await updateMutation.mutateAsync({
            id: editingNeoBank.id,
            data: {
              dropId: formData.dropId,
              platformId: formData.platformId,
              provider: formData.provider.trim(),
              accountId: formData.accountId,
              comment: formData.comment,
            },
          });

          if (addUsdtAmount > 0) {
            await exchangeMutation.mutateAsync({
              platformId: formData.platformId,
              neoBankId: editingNeoBank.id,
              usdtAmount: addUsdtAmount,
            });
          }
        } else {
          const created = await createMutation.mutateAsync({
            ...formData,
            provider: formData.provider.trim(),
            // balances are updated only via exchange operation
            currentBalance: 0,
          });

          if (addUsdtAmount > 0) {
            await exchangeMutation.mutateAsync({
              platformId: formData.platformId,
              neoBankId: created.id,
              usdtAmount: addUsdtAmount,
            });
          }
        }

        setAddUsdtInput('');
        closeModal();
      } catch {
        // errors are already toasted by mutations
      }
    })();
  };

  const handleExchange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exchangeNeoBank) return;

    const platformId = exchangeNeoBank.platform?.id ?? 0;
    if (!platformId) {
      toast.error('У банка вывода не выбрана площадка');
      return;
    }

    const usdtAmount = Number(exchangeUsdtAmount);
    if (!usdtAmount || usdtAmount <= 0) {
      toast.error('Введите сумму USDT');
      return;
    }

    exchangeMutation.mutate({
      platformId,
      neoBankId: exchangeNeoBank.id,
      usdtAmount,
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

  const formatUsdt = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const selectedPlatform = platforms?.items.find((p: Platform) => p.id === formData.platformId);

  const exchangePlatform = platforms?.items.find(
    (p: Platform) => p.id === (exchangeNeoBank?.platform?.id ?? 0),
  );

  const exchangeUsdt = Number(exchangeUsdtAmount);
  const exchangeRate = Number(exchangePlatform?.exchangeRate ?? 0);
  const exchangePesosPreview = exchangeUsdt > 0 && exchangeRate > 0 ? exchangeUsdt * exchangeRate : 0;
  const platformUsdtBalance = Number(exchangePlatform?.balance ?? 0);
  const platformUsdtBalanceAfter = exchangeUsdt > 0 ? platformUsdtBalance - exchangeUsdt : platformUsdtBalance;

  if (isLoading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  const providerOptions = Array.from(
    new Set(
      (neoBanks?.items ?? [])
        .map((nb: DropNeoBank) => (nb.provider ?? '').trim())
        .filter((v: string) => v.length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b, 'ru', { sensitivity: 'base' }));

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
        {/* Drop Filter */}
        <div className="custom-filter">
          <button
            className="filter-button"
            onClick={() => setOpenDropdown(openDropdown === 'drop' ? null : 'drop')}
          >
            <span>
              {filterDropId
                ? (drops as any)?.items?.find((d: any) => Number(d.id) === Number(filterDropId))?.name
                : 'Все дропы'}
            </span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
            </svg>
          </button>
          {openDropdown === 'drop' && (
            <div className="filter-dropdown">
              <div
                className={`filter-option ${!filterDropId ? 'active' : ''}`}
                onClick={() => {
                  setFilterDropId(undefined);
                  setOpenDropdown(null);
                }}
              >
                Все дропы
              </div>
              {(drops as any)?.items?.map((drop: any) => (
                <div
                  key={drop.id}
                  className={`filter-option ${Number(filterDropId) === Number(drop.id) ? 'active' : ''}`}
                  onClick={() => {
                    setFilterDropId(Number(drop.id));
                    setOpenDropdown(null);
                  }}
                >
                  {drop.name}
                </div>
              ))}
            </div>
          )}
        </div>

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
            <span>{filterProvider ? filterProvider : t('dropNeoBanks.filters.allProviders')}</span>
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
              {providerOptions.map((name) => (
                <div
                  key={name}
                  className={`filter-option ${filterProvider === name ? 'active' : ''}`}
                  onClick={() => {
                    setFilterProvider(name);
                    setOpenDropdown(null);
                  }}
                >
                  {name}
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
              <th>Дроп</th>
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
                  <div className="drop-cell">
                    <strong>{neoBank.drop?.name || '-'}</strong>
                  </div>
                </td>
                <td>
                  <span className={`badge ${getProviderBadgeClass(neoBank.provider)}`}>
                    {neoBank.provider}
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
                      onClick={() => openExchangeModal(neoBank)}
                      title={t('dropNeoBanks.actions.exchangeTitle')}
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
                  >
                    <span>
                      {formData.platformId
                        ? platforms?.items.find((p: Platform) => p.id === formData.platformId)?.name
                        : t('dropNeoBanks.form.selectPlatform')}
                    </span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
                    </svg>
                  </button>
                  {openModalDropdown === 'platform' && (
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

                {selectedPlatform && (
                  <div className="helper-text" style={{ marginTop: 8 }}>
                    {t('dropNeoBanks.form.platformRate')}: {selectedPlatform.exchangeRate} · {t('dropNeoBanks.form.platformBalance')}: {formatUsdt(selectedPlatform.balance)} USDT
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Имя дропа *</label>
                <div className="modal-custom-select">
                  <button
                    type="button"
                    className="modal-select-button"
                    onClick={() => setOpenModalDropdown(openModalDropdown === 'drop' ? null : 'drop')}
                  >
                    <span>
                      {formData.dropId
                        ? (drops as any)?.items?.find((d: any) => Number(d.id) === Number(formData.dropId))?.name
                        : 'Выберите дропа'}
                    </span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
                    </svg>
                  </button>
                  {openModalDropdown === 'drop' && (
                    <div className="modal-dropdown">
                      <div
                        className={`modal-option ${formData.dropId === 0 ? 'active' : ''}`}
                        onClick={() => {
                          setFormData({ ...formData, dropId: 0 });
                          setOpenModalDropdown(null);
                        }}
                      >
                        Выберите дропа
                      </div>
                      {(drops as any)?.items?.map((drop: any) => (
                        <div
                          key={drop.id}
                          className={`modal-option ${Number(formData.dropId) === Number(drop.id) ? 'active' : ''}`}
                          onClick={() => {
                            setFormData({ ...formData, dropId: Number(drop.id) });
                            setOpenModalDropdown(null);
                          }}
                        >
                          {drop.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Название банка *</label>
                <input
                  type="text"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  placeholder="Ripio"
                  required
                />
              </div>

              <div className="form-group">
                <label>СВУ *</label>
                <input
                  type="text"
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                  placeholder="Введите СВУ"
                  required
                />
              </div>

              <div className="form-group">
                <label>Сколько USDT вы хотите конвертировать и добавить</label>
                <input
                  type="number"
                  step="0.01"
                  value={addUsdtInput}
                  onChange={(e) => setAddUsdtInput(e.target.value)}
                  placeholder="Введите сумму USDT"
                />

                <div className="helper-text" style={{ marginTop: 8 }}>
                  Уже на счету: {formatCurrency(editingNeoBank ? Number(editingNeoBank.currentBalance ?? 0) : 0)}
                </div>

                {selectedPlatform && addUsdtInput.trim() !== '' && Number(addUsdtInput) > 0 && (
                  <div className="helper-text" style={{ marginTop: 6 }}>
                    Будет начислено: {formatCurrency(Number(addUsdtInput) * Number(selectedPlatform.exchangeRate || 0))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Алиас</label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Введите алиас"
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
      {isExchangeModalOpen && exchangeNeoBank && (
        <div className="modal-overlay" onClick={closeExchangeModal}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('dropNeoBanks.exchangeTitle')}</h2>
              <button className="modal-close" onClick={closeExchangeModal}>×</button>
            </div>

            <div className="balance-info">
              <p><strong>{t('dropNeoBanks.table.platform')}:</strong> {exchangeNeoBank.platform?.name || '-'}</p>
              <p><strong>{t('dropNeoBanks.table.provider')}:</strong> {exchangeNeoBank.provider}</p>
              <p><strong>{t('dropNeoBanks.table.accountId')}:</strong> {exchangeNeoBank.accountId}</p>
              <p><strong>{t('dropNeoBanks.info.currentBalance')}:</strong> {formatCurrency(exchangeNeoBank.currentBalance)}</p>
            </div>

            {exchangePlatform && (
              <div className="balance-info" style={{ marginTop: 12 }}>
                <p><strong>{t('dropNeoBanks.form.platformRate')}:</strong> {exchangePlatform.exchangeRate}</p>
                <p><strong>{t('dropNeoBanks.form.platformBalance')}:</strong> {formatUsdt(exchangePlatform.balance)} USDT</p>
              </div>
            )}

            <form onSubmit={handleExchange}>
              <div className="form-group">
                <label>{t('dropNeoBanks.form.usdtAmount')} *</label>
                <input
                  type="number"
                  step="0.01"
                  value={exchangeUsdtAmount}
                  onChange={(e) => setExchangeUsdtAmount(e.target.value)}
                  placeholder="0.00 USDT"
                  required
                  autoFocus
                />
              </div>

              <div className="balance-info" style={{ marginTop: 12 }}>
                <p><strong>{t('dropNeoBanks.exchange.previewPesos')}:</strong> {formatCurrency(exchangePesosPreview)}</p>
                {exchangePlatform && exchangeUsdt > 0 && (
                  <p><strong>{t('dropNeoBanks.exchange.platformBalanceAfter')}:</strong> {formatUsdt(platformUsdtBalanceAfter)} USDT</p>
                )}
                {exchangePlatform && exchangeUsdt > 0 && platformUsdtBalanceAfter < 0 && (
                  <p style={{ color: 'var(--text-tertiary)' }}>{t('dropNeoBanks.exchange.insufficientPlatformBalance')}</p>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeExchangeModal}>
                  {t('common.cancel')}
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={exchangeMutation.isPending}
                >
                  {t('dropNeoBanks.exchangeButton')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
