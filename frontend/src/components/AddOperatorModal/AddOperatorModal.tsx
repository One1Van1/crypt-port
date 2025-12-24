import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Mail, Lock, Shield, AlertCircle, Loader } from 'lucide-react';
import Modal from '../Modal/Modal';
import { usersService } from '../../services/users.service';
import './AddOperatorModal.css';

interface AddOperatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddOperatorModal({ isOpen, onClose }: AddOperatorModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'operator',
  });
  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: usersService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to create operator');
    },
  });

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'operator',
    });
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    createMutation.mutate(formData);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('operators.addOperator')} size="medium">
      <form onSubmit={handleSubmit} className="add-operator-form">
        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="username">{t('auth.username')}</label>
          <div className="input-wrapper">
            <User size={18} />
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder={t('auth.username')}
              required
              minLength={3}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">{t('auth.email')}</label>
          <div className="input-wrapper">
            <Mail size={18} />
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder={t('auth.email')}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="password">{t('auth.password')}</label>
          <div className="input-wrapper">
            <Lock size={18} />
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={t('auth.password')}
              required
              minLength={6}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="role">{t('operators.role')}</label>
          <div className="input-wrapper">
            <Shield size={18} />
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            >
              <option value="operator">{t('operators.roleOperator')}</option>
              <option value="teamlead">{t('operators.roleTeamlead')}</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={handleClose}>
            {t('common.cancel')}
          </button>
          <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <>
                <Loader size={18} className="spin" />
                {t('common.loading')}
              </>
            ) : (
              t('operators.create')
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
