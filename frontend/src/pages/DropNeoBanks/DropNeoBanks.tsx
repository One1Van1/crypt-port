import { useState, useEffect, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import dropNeoBanksService, {
  DropNeoBank,
  CreateDropNeoBankDto,
  UpdateDropNeoBankDto,
  DropNeoBankLimitsRemaining,
  NeoBankWithdrawalsHistoryItem,
  DropNeoBankFreezeHistoryItem,
} from '../../services/drop-neo-banks.service';
import { platformsService, Platform } from '../../services/platforms.service';
import { dropsService } from '../../services/drops.service';
import { exchangeUsdtToPesosService } from '../../services/exchange-usdt-to-pesos.service';
import './DropNeoBanks.css';
import { getProviderBadgeClass } from '../../utils/providerBadgeClass';

export default function DropNeoBanks() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'neoBanks' | 'limits'>('limits');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmNeoBank, setDeleteConfirmNeoBank] = useState<DropNeoBank | null>(null);
  const [isLimitsEditModalOpen, setIsLimitsEditModalOpen] = useState(false);
  const [limitsEditingNeoBank, setLimitsEditingNeoBank] = useState<DropNeoBank | null>(null);
  const [limitsDailyLimitInput, setLimitsDailyLimitInput] = useState<string>('');
  const [limitsMonthlyLimitInput, setLimitsMonthlyLimitInput] = useState<string>('');

  const [isFrozenEditModalOpen, setIsFrozenEditModalOpen] = useState(false);
  const [frozenEditingNeoBank, setFrozenEditingNeoBank] = useState<DropNeoBank | null>(null);
  const [frozenAmountInput, setFrozenAmountInput] = useState<string>('');
  const [editingNeoBank, setEditingNeoBank] = useState<DropNeoBank | null>(null);
  const [filterDropId, setFilterDropId] = useState<number | undefined>();
  const [filterPlatformId, setFilterPlatformId] = useState<number | undefined>();
  const [filterProvider, setFilterProvider] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openModalDropdown, setOpenModalDropdown] = useState<string | null>(null);
  const [expandedNeoBankId, setExpandedNeoBankId] = useState<number | null>(null);
  const [expandedFreezeHistoryNeoBankId, setExpandedFreezeHistoryNeoBankId] = useState<number | null>(null);

  // Форма
  const [formData, setFormData] = useState<CreateDropNeoBankDto>({
    provider: '',
    accountId: '',
    dropId: 0,
    platformId: 0,
    currentBalance: 0,
    alias: '',
    dailyLimit: undefined,
    monthlyLimit: undefined,
  });

  const [addUsdtInput, setAddUsdtInput] = useState<string>('');

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

  const { data: limitsRemaining } = useQuery({
    queryKey: ['drop-neo-banks-limits-remaining', filterDropId, filterPlatformId, filterProvider, filterStatus],
    queryFn: () =>
      dropNeoBanksService.getLimitsRemaining({
        dropId: filterDropId,
        platformId: filterPlatformId,
        provider: filterProvider.trim() || undefined,
        status: filterStatus || undefined,
      }),
    enabled: activeTab === 'limits',
  });

  const limitsRemainingById = new Map<number, DropNeoBankLimitsRemaining>(
    (limitsRemaining?.items ?? []).map((item) => [item.id, item]),
  );

  const { data: withdrawalsHistory } = useQuery({
    queryKey: ['drop-neo-bank-withdrawals-history', expandedNeoBankId],
    queryFn: () =>
      dropNeoBanksService.getWithdrawalsHistory({
        neoBankId: expandedNeoBankId as number,
        limit: 50,
        offset: 0,
      }),
    enabled: activeTab === 'limits' && expandedNeoBankId !== null,
  });

  const withdrawalsHistoryItems: NeoBankWithdrawalsHistoryItem[] = withdrawalsHistory?.items ?? [];

  const { data: freezeHistory } = useQuery({
    queryKey: ['drop-neo-bank-freeze-history', expandedFreezeHistoryNeoBankId],
    queryFn: () =>
      dropNeoBanksService.getFreezeHistory({
        neoBankId: expandedFreezeHistoryNeoBankId as number,
        limit: 50,
        offset: 0,
      }),
    enabled: activeTab === 'neoBanks' && expandedFreezeHistoryNeoBankId !== null,
  });

  const freezeHistoryItems: DropNeoBankFreezeHistoryItem[] = freezeHistory?.items ?? [];

  const freezeHistoryUnfrozenAmountById = (() => {
    const byId = new Map<number, number>();
    const ordered = [...freezeHistoryItems].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    let currentFrozenAmount = 0;
    for (const item of ordered) {
      if (item.action === 'freeze') {
        currentFrozenAmount = Number(item.frozenAmount ?? 0);
        continue;
      }

      // For "unfreeze", store how much was unfrozen (the amount frozen right before unfreezing)
      byId.set(item.id, currentFrozenAmount);
      currentFrozenAmount = 0;
    }

    return byId;
  })();

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

  const freezeMutation = useMutation({
    mutationFn: ({ id, frozenAmount }: { id: number; frozenAmount: number }) =>
      dropNeoBanksService.freeze(id, { frozenAmount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drop-neo-banks'] });
      queryClient.invalidateQueries({ queryKey: ['drop-neo-bank-freeze-history'] });
      toast.success(t('dropNeoBanks.messages.frozenSuccess'));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('dropNeoBanks.messages.freezeError'));
    },
  });

  const unfreezeMutation = useMutation({
    mutationFn: (id: number) => dropNeoBanksService.unfreeze(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drop-neo-banks'] });
      queryClient.invalidateQueries({ queryKey: ['drop-neo-bank-freeze-history'] });
      toast.success(t('dropNeoBanks.messages.unfrozenSuccess'));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('dropNeoBanks.messages.unfreezeError'));
    },
  });

  const exchangeMutation = useMutation({
    mutationFn: (dto: { platformId: number; neoBankId: number; usdtAmount: number }) =>
      exchangeUsdtToPesosService.exchange(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drop-neo-banks'] });
      queryClient.invalidateQueries({ queryKey: ['platforms'] });
      toast.success(t('dropNeoBanks.messages.exchangeSuccess'));
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
      alias: '',
      dailyLimit: undefined,
      monthlyLimit: undefined,
    });
    setAddUsdtInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (neoBank: DropNeoBank) => {
    if (activeTab === 'limits') {
      setLimitsEditingNeoBank(neoBank);
      setLimitsDailyLimitInput(neoBank.dailyLimit === null || neoBank.dailyLimit === undefined ? '' : String(neoBank.dailyLimit));
      setLimitsMonthlyLimitInput(
        neoBank.monthlyLimit === null || neoBank.monthlyLimit === undefined ? '' : String(neoBank.monthlyLimit),
      );
      setIsLimitsEditModalOpen(true);
      return;
    }

    if (activeTab === 'neoBanks') {
      setFrozenEditingNeoBank(neoBank);
      setFrozenAmountInput(neoBank.frozenAmount === null || neoBank.frozenAmount === undefined ? '0' : String(neoBank.frozenAmount));
      setIsFrozenEditModalOpen(true);
    }
  };

  const closeLimitsEditModal = () => {
    setIsLimitsEditModalOpen(false);
    setLimitsEditingNeoBank(null);
    setLimitsDailyLimitInput('');
    setLimitsMonthlyLimitInput('');
  };

  const closeFrozenEditModal = () => {
    setIsFrozenEditModalOpen(false);
    setFrozenEditingNeoBank(null);
    setFrozenAmountInput('');
  };

  const handleLimitsEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!limitsEditingNeoBank) return;

    const dailyRaw = limitsDailyLimitInput.trim().replace(',', '.');
    const monthlyRaw = limitsMonthlyLimitInput.trim().replace(',', '.');

    const dailyLimit = dailyRaw === '' ? undefined : Number(dailyRaw);
    const monthlyLimit = monthlyRaw === '' ? undefined : Number(monthlyRaw);

    if (dailyLimit !== undefined && (!Number.isFinite(dailyLimit) || dailyLimit < 0)) {
      toast.error(t('dropNeoBanks.prompts.invalidFrozenAmount'));
      return;
    }

    if (monthlyLimit !== undefined && (!Number.isFinite(monthlyLimit) || monthlyLimit < 0)) {
      toast.error(t('dropNeoBanks.prompts.invalidFrozenAmount'));
      return;
    }

    await updateMutation.mutateAsync({
      id: limitsEditingNeoBank.id,
      data: {
        dailyLimit,
        monthlyLimit,
      },
    });

    closeLimitsEditModal();
  };

  const handleFrozenFreezeOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frozenEditingNeoBank) return;

    const normalized = frozenAmountInput.trim().replace(',', '.');
    const amount = normalized === '' ? 0 : Number(normalized);

    if (!Number.isFinite(amount) || amount < 0) {
      toast.error(t('dropNeoBanks.prompts.invalidFrozenAmount'));
      return;
    }

    await freezeMutation.mutateAsync({ id: frozenEditingNeoBank.id, frozenAmount: amount });
    closeFrozenEditModal();
  };

  const handleFrozenUnfreeze = async () => {
    if (!frozenEditingNeoBank) return;
    await unfreezeMutation.mutateAsync(frozenEditingNeoBank.id);
    closeFrozenEditModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNeoBank(null);
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const addUsdtAmount = editingNeoBank ? (addUsdtInput.trim() === '' ? 0 : Number(addUsdtInput)) : 0;
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

    if (formData.dailyLimit !== undefined && (Number.isNaN(Number(formData.dailyLimit)) || Number(formData.dailyLimit) < 0)) {
      toast.error('Введите корректный дневной лимит');
      return;
    }

    if (formData.monthlyLimit !== undefined && (Number.isNaN(Number(formData.monthlyLimit)) || Number(formData.monthlyLimit) < 0)) {
      toast.error('Введите корректный месячный лимит');
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
              alias: formData.alias,
              dailyLimit: formData.dailyLimit,
              monthlyLimit: formData.monthlyLimit,
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
          void created;
        }

        setAddUsdtInput('');
        closeModal();
      } catch {
        // errors are already toasted by mutations
      }
    })();
  };


  const requestDelete = (neoBank: DropNeoBank) => {
    setDeleteConfirmNeoBank(neoBank);
  };

  const confirmDelete = () => {
    if (!deleteConfirmNeoBank) return;
    deleteMutation.mutate(deleteConfirmNeoBank.id);
    setDeleteConfirmNeoBank(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatArsAmount = (amount: number) => {
    const formatted = new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return `${formatted} ARS`;
  };

  const formatUsdt = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const selectedPlatform = platforms?.items.find((p: Platform) => p.id === formData.platformId);

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

      <div className="neo-bank-tabs">
        <button
          type="button"
          className={`neo-bank-tab ${activeTab === 'limits' ? 'active' : ''}`}
          onClick={() => setActiveTab('limits')}
        >
          {t('dropNeoBanks.tabs.limits')}
        </button>
        <button
          type="button"
          className={`neo-bank-tab ${activeTab === 'neoBanks' ? 'active' : ''}`}
          onClick={() => setActiveTab('neoBanks')}
        >
          {t('dropNeoBanks.tabs.neoBanks')}
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
                : t('dropNeoBanks.filters.allDrops')}
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
                {t('dropNeoBanks.filters.allDrops')}
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
              <th>{t('dropNeoBanks.table.drop')}</th>
              <th>{t('dropNeoBanks.table.provider')}</th>
              <th>{t('dropNeoBanks.table.accountId')}</th>
              {activeTab === 'neoBanks' ? (
                <>
                  <th>{t('dropNeoBanks.table.frozenAmountArs')}</th>
                  <th>{t('dropNeoBanks.table.status')}</th>
                </>
              ) : (
                <>
                  <th>{t('dropNeoBanks.table.dailyLimit')}</th>
                  <th>{t('dropNeoBanks.table.monthlyLimit')}</th>
                </>
              )}
              <th>{t('dropNeoBanks.table.alias')}</th>
              <th>{t('dropNeoBanks.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {neoBanks?.items.map((neoBank: DropNeoBank) => (
              <Fragment key={neoBank.id}>
                <tr
                  onClick={() => {
                    if (activeTab === 'limits') {
                      setExpandedNeoBankId((prev) => (prev === neoBank.id ? null : neoBank.id));
                      return;
                    }

                    if (activeTab === 'neoBanks') {
                      setExpandedFreezeHistoryNeoBankId((prev) => (prev === neoBank.id ? null : neoBank.id));
                    }
                  }}
                  style={activeTab === 'limits' || activeTab === 'neoBanks' ? { cursor: 'pointer' } : undefined}
                >
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
                {activeTab === 'neoBanks' ? (
                  <>
                    <td>
                      <strong>{formatArsAmount(Number(neoBank.frozenAmount ?? 0))}</strong>
                    </td>
                    <td>
                      <span
                        className={`badge ${neoBank.status === 'active' ? 'badge-success' : 'badge-warning'}`}
                        style={{ cursor: 'default' }}
                      >
                        {t(`statuses.${neoBank.status}`)}
                      </span>
                    </td>
                  </>
                ) : (
                  <>
                    <td>
                      <strong>
                        {(() => {
                          const row = limitsRemainingById.get(neoBank.id);
                          const value = row?.dailyLimitRemaining;
                          return value === null || value === undefined ? '-' : formatArsAmount(Number(value));
                        })()}
                      </strong>
                    </td>
                    <td>
                      <strong>
                        {(() => {
                          const row = limitsRemainingById.get(neoBank.id);
                          const value = row?.monthlyLimitRemaining;
                          return value === null || value === undefined ? '-' : formatArsAmount(Number(value));
                        })()}
                      </strong>
                    </td>
                  </>
                )}
                <td>
                  <span className="comment-text">{neoBank.alias || '-'}</span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      type="button"
                      className="btn-icon btn-icon-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(neoBank);
                      }}
                      title={t('dropNeoBanks.actions.edit')}
                    >
                      <Edit2 size={16} />
                    </button>
                    {activeTab === 'limits' && (
                      <button
                        type="button"
                        className="btn-icon btn-icon-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          requestDelete(neoBank);
                        }}
                        title={t('dropNeoBanks.actions.delete')}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
                </tr>

                {activeTab === 'neoBanks' && expandedFreezeHistoryNeoBankId === neoBank.id && (
                  <tr key={`${neoBank.id}-freeze-history`}>
                    <td colSpan={8}>
                      <div style={{ padding: '12px 8px' }}>
                        <div style={{ marginBottom: 8, fontWeight: 600 }}>
                          {t('dropNeoBanks.freezeHistory.title')}
                        </div>

                        <div className="table-container">
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>{t('dropNeoBanks.freezeHistory.when')}</th>
                                <th>{t('dropNeoBanks.freezeHistory.action')}</th>
                                <th>{t('dropNeoBanks.freezeHistory.amount')}</th>
                                <th>{t('dropNeoBanks.freezeHistory.who')}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {freezeHistoryItems.length === 0 ? (
                                <tr>
                                  <td colSpan={4} style={{ opacity: 0.7 }}>
                                    {t('dropNeoBanks.freezeHistory.empty')}
                                  </td>
                                </tr>
                              ) : (
                                freezeHistoryItems.map((item) => (
                                  <tr key={item.id}>
                                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                                    <td>
                                      {item.action === 'freeze'
                                        ? t('dropNeoBanks.freezeHistory.freeze')
                                        : t('dropNeoBanks.freezeHistory.unfreeze')}
                                    </td>
                                    <td>
                                      {item.action === 'freeze'
                                        ? formatCurrency(Number(item.frozenAmount ?? 0))
                                        : freezeHistoryUnfrozenAmountById.has(item.id)
                                          ? formatCurrency(freezeHistoryUnfrozenAmountById.get(item.id) as number)
                                          : '-'}
                                    </td>
                                    <td>{item.performedByUser?.username || '-'}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}

                {activeTab === 'limits' && expandedNeoBankId === neoBank.id && (
                  <tr key={`${neoBank.id}-history`}>
                    <td colSpan={8} style={{ paddingTop: 0 }}>
                      <div style={{ padding: '0.75rem 1rem 1rem 1rem' }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>История выводов</div>
                        {withdrawalsHistoryItems.length === 0 ? (
                          <div style={{ color: 'var(--text-secondary)' }}>Нет выводов</div>
                        ) : (
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>Кто</th>
                                <th>Когда</th>
                                <th>Сколько</th>
                              </tr>
                            </thead>
                            <tbody>
                              {withdrawalsHistoryItems
                                .filter((x) => x)
                                .map((item) => (
                                  <tr
                                    key={item.id}
                                    onDoubleClick={() => {
                                      navigate('/transactions', {
                                        state: {
                                          highlightTransactionId: item.transactionId,
                                          viewMode: 'all',
                                          source: 'banks',
                                        },
                                      });
                                    }}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    <td>
                                      {item.withdrawnByUser?.username}
                                      {item.withdrawnByUser?.email ? ` (${item.withdrawnByUser.email})` : ''}
                                    </td>
                                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                                    <td>
                                      <strong>{formatCurrency(Number(item.amount))}</strong>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>

        {neoBanks?.items.length === 0 && (
          <div className="empty-state">
            <p>{t('dropNeoBanks.messages.notFound')}</p>
          </div>
        )}
      </div>

      {deleteConfirmNeoBank && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmNeoBank(null)}>
          <div className="modal-content modal-medium drop-neo-banks-delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('dropNeoBanks.actions.delete')}</h2>
              <button className="modal-close" onClick={() => setDeleteConfirmNeoBank(null)}>
                ×
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{t('dropNeoBanks.deleteConfirm')}</p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setDeleteConfirmNeoBank(null)}
                  disabled={deleteMutation.isPending}
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={confirmDelete}
                  disabled={deleteMutation.isPending}
                >
                  {t('common.delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <label>{t('dropNeoBanks.form.drop')} *</label>
                <div className="modal-custom-select">
                  <button
                    type="button"
                    className="modal-select-button"
                    onClick={() => setOpenModalDropdown(openModalDropdown === 'drop' ? null : 'drop')}
                  >
                    <span>
                      {formData.dropId
                        ? (drops as any)?.items?.find((d: any) => Number(d.id) === Number(formData.dropId))?.name
                        : t('dropNeoBanks.form.selectDrop')}
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
                        {t('dropNeoBanks.form.selectDrop')}
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

              {editingNeoBank && (
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
                    Уже на счету: {formatCurrency(Number(editingNeoBank.currentBalance ?? 0))}
                  </div>

                  {selectedPlatform && addUsdtInput.trim() !== '' && Number(addUsdtInput) > 0 && (
                    <div className="helper-text" style={{ marginTop: 6 }}>
                      Будет начислено: {formatCurrency(Number(addUsdtInput) * Number(selectedPlatform.exchangeRate || 0))}
                    </div>
                  )}
                </div>
              )}

              <div className="form-group">
                <label>{t('dropNeoBanks.form.dailyLimit')}</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.dailyLimit ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dailyLimit: e.target.value === '' ? undefined : Number(e.target.value),
                    })
                  }
                  placeholder="0"
                  min={0}
                />
              </div>

              <div className="form-group">
                <label>{t('dropNeoBanks.form.monthlyLimit')}</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monthlyLimit ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      monthlyLimit: e.target.value === '' ? undefined : Number(e.target.value),
                    })
                  }
                  placeholder="0"
                  min={0}
                />
              </div>

              <div className="form-group">
                <label>{t('dropNeoBanks.form.alias')}</label>
                <textarea
                  value={formData.alias}
                  onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                  placeholder={t('dropNeoBanks.form.aliasPlaceholder')}
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

      {/* Limits Edit Modal (limits-only) */}
      {isLimitsEditModalOpen && limitsEditingNeoBank && (
        <div className="modal-overlay" onClick={closeLimitsEditModal}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('dropNeoBanks.limitsEditModal.title')}</h2>
              <button className="modal-close" onClick={closeLimitsEditModal}>×</button>
            </div>

            <div className="balance-info">
              <p><strong>{t('dropNeoBanks.table.platform')}:</strong> {limitsEditingNeoBank.platform?.name || '-'}</p>
              <p><strong>{t('dropNeoBanks.table.drop')}:</strong> {limitsEditingNeoBank.drop?.name || '-'}</p>
              <p><strong>{t('dropNeoBanks.table.provider')}:</strong> {limitsEditingNeoBank.provider}</p>
              <p><strong>{t('dropNeoBanks.table.accountId')}:</strong> {limitsEditingNeoBank.accountId}</p>
            </div>

            <form onSubmit={handleLimitsEditSubmit}>
              <div className="form-group">
                <label>{t('dropNeoBanks.form.dailyLimit')}</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={limitsDailyLimitInput}
                  onChange={(e) => setLimitsDailyLimitInput(e.target.value)}
                  placeholder="0"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>{t('dropNeoBanks.form.monthlyLimit')}</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={limitsMonthlyLimitInput}
                  onChange={(e) => setLimitsMonthlyLimitInput(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeLimitsEditModal}>
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending}>
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Frozen Edit Modal (status + frozen amount only) */}
      {isFrozenEditModalOpen && frozenEditingNeoBank && (
        <div className="modal-overlay" onClick={closeFrozenEditModal}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('dropNeoBanks.frozenEditModal.title')}</h2>
              <button className="modal-close" onClick={closeFrozenEditModal}>×</button>
            </div>

            <div className="balance-info">
              <p><strong>{t('dropNeoBanks.table.platform')}:</strong> {frozenEditingNeoBank.platform?.name || '-'}</p>
              <p><strong>{t('dropNeoBanks.table.drop')}:</strong> {frozenEditingNeoBank.drop?.name || '-'}</p>
              <p><strong>{t('dropNeoBanks.table.provider')}:</strong> {frozenEditingNeoBank.provider}</p>
              <p><strong>{t('dropNeoBanks.table.accountId')}:</strong> {frozenEditingNeoBank.accountId}</p>
              <p>
                <strong>{t('dropNeoBanks.table.status')}:</strong>{' '}
                <span className={`badge ${frozenEditingNeoBank.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                  {t(`statuses.${frozenEditingNeoBank.status}`)}
                </span>
              </p>
            </div>

            <form onSubmit={handleFrozenFreezeOrUpdate}>
              <div className="form-group">
                <label>{t('dropNeoBanks.prompts.enterFrozenAmountArs')}</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={frozenAmountInput}
                  onChange={(e) => setFrozenAmountInput(e.target.value)}
                  placeholder="0"
                  autoFocus
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeFrozenEditModal}>
                  {t('common.cancel')}
                </button>
                {frozenEditingNeoBank.status === 'frozen' && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleFrozenUnfreeze}
                    disabled={freezeMutation.isPending || unfreezeMutation.isPending}
                  >
                    {t('dropNeoBanks.freezeModal.unfreezeButton')}
                  </button>
                )}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={freezeMutation.isPending || unfreezeMutation.isPending}
                >
                  {frozenEditingNeoBank.status === 'active'
                    ? t('dropNeoBanks.freezeModal.freezeButton')
                    : t('dropNeoBanks.frozenEditModal.updateAmountButton')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
