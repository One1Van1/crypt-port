import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  operatorService,
  TransactionForOperator,
  DropTransactionsParams,
} from '../../services/operator.service';
import { useAuthStore } from '../../store/authStore';
import { dropsService } from '../../services/drops.service';
import dropNeoBanksService, { DropNeoBank } from '../../services/drop-neo-banks.service';
import './Drops.css';

const Drops = () => {
  type DropsListItem = {
    id: number;
    name: string;
    comment: string | null;
    status: string;
    accountsCount: number;
    banks: { name: string }[];
    neoBanks: Pick<DropNeoBank, 'id' | 'provider' | 'accountId' | 'alias' | 'status'>[];
  };

  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [drops, setDrops] = useState<DropsListItem[]>([]);
  const [selectedDropId, setSelectedDropId] = useState<number | null>(null);
  const [dropTransactions, setDropTransactions] = useState<TransactionForOperator[]>([]);
  const [dropTransactionsTotal, setDropTransactionsTotal] = useState(0);
  const [showFullDropHistory, setShowFullDropHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createComment, setCreateComment] = useState('');
  const [creating, setCreating] = useState(false);

  const createNameInputRef = useRef<HTMLInputElement | null>(null);

  const isAdminOrTeamlead = user?.role === 'admin' || user?.role === 'teamlead';

  useEffect(() => {
    fetchDrops();
  }, []);

  useEffect(() => {
    if (!isCreateModalOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCreateModalOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isCreateModalOpen]);

  useEffect(() => {
    if (!isCreateModalOpen) return;

    setTimeout(() => {
      createNameInputRef.current?.focus();
    }, 0);
  }, [isCreateModalOpen]);

  const fetchDrops = async () => {
    try {
      const data = await dropsService.getAll();

      const mapped: DropsListItem[] = data.items.map((drop: any) => ({
        id: Number(drop.id),
        name: drop.name,
        comment: drop.comment ?? null,
        status: drop.status,
        accountsCount: 0,
        banks: [],
        neoBanks: [],
      }));

      setDrops(mapped);

      // Hydrate cards with banks + neo-banks per drop (runs after basic list render)
      const ids = mapped.map((d) => d.id);
      if (ids.length > 0) {
        void hydrateDropsDetails(ids);
      }
    } catch (error) {
      console.error('Error fetching drops:', error);
    }
  };

  const hydrateDropsDetails = async (dropIds: number[]) => {
    const results = await Promise.allSettled(
      dropIds.map(async (dropId) => {
        const [dropDetails, neoBanksData] = await Promise.all([
          dropsService.getById(String(dropId)) as Promise<any>,
          dropNeoBanksService.getAll({ dropId }),
        ]);

        const bankAccounts: Array<{ bankName?: string | null }> = dropDetails?.bankAccounts ?? [];
        const bankNames = new Set<string>();
        for (const ba of bankAccounts) {
          const name = (ba?.bankName ?? '').trim();
          if (name) bankNames.add(name);
        }

        const banks = [...bankNames].sort((a, b) => a.localeCompare(b, 'ru')).map((name) => ({ name }));

        const neoBanks = (neoBanksData?.items ?? [])
          .map((nb) => ({
            id: nb.id,
            provider: nb.provider,
            accountId: nb.accountId,
            alias: nb.alias,
            status: nb.status,
          }))
          .sort((a, b) => {
            const statusOrder = (s: string) => (s === 'active' ? 0 : s === 'frozen' ? 1 : 2);
            const so = statusOrder(String(a.status)) - statusOrder(String(b.status));
            if (so !== 0) return so;

            const ap = String(a.provider ?? '').trim().toLowerCase();
            const bp = String(b.provider ?? '').trim().toLowerCase();
            const ps = ap.localeCompare(bp, 'ru');
            if (ps !== 0) return ps;

            const aa = String(a.accountId ?? '').trim().toLowerCase();
            const bb = String(b.accountId ?? '').trim().toLowerCase();
            return aa.localeCompare(bb, 'ru');
          });

        const accountsCount = bankAccounts.length + neoBanks.length;

        return { dropId, banks, neoBanks, accountsCount };
      }),
    );

    const byId = new Map<number, { banks: DropsListItem['banks']; neoBanks: DropsListItem['neoBanks']; accountsCount: number }>();
    for (const r of results) {
      if (r.status !== 'fulfilled') continue;
      byId.set(r.value.dropId, {
        banks: r.value.banks,
        neoBanks: r.value.neoBanks,
        accountsCount: r.value.accountsCount,
      });
    }

    if (byId.size === 0) return;

    setDrops((prev) =>
      prev.map((d) => {
        const extra = byId.get(d.id);
        return extra ? { ...d, ...extra } : d;
      }),
    );
  };

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

  const handleDropClick = async (dropId: number) => {
    if (selectedDropId === dropId && !showFullDropHistory) {
      setSelectedDropId(null);
      setDropTransactions([]);
      return;
    }

    setLoading(true);
    setSelectedDropId(dropId);
    setShowFullDropHistory(false);

    try {
      const params: DropTransactionsParams = { limit: 5 };
      const data = await operatorService.getDropTransactions(dropId, params);
      setDropTransactions(data.items);
      setDropTransactionsTotal(data.total);
    } catch (error) {
      console.error('Error fetching drop transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDrop = async () => {
    const name = createName.trim();
    const comment = createComment.trim();

    if (!name) {
      toast.error('Введите название дропа');
      createNameInputRef.current?.focus();
      return;
    }

    setCreating(true);
    try {
      await dropsService.create({
        name,
        ...(comment ? { comment } : {}),
      });

      setCreateName('');
      setCreateComment('');

      // Обновляем список дропов, чтобы сразу отобразить
      // созданный дроп из актуальных данных бэкенда.
      await fetchDrops();

      toast.success('Дроп создан');
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating drop:', error);
      toast.error(getErrorMessage(error, 'Не удалось создать дроп'));
    } finally {
      setCreating(false);
    }
  };

  const loadFullDropHistory = async () => {
    if (!selectedDropId) return;

    setLoading(true);
    try {
      const params: DropTransactionsParams = { limit: 100 };
      const data = await operatorService.getDropTransactions(selectedDropId, params);
      setDropTransactions(data.items);
      setShowFullDropHistory(true);
    } catch (error) {
      console.error('Error fetching full drop history:', error);
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
    <div className="operator-drops">
      <h1>Дропы</h1>

      <div className="section">
        <div className="drops-section-header">
          <h2>Дропы</h2>
          {isAdminOrTeamlead && (
            <button
              className="drops-create-btn"
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Создать дроп
            </button>
          )}
        </div>

        {isAdminOrTeamlead && isCreateModalOpen && (
          <div
            className="modal-overlay"
            role="dialog"
            aria-modal="true"
            onClick={() => setIsCreateModalOpen(false)}
          >
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Создать дроп</h3>
              </div>

              <div className="modal-body">
                <label className="modal-label">
                  Название
                  <input
                    className="modal-input"
                    placeholder="Введите название дропа"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    ref={createNameInputRef}
                  />
                </label>

                <label className="modal-label">
                  Комментарий
                  <input
                    className="modal-input"
                    placeholder="Опционально: комментарий к дропу"
                    value={createComment}
                    onChange={(e) => setCreateComment(e.target.value)}
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
                  Отмена
                </button>
                <button
                  className="load-more-btn modal-primary-btn"
                  type="button"
                  onClick={handleCreateDrop}
                  disabled={creating}
                >
                  {creating ? 'Создаем…' : 'Создать'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="content-wrapper">
          <div className="drops-grid">
            {drops.map((drop) => (
              <div
                key={drop.id}
                className={`drop-card ${selectedDropId === drop.id ? 'selected' : ''}`}
                onClick={() => handleDropClick(drop.id)}
              >
                <div className="drop-header">
                  <h3>{drop.name}</h3>
                  <span className={`status-badge ${getStatusBadge(drop.status)}`}>
                    {translateStatus(drop.status)}
                  </span>
                </div>

                {drop.comment && <p className="drop-comment">{drop.comment}</p>}

                <div className="drop-info">
                  <p>Счетов: {drop.accountsCount}</p>
                  <div className="drop-banks">
                    <p className="drop-banks-title">Физ. банки:</p>
                    {drop.banks.length === 0 ? (
                      <span className="bank-tag">—</span>
                    ) : (
                      drop.banks.map((bank) => (
                        <span key={bank.name} className="bank-tag">
                          {bank.name}
                        </span>
                      ))
                    )}
                  </div>

                  <div className="drop-banks">
                    <p className="drop-banks-title">Нео-банки:</p>
                    {(() => {
                      const all = drop.neoBanks;
                      if (!all || all.length === 0) {
                        return <span className="bank-tag">—</span>;
                      }

                      const providerCounts = new Map<string, number>();
                      for (const nb of all) {
                        const key = String(nb.provider ?? '').trim().toLowerCase();
                        if (!key) continue;
                        providerCounts.set(key, (providerCounts.get(key) ?? 0) + 1);
                      }

                      const label = (nb: (typeof all)[number]): string => {
                        const provider = String(nb.provider ?? '').trim();
                        const accountId = String(nb.accountId ?? '').trim();
                        if (!provider) return accountId || '—';

                        const key = provider.toLowerCase();
                        const needsAccount = (providerCounts.get(key) ?? 0) > 1;
                        return needsAccount && accountId ? `${provider} (${accountId})` : provider;
                      };

                      const active = all.filter((nb) => nb.status === 'active');
                      const frozen = all.filter((nb) => nb.status === 'frozen');

                      return (
                        <>
                          <div className="drop-neo-banks-group">
                            <div className="drop-neo-banks-group-title">Активные</div>
                            {active.length === 0 ? (
                              <span className="bank-tag">—</span>
                            ) : (
                              active.map((nb) => (
                                <span key={nb.id} className="bank-tag">
                                  {label(nb)}
                                </span>
                              ))
                            )}
                          </div>

                          <div className="drop-neo-banks-group">
                            <div className="drop-neo-banks-group-title">Замороженные</div>
                            {frozen.length === 0 ? (
                              <span className="bank-tag">—</span>
                            ) : (
                              frozen.map((nb) => (
                                <span key={nb.id} className="bank-tag">
                                  {label(nb)}
                                </span>
                              ))
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* История транзакций дропа */}
          <div className="transactions-history">
            <h3>История транзакций дропа</h3>

            {!selectedDropId ? (
              <div className="history-placeholder">
                <p>Выберите дроп для просмотра истории</p>
              </div>
            ) : (
              <>
                {loading ? (
                  <p>Загрузка...</p>
                ) : (
                  <>
                    <div className="transactions-list">
                      {dropTransactions.length === 0 ? (
                        <p>Нет транзакций</p>
                      ) : (
                        dropTransactions.map((tx) => (
                          <div
                            key={tx.id}
                            className={`transaction-item ${isAdminOrTeamlead ? 'transaction-item-clickable' : ''}`}
                            onDoubleClick={() => {
                              if (!isAdminOrTeamlead) return;
                              navigate('/transactions', {
                                state: {
                                  highlightTransactionId: tx.id,
                                  viewMode: 'all',
                                  source: 'banks',
                                },
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
                              {tx.bankName && <span>Банк: {tx.bankName}</span>}
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
                    {dropTransactionsTotal > 5 && !showFullDropHistory && (
                      <button className="load-more-btn" onClick={loadFullDropHistory}>
                        Показать всю историю ({dropTransactionsTotal} транзакций)
                      </button>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Drops;
