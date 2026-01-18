import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit3, Trash2, Save, X, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import { platformsService } from '../../services/platforms.service';
import { platformExchangesService } from '../../services/platform-exchanges.service';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/user.types';
import './Platforms.css';

interface PlatformFormData {
  name: string;
  exchangeRate: number;
  balance: number;
}

export default function Platforms() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const location = useLocation();

  const [focusPlatformId, setFocusPlatformId] = useState<number | null>(null);
  const platformCardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [formData, setFormData] = useState<PlatformFormData>({
    name: '',
    exchangeRate: '' as any,
    balance: '' as any,
  });

  useEffect(() => {
    const state = location.state as { focusPlatformId?: unknown } | null;
    const raw = state?.focusPlatformId;
    const id =
      typeof raw === 'number'
        ? raw
        : typeof raw === 'string' && /^[0-9]+$/.test(raw.trim())
          ? Number(raw)
          : null;

    if (!id || !Number.isFinite(id)) return;
    setFocusPlatformId(id);
    window.history.replaceState({}, document.title);
  }, [location.state]);

  useEffect(() => {
    if (!focusPlatformId) return;
    let raf = 0;
    const tryScroll = () => {
      const el = platformCardRefs.current.get(focusPlatformId);
      if (!el) {
        raf = window.requestAnimationFrame(tryScroll);
        return;
      }

      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    raf = window.requestAnimationFrame(tryScroll);
    const timeout = window.setTimeout(() => setFocusPlatformId(null), 2600);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
    };
  }, [focusPlatformId]);

  // Fetch platforms
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['platforms'],
    queryFn: () => platformsService.getAll(),
  });

  const {
    data: exchangesData,
    isLoading: isExchangesLoading,
    refetch: refetchExchanges,
  } = useQuery({
    queryKey: ['platform-exchanges'],
    queryFn: () => platformExchangesService.getAll({ limit: 50 }),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: PlatformFormData) => platformsService.create(data),
    onSuccess: () => {
      toast.success('Площадка создана');
      queryClient.invalidateQueries({ queryKey: ['platforms'] });
      setIsCreateModalOpen(false);
      setFormData({ name: '', exchangeRate: '' as any, balance: '' as any });
    },
    onError: () => {
      toast.error('Ошибка создания площадки');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PlatformFormData> }) =>
      platformsService.update(id, data),
    onSuccess: () => {
      toast.success('Площадка обновлена');
      queryClient.invalidateQueries({ queryKey: ['platforms'] });
      setEditingId(null);
      setFormData({ name: '', exchangeRate: '' as any, balance: '' as any });
    },
    onError: () => {
      toast.error('Ошибка обновления площадки');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => platformsService.delete(id),
    onSuccess: () => {
      toast.success('Площадка удалена');
      queryClient.invalidateQueries({ queryKey: ['platforms'] });
      setDeleteConfirm(null);
    },
    onError: () => {
      toast.error('Ошибка удаления площадки');
    },
  });

  // Access control
  if (user?.role !== UserRole.ADMIN) {
    return (
      <div className="platforms-page">
        <div className="access-denied">
          <h2>Доступ запрещен</h2>
          <p>Эта страница доступна только администраторам</p>
        </div>
      </div>
    );
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Введите название площадки');
      return;
    }
    createMutation.mutate(formData);
  };

  const handleUpdate = (id: number) => {
    if (!formData.name.trim()) {
      toast.error('Введите название площадки');
      return;
    }
    updateMutation.mutate({ id, data: formData });
  };

  const handleDelete = (id: number, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteMutation.mutate(deleteConfirm.id);
    }
  };

  const startEdit = (platform: any) => {
    setEditingId(platform.id);
    setFormData({
      name: platform.name,
      exchangeRate: platform.exchangeRate,
      balance: platform.balance,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', exchangeRate: '' as any, balance: '' as any });
  };

  if (isLoading) {
    return (
      <div className="platforms-page">
        <div className="loading-state">
          <RefreshCw size={32} className="spin" />
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="platforms-page">
      <div className="platforms-header">
        <div>
          <h1>Управление площадками</h1>
          <p className="platforms-subtitle">Создание, редактирование и удаление площадок</p>
        </div>
        <div className="platforms-header-actions">
          <button className="btn-icon" onClick={() => refetch()}>
            <RefreshCw size={18} />
          </button>
          <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={18} />
            Создать площадку
          </button>
        </div>
      </div>

      <div className="platforms-list">
        {data?.items.map((platform) => (
          <div
            key={platform.id}
            ref={(el) => {
              if (el) platformCardRefs.current.set(Number(platform.id), el);
              else platformCardRefs.current.delete(Number(platform.id));
            }}
            className={`platform-card ${
              focusPlatformId && Number(platform.id) === focusPlatformId ? 'platform-card-highlight' : ''
            }`}
          >
            {editingId === platform.id ? (
              <div className="platform-edit-form">
                <div className="form-group">
                  <label>Название</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Название площадки"
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>Курс обмена (1 USDT = X ARS)</label>
                  <input
                    type="number"
                    value={formData.exchangeRate}
                    onChange={(e) =>
                      setFormData({ ...formData, exchangeRate: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="Курс обмена"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>Баланс (USDT)</label>
                  <input
                    type="number"
                    value={formData.balance}
                    onChange={(e) =>
                      setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="Баланс"
                    step="0.01"
                  />
                </div>
                <div className="platform-edit-actions">
                  <button
                    className="btn-success"
                    onClick={() => handleUpdate(platform.id)}
                    disabled={updateMutation.isPending}
                  >
                    <Save size={16} />
                    Сохранить
                  </button>
                  <button className="btn-secondary" onClick={cancelEdit}>
                    <X size={16} />
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="platform-info">
                  <div className="platform-name">{platform.name}</div>
                  <div className="platform-details">
                    <div className="platform-detail-item">
                      <span className="platform-detail-label">Курс:</span>
                      <span className="platform-rate">
                        {platform.exchangeRate.toFixed(2)} ARS
                      </span>
                    </div>
                    <div className="platform-detail-item">
                      <span className="platform-detail-label">Баланс:</span>
                      <span className="platform-balance">
                        {Number(platform.balance).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                        USDT
                      </span>
                    </div>
                    <span
                      className={`platform-status ${platform.status === 'active' ? 'active' : 'inactive'}`}
                    >
                      {platform.status === 'active' ? 'Активна' : 'Неактивна'}
                    </span>
                  </div>
                </div>
                <div className="platform-actions">
                  <button
                    className="btn-icon-small btn-edit"
                    onClick={() => startEdit(platform)}
                    title="Редактировать"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    className="btn-icon-small btn-delete"
                    onClick={() => handleDelete(platform.id, platform.name)}
                    title="Удалить"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="platforms-history">
        <div className="platforms-history-header">
          <div>
            <h2>История выводов с площадок</h2>
              <p className="platforms-history-subtitle">Последние операции конвертации USDT → песо</p>
          </div>
          <button className="btn-icon" onClick={() => refetchExchanges()} title="Обновить историю">
            <RefreshCw size={18} />
          </button>
        </div>

        {isExchangesLoading ? (
          <div className="platforms-history-loading">
            <RefreshCw size={24} className="spin" />
            <p>{t('common.loading')}</p>
          </div>
        ) : !exchangesData?.items?.length ? (
          <div className="platforms-history-empty">Нет операций</div>
        ) : (
          <div className="platforms-history-table-wrapper">
            <table className="platforms-history-table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Площадка</th>
                  <th>USDT</th>
                  <th>Курс</th>
                  <th>Peso</th>
                </tr>
              </thead>
              <tbody>
                {exchangesData.items.map((row) => (
                  <tr key={row.id}>
                    <td>{new Date(row.createdAt).toLocaleString('ru-RU')}</td>
                    <td>{row.platformName || `#${row.platformId}`}</td>
                    <td>
                      {Number(row.usdtAmount).toLocaleString('ru-RU', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td>
                      {Number(row.exchangeRate).toLocaleString('ru-RU', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td>
                      {Number(row.pesosAmount).toLocaleString('es-AR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Создать площадку</h2>
              <button className="btn-icon" onClick={() => setIsCreateModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="modal-form">
              <div className="form-group">
                <label>Название площадки</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Например: Binance P2P"
                  autoFocus
                  required
                />
              </div>
              <div className="form-group">
                <label>Курс обмена (1 USDT = X ARS)</label>
                <input
                  type="number"
                  value={formData.exchangeRate}
                  onChange={(e) =>
                    setFormData({ ...formData, exchangeRate: e.target.value ? parseFloat(e.target.value) : '' as any })
                  }
                  placeholder="Введите курс"
                  step="any"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Баланс (USDT)</label>
                <input
                  type="number"
                  value={formData.balance}
                  onChange={(e) =>
                    setFormData({ ...formData, balance: e.target.value ? parseFloat(e.target.value) : '' as any })
                  }
                  placeholder="Введите сумму"
                  step="any"
                  min="0"
                />
              </div>
              <div className="modal-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={createMutation.isPending}
                >
                  <Plus size={18} />
                  Создать
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content modal-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Подтвердите действие</h2>
              <button className="btn-icon" onClick={() => setDeleteConfirm(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Удалить площадку <strong>"{deleteConfirm.name}"</strong>?</p>
              <p className="warning-text">Это действие нельзя отменить</p>
            </div>
            <div className="modal-actions">
              <button
                className="btn-danger"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
              >
                <Trash2 size={18} />
                Удалить
              </button>
              <button
                className="btn-secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
