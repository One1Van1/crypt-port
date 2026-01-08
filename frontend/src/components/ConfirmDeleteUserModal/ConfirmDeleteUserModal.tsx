import './ConfirmDeleteUserModal.css';
import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ConfirmDeleteUserModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  error?: string;
  userLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmDeleteUserModal({
  isOpen,
  isLoading,
  error,
  userLabel,
  onConfirm,
  onClose,
}: ConfirmDeleteUserModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isLoading) return;
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="confirm-delete-overlay"
      onClick={() => {
        if (isLoading) return;
        onClose();
      }}
    >
      <div className="confirm-delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-delete-header">
          <h3 className="confirm-delete-title">Подтвердите удаление</h3>
          <button
            className="confirm-delete-close"
            type="button"
            onClick={() => {
              if (isLoading) return;
              onClose();
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="confirm-delete-body">
          <p>
            Точно ли вы хотите удалить пользователя <strong>"{userLabel}"</strong>?
          </p>
          <p className="confirm-delete-warning">Это действие нельзя отменить</p>
          {error && <div className="confirm-delete-error">{error}</div>}
        </div>

        <div className="confirm-delete-actions">
          <button className="users-btn danger" onClick={onConfirm} disabled={Boolean(isLoading)}>
            {isLoading ? 'Удаление…' : 'Удалить'}
          </button>
          <button className="users-btn secondary" onClick={onClose} disabled={Boolean(isLoading)}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
