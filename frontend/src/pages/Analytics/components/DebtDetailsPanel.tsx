import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { History } from 'lucide-react';
import { debtAdminService, type DebtOperationItem, type DebtOperationType } from '../../../services/debt-admin.service';
import { useAuthStore } from '../../../store/authStore';
import { UserRole } from '../../../types/user.types';

type DebtSummary = {
  totalUsdt: number;
  currentDebtUsdt: number;
  totalRepaidUsdt: number;
};

export function DebtDetailsPanel({ debtSummary }: { debtSummary?: DebtSummary }) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [amountDraft, setAmountDraft] = useState<string>('');
  const [commentDraft, setCommentDraft] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const limit = 5;

  const { data: currentDebt, isLoading: isDebtLoading } = useQuery({
    queryKey: ['adminDebtCurrent'],
    queryFn: () => debtAdminService.getCurrent(),
  });

  const { data: operations, isLoading: isOperationsLoading } = useQuery({
    queryKey: ['adminDebtOperations', page, limit],
    queryFn: () => debtAdminService.getOperations({ page, limit }),
  });

  const totalPages = useMemo(() => {
    if (!operations) return 1;
    return Math.max(1, Math.ceil((operations.total || 0) / limit));
  }, [operations, limit]);

  useEffect(() => {
    if (!operations) return;
    if (page <= totalPages) return;
    setPage(totalPages);
  }, [operations, page, totalPages]);

  const canEdit = user?.role === UserRole.ADMIN;

  const increaseDebtMutation = useMutation({
    mutationFn: (dto: { amountUsdt: number; comment?: string }) => debtAdminService.increase(dto),
    onSuccess: (res) => {
      toast.success(`Долг увеличен на ${Number(res.deltaUsdt || 0).toFixed(2)} USDT`);
      queryClient.invalidateQueries({ queryKey: ['adminDebtCurrent'] });
      queryClient.invalidateQueries({ queryKey: ['adminDebtOperations'] });
      queryClient.invalidateQueries({ queryKey: ['workingDepositSections'] });
      setCommentDraft('');
      setAmountDraft('');
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Ошибка увеличения долга');
    },
  });

  const decreaseDebtMutation = useMutation({
    mutationFn: (dto: { amountUsdt: number; comment?: string }) => debtAdminService.decrease(dto),
    onSuccess: (res) => {
      toast.success(`Долг уменьшен на ${Math.abs(Number(res.deltaUsdt || 0)).toFixed(2)} USDT`);
      queryClient.invalidateQueries({ queryKey: ['adminDebtCurrent'] });
      queryClient.invalidateQueries({ queryKey: ['adminDebtOperations'] });
      queryClient.invalidateQueries({ queryKey: ['workingDepositSections'] });
      setCommentDraft('');
      setAmountDraft('');
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Ошибка уменьшения долга');
    },
  });

  const parsedAmount = useMemo(() => {
    const raw = amountDraft.trim();
    if (raw === '') return NaN;
    const v = Number(raw.replace(',', '.'));
    return Number.isFinite(v) ? v : NaN;
  }, [amountDraft]);

  const formatOperationType = (type: DebtOperationType) => {
    if (type === 'MANUAL_SET') return 'Ручная установка';
    if (type === 'REPAYMENT_FROM_UNPAID_PESO_EXCHANGE') return 'Погашение из неоплаченного обмена';
    return type;
  };

  const renderOpRow = (op: DebtOperationItem) => {
    const delta = Number(op.deltaUsdt || 0);
    const isIncrease = delta > 0;
    const deltaColor = isIncrease ? '#ef4444' : '#10b981';

    return (
      <div
        key={op.id}
        style={{
          border: '1px solid var(--border-color)',
          borderRadius: 10,
          padding: '10px 12px',
          display: 'grid',
          gap: 6,
          background: 'var(--card-bg)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{formatOperationType(op.type)}</div>
          <div style={{ fontWeight: 900, color: deltaColor }}>{delta.toFixed(2)} USDT</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
          <div>{new Date(op.createdAt).toLocaleString('ru-RU')}</div>
          <div>
            {op.createdByUserUsername || op.createdByUserEmail ? (
              <span>
                {op.createdByUserUsername ? op.createdByUserUsername : op.createdByUserEmail}
              </span>
            ) : (
              <span>—</span>
            )}
          </div>
        </div>

        {op.sourceConversionId ? (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Источник: обмен #{op.sourceConversionId}</div>
        ) : null}

        {op.comment ? (
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{op.comment}</div>
        ) : null}
      </div>
    );
  };

  return (
    <div>
      <div style={{ fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12, fontSize: '1rem' }}>📌 Долг</div>

      <div style={{ display: 'grid', gap: 0, fontSize: '0.95rem', marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Текущий долг</span>
          <span style={{ color: '#f43f5e', fontWeight: 900 }}>{Number(currentDebt?.amountUsdt ?? debtSummary?.currentDebtUsdt ?? 0).toFixed(2)} USDT</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Всего погашено</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{Number(debtSummary?.totalRepaidUsdt ?? 0).toFixed(2)} USDT</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Влияние на депозит</span>
          <span style={{ color: '#f43f5e', fontWeight: 800 }}>{Number(debtSummary?.totalUsdt ?? 0).toFixed(2)} USDT</span>
        </div>
      </div>

      <div style={{ border: '1px solid var(--border-color)', borderRadius: 12, padding: 12, marginBottom: 14 }}>
        <div style={{ fontWeight: 900, marginBottom: 10, color: 'var(--text-primary)' }}>Управление</div>

        {!canEdit ? (
          <div style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Только ADMIN может менять долг</div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'grid', gap: 6 }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Новый долг (USDT)</label>
              <input
                value={amountDraft}
                onChange={(e) => {
                  setAmountDraft(e.target.value);
                }}
                inputMode="decimal"
                placeholder="Укажите сумму долга"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'grid', gap: 6 }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Комментарий (опционально)</label>
              <textarea
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                rows={2}
                placeholder="Например: корректировка"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                disabled={!Number.isFinite(parsedAmount) || parsedAmount <= 0 || increaseDebtMutation.isPending}
                onClick={() => increaseDebtMutation.mutate({ amountUsdt: parsedAmount, comment: commentDraft || undefined })}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid rgba(244, 63, 94, 0.35)',
                  background: 'rgba(244, 63, 94, 0.18)',
                  color: 'var(--text-primary)',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Увеличить долг
              </button>

              <button
                type="button"
                disabled={!Number.isFinite(parsedAmount) || parsedAmount <= 0 || decreaseDebtMutation.isPending}
                onClick={() => {
                  const current = Number(currentDebt?.amountUsdt ?? debtSummary?.currentDebtUsdt ?? 0);

                  if (current <= 0) {
                    toast.error('Долг отсутствует');
                    return;
                  }

                  if (parsedAmount > current) {
                    toast.error('Вы указали сумму больше суммы долга');
                    return;
                  }

                  decreaseDebtMutation.mutate({ amountUsdt: parsedAmount, comment: commentDraft || undefined });
                }}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Уменьшить долг
              </button>

              <button
                type="button"
                disabled={
                  decreaseDebtMutation.isPending ||
                  Number(currentDebt?.amountUsdt ?? debtSummary?.currentDebtUsdt ?? 0) <= 0
                }
                onClick={() => {
                  const current = Number(currentDebt?.amountUsdt ?? debtSummary?.currentDebtUsdt ?? 0);

                  if (current <= 0) {
                    toast.error('Долг отсутствует');
                    return;
                  }

                  decreaseDebtMutation.mutate({
                    amountUsdt: current,
                    comment: commentDraft || 'Аннулирование долга',
                  });
                }}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid rgba(244, 63, 94, 0.35)',
                  background: 'rgba(244, 63, 94, 0.10)',
                  color: 'var(--text-primary)',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Аннулировать долг
              </button>
            </div>

            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
              Изменение применяется к текущему долгу (не установка абсолютного значения).
            </div>
          </div>
        )}

        {isDebtLoading ? (
          <div style={{ marginTop: 10, color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Загрузка текущего долга…</div>
        ) : null}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 900, color: 'var(--text-primary)' }}>
          <History size={16} />
          История операций
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
            Стр. {page}/{totalPages} · по {limit}
          </div>
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            style={{
              padding: '6px 10px',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            Назад
          </button>
          <button
            type="button"
            disabled={!operations || page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            style={{
              padding: '6px 10px',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            Вперёд
          </button>
        </div>
      </div>

      {isOperationsLoading ? (
        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Загрузка истории…</div>
      ) : operations?.items?.length ? (
        <div style={{ display: 'grid', gap: 10 }}>{operations.items.map(renderOpRow)}</div>
      ) : (
        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Нет операций</div>
      )}
    </div>
  );
}
