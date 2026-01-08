import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Mail, MessageSquare, Phone, XCircle } from 'lucide-react';
import CustomSelect from '../../components/CustomSelect/CustomSelect';
import ConfirmDeleteUserModal from '../../components/ConfirmDeleteUserModal/ConfirmDeleteUserModal';
import { usersService } from '../../services/users.service';
import { userRegistrationService } from '../../services/userRegistration.service';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';
import type { AdminUpdateUserPayload } from '../../types/adminUser.types';
import '../Users/Users.css';
import './Profile.css';
import './ProfileUsersCards.css';

const AVATAR_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#84cc16'
];

const getInitials = (name: string) => {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getAvatarColor = (name: string) => {
  const str = name || 'U';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    // eslint-disable-next-line no-bitwise
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

const getStatusBadgeClass = (status: string) => {
  return status === 'active' ? 'status-active' : 'status-inactive';
};

const getRoleBadgeClass = (role: string) => {
  switch (role) {
    case 'admin':
      return 'role-admin';
    case 'teamlead':
      return 'role-teamlead';
    case 'operator':
      return 'role-operator';
    case 'pending':
      return 'role-pending';
    default:
      return 'role-operator';
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function Profile() {
  const { t } = useTranslation();
  const { id } = useParams();
  const currentUser = useAuthStore((state) => state.user);

  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'operator' | 'teamlead'>('operator');
  const [createdQrUrl, setCreatedQrUrl] = useState('');
  const [createError, setCreateError] = useState('');

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<AdminUpdateUserPayload & { password?: string }>({});
  const [editError, setEditError] = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; label: string } | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const userId = useMemo(() => (id ? String(id) : ''), [id]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('Missing user id');
      return usersService.getProfile(userId);
    },
    enabled: Boolean(userId),
  });

  const createUserMutation = useMutation({
    mutationFn: async () => {
      setCreateError('');
      setCreatedQrUrl('');

      const created = await userRegistrationService.createUserWithQr({
        username: newUsername,
        email: newEmail,
        password: newPassword,
        role: newRole,
      });

      const qrBlob = await authService.getQRCode(created.tempToken);
      const qrUrl = URL.createObjectURL(qrBlob);
      setCreatedQrUrl(qrUrl);

      setNewUsername('');
      setNewEmail('');
      setNewPassword('');

      return created;
    },
    onError: (err: any) => {
      setCreateError(err?.response?.data?.message || t('profile.errors.createUserFailed'));
    },
  });

  const isAdmin = currentUser?.role === 'admin';

  const activeUsersQuery = useQuery({
    queryKey: ['admin-users-list', 'active'],
    queryFn: async () => {
      const response = await usersService.adminGetActive();
      return response.items;
    },
    enabled: Boolean(isAdmin),
  });

  const inactiveUsersQuery = useQuery({
    queryKey: ['admin-users-list', 'inactive'],
    queryFn: async () => {
      const response = await usersService.adminGetInactive();
      return response.items;
    },
    enabled: Boolean(isAdmin),
  });

  const adminUpdateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: AdminUpdateUserPayload & { password?: string } }) => {
      setEditError('');
      const cleaned: Record<string, unknown> = { ...payload };

      const isSelf = String(currentUser?.id) === String(id);
      if (isSelf) {
        delete cleaned.role;
        delete cleaned.status;
      }

      if (!cleaned.password) {
        delete cleaned.password;
      }
      return usersService.adminUpdate(id, cleaned);
    },
    onSuccess: async () => {
      await Promise.all([activeUsersQuery.refetch(), inactiveUsersQuery.refetch()]);
      setEditingUserId(null);
      setEditDraft({});
    },
    onError: (err: any) => {
      setEditError(err?.response?.data?.message || t('profile.errors.updateUserFailed'));
    },
  });

  const adminDeleteMutation = useMutation({
    mutationFn: async (deleteUserId: string) => {
      setDeleteError('');
      await usersService.adminDelete(deleteUserId);
    },
    onSuccess: async () => {
      await Promise.all([activeUsersQuery.refetch(), inactiveUsersQuery.refetch()]);
      if (deleteConfirm?.id && editingUserId === deleteConfirm.id) {
        setEditingUserId(null);
        setEditDraft({});
        setEditError('');
      }
      setDeleteConfirm(null);
      setDeleteError('');
    },
    onError: (err: any) => {
      setDeleteError(err?.response?.data?.message || t('profile.errors.deleteUserFailed'));
    },
  });

  if (isLoading) {
    return <div className="profile-page">{t('common.loading')}</div>;
  }

  if (error || !data) {
    return <div className="profile-page">{t('profile.errors.loadProfileFailed')}</div>;
  }

  const roleLabelMap: Record<string, string> = {
    admin: t('users.roles.admin'),
    teamlead: t('users.roles.teamlead'),
    operator: t('users.roles.operator'),
    pending: t('users.roles.pending'),
  };

  const statusLabelMap: Record<string, string> = {
    active: t('users.status.active'),
    inactive: t('users.status.inactive'),
  };

  const rows: Array<{ label: string; value?: string }> = [
    { label: t('profile.fields.username'), value: data.username },
    { label: t('profile.fields.email'), value: data.email },
    { label: t('profile.fields.phone'), value: data.phone || '-' },
    { label: t('profile.fields.telegram'), value: data.telegram || '-' },
    { label: t('profile.fields.role'), value: roleLabelMap[data.role] || data.role },
  ];

  return (
    <div className="profile-page">
      <ConfirmDeleteUserModal
        isOpen={Boolean(deleteConfirm)}
        userLabel={deleteConfirm?.label || ''}
        isLoading={adminDeleteMutation.isPending}
        error={deleteError}
        onClose={() => {
          if (adminDeleteMutation.isPending) return;
          setDeleteConfirm(null);
          setDeleteError('');
        }}
        onConfirm={() => {
          if (!deleteConfirm?.id) return;
          adminDeleteMutation.mutate(deleteConfirm.id);
        }}
      />

      <div className="profile-grid">
        <div className="profile-card profile-info">
          <h2 className="profile-title">{t('profile.title')}</h2>
          {rows.map((row) => (
            <div key={row.label} className="profile-row">
              <div className="profile-label">{row.label}</div>
              <div className="profile-value">{row.value}</div>
            </div>
          ))}
        </div>

        {isAdmin && (
          <div className="profile-card profile-admin">
            <h2 className="profile-title">{t('profile.registerUser')}</h2>

            {createError && <div className="profile-error">{createError}</div>}

            <form
              className="profile-form"
              onSubmit={(e) => {
                e.preventDefault();
                createUserMutation.mutate();
              }}
            >
              <div className="profile-form-group">
                <label className="profile-form-label">{t('profile.fields.username')}</label>
                <input
                  className="profile-input"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
                  autoComplete="off"
                />
              </div>

              <div className="profile-form-group">
                <label className="profile-form-label">{t('profile.fields.email')}</label>
                <input
                  className="profile-input"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  autoComplete="off"
                />
              </div>

              <div className="profile-form-group">
                <label className="profile-form-label">{t('profile.fields.password')}</label>
                <input
                  className="profile-input"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className="profile-form-group">
                <label className="profile-form-label">{t('profile.fields.role')}</label>
                <select
                  className="profile-input"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'operator' | 'teamlead')}
                >
                  <option value="operator">{t('users.roles.operator')}</option>
                  <option value="teamlead">{t('users.roles.teamlead')}</option>
                </select>
              </div>

              <button className="profile-button" type="submit" disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? t('profile.creating') : t('profile.createWithQr')}
              </button>
            </form>

            <div className="profile-qr-area">
              {createdQrUrl ? (
                <img className="profile-qr" src={createdQrUrl} alt={t('profile.qrAlt')} />
              ) : (
                <div className="profile-qr-placeholder">{t('profile.qrPlaceholder')}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="profile-users">
          <div className="profile-card profile-users-card">
            <h2 className="profile-title">{t('profile.usersTitle')}</h2>

            {editError && <div className="profile-error">{editError}</div>}

            {(activeUsersQuery.isLoading || inactiveUsersQuery.isLoading) ? (
              <div>{t('common.loading')}</div>
            ) : (activeUsersQuery.isError || inactiveUsersQuery.isError) ? (
              <div>{t('profile.errors.loadUsersFailed')}</div>
            ) : (
              <>
                <h3 className="profile-subtitle">{t('common.activeUsersTitle')}</h3>
                <div className="users-grid">
                  {(activeUsersQuery.data || []).length === 0 ? (
                    <div className="empty-state">
                      <p>{t('common.noActiveUsers')}</p>
                    </div>
                  ) : (
                    (activeUsersQuery.data || []).map((u: any) => {
                      const id = String(u.id);
                      const isEditing = editingUserId === id;
                      const displayName = u.username || u.email || 'User';
                      const statusValue = (isEditing ? (editDraft.status ?? u.status) : u.status) as string;
                      const roleValue = (isEditing ? (editDraft.role ?? u.role) : u.role) as string;
                      const isDeleted = Boolean(u.deletedAt);

                      return (
                        <div key={id} className="user-card">
                          <div className="user-card-header">
                            <div className="user-info-section">
                              <div
                                className="user-avatar-circle"
                                style={{ background: getAvatarColor(displayName) }}
                              >
                                {getInitials(displayName)}
                              </div>
                              <div className="user-details-section">
                                <h3 className="user-name-title">{u.username || '—'}</h3>
                                <div className="user-email-text">
                                  <Mail size={14} />
                                  {u.email}
                                </div>
                              </div>
                            </div>

                            <div className={`status-badge-button ${getStatusBadgeClass(statusValue)}`}>
                              {statusValue === 'active' ? (
                                <>
                                  <CheckCircle size={14} />
                                  {statusLabelMap.active}
                                </>
                              ) : (
                                <>
                                  <XCircle size={14} />
                                  {statusLabelMap.inactive}
                                </>
                              )}
                            </div>
                          </div>

                          <div className="user-card-body">
                            <div className="user-contact-section">
                              {u.phone && (
                                <div className="contact-item-row">
                                  <Phone size={14} />
                                  <span>{u.phone}</span>
                                </div>
                              )}
                              {u.telegram && (
                                <div className="contact-item-row">
                                  <MessageSquare size={14} />
                                  <span>@{u.telegram}</span>
                                </div>
                              )}
                              {!u.phone && !u.telegram && (
                                <div className="contact-item-row text-muted">{t('profile.noContacts')}</div>
                              )}
                            </div>

                            <div className="user-role-section">
                              <label className="role-label">{t('users.table.role')}</label>
                              <CustomSelect
                                value={roleValue}
                                onChange={(newRole: string) => {
                                  if (isDeleted) return;
                                  if (isEditing) {
                                    setEditDraft((p) => ({ ...p, role: newRole as any }));
                                    return;
                                  }
                                  adminUpdateMutation.mutate({ id, payload: { role: newRole as any } });
                                }}
                                options={[
                                  { value: 'admin', label: t('users.roles.admin') },
                                  { value: 'teamlead', label: t('users.roles.teamlead') },
                                  { value: 'operator', label: t('users.roles.operator') },
                                  { value: 'pending', label: t('users.roles.pending') },
                                ]}
                                disabled={adminUpdateMutation.isPending || isDeleted || String(currentUser?.id) === id}
                                triggerClassName={`role-select-dropdown ${getRoleBadgeClass(roleValue)}`}
                              />
                            </div>

                            <div className="user-meta-section">
                              <div className="meta-item">
                                <span className="meta-label">{t('users.table.registered')}</span>
                                <span className="meta-value">{formatDate(u.createdAt)}</span>
                              </div>
                            </div>

                            {isEditing ? (
                              <div className="profile-user-edit">
                                <div className="profile-user-edit-grid">
                                  <input
                                    className="users-input"
                                    value={editDraft.username ?? u.username ?? ''}
                                    onChange={(e) => setEditDraft((p) => ({ ...p, username: e.target.value }))}
                                    placeholder={t('profile.fields.username')}
                                  />
                                  <input
                                    className="users-input"
                                    value={editDraft.email ?? u.email ?? ''}
                                    onChange={(e) => setEditDraft((p) => ({ ...p, email: e.target.value }))}
                                    placeholder={t('profile.fields.email')}
                                  />
                                  <input
                                    className="users-input"
                                    value={editDraft.phone ?? u.phone ?? ''}
                                    onChange={(e) => setEditDraft((p) => ({ ...p, phone: e.target.value }))}
                                    placeholder={t('profile.fields.phone')}
                                  />
                                  <input
                                    className="users-input"
                                    value={editDraft.telegram ?? u.telegram ?? ''}
                                    onChange={(e) => setEditDraft((p) => ({ ...p, telegram: e.target.value }))}
                                    placeholder={t('profile.fields.telegram')}
                                  />
                                  <input
                                    className="users-input"
                                    type="password"
                                    value={editDraft.password ?? ''}
                                    onChange={(e) => setEditDraft((p) => ({ ...p, password: e.target.value }))}
                                    placeholder={t('profile.newPasswordOptional')}
                                    autoComplete="new-password"
                                  />
                                </div>

                                <div className="profile-user-edit-actions">
                                  <button
                                    className="users-btn"
                                    disabled={adminUpdateMutation.isPending}
                                    onClick={() => adminUpdateMutation.mutate({ id, payload: editDraft })}
                                  >
                                    {t('common.save')}
                                  </button>
                                  <button
                                    className="users-btn secondary"
                                    onClick={() => {
                                      setEditingUserId(null);
                                      setEditDraft({});
                                      setEditError('');
                                    }}
                                  >
                                    {t('common.cancel')}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="profile-user-actions-row">
                                <button
                                  className="users-btn"
                                  disabled={isDeleted}
                                  onClick={() => {
                                    if (isDeleted) return;
                                    setEditingUserId(id);
                                    setEditDraft({
                                      username: u.username,
                                      email: u.email,
                                      phone: u.phone || '',
                                      telegram: u.telegram || '',
                                      role: u.role,
                                      status: u.status,
                                      password: '',
                                    });
                                    setEditError('');
                                  }}
                                >
                                  {t('common.edit')}
                                </button>

                                <button
                                  className="users-btn danger"
                                  disabled={
                                    adminDeleteMutation.isPending ||
                                    String(currentUser?.id) === id ||
                                    isDeleted
                                  }
                                  onClick={() => {
                                    setDeleteError('');
                                    setDeleteConfirm({ id, label: displayName });
                                  }}
                                >
                                  {t('common.delete')}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <h3 className="profile-subtitle">{t('common.inactiveUsersTitle')}</h3>
                <div className="users-grid">
                  {(inactiveUsersQuery.data || []).length === 0 ? (
                    <div className="empty-state">
                      <p>{t('common.noInactiveUsers')}</p>
                    </div>
                  ) : (
                    (inactiveUsersQuery.data || []).map((u: any) => {
                    const id = String(u.id);
                    const isEditing = editingUserId === id;
                    const displayName = u.username || u.email || 'User';
                    const statusValue = (isEditing ? (editDraft.status ?? u.status) : u.status) as string;
                    const roleValue = (isEditing ? (editDraft.role ?? u.role) : u.role) as string;
                      const isDeleted = Boolean(u.deletedAt);

                      return (
                      <div key={id} className="user-card">
                        <div className="user-card-header">
                          <div className="user-info-section">
                            <div
                              className="user-avatar-circle"
                              style={{ background: getAvatarColor(displayName) }}
                            >
                              {getInitials(displayName)}
                            </div>
                            <div className="user-details-section">
                              <h3 className="user-name-title">{u.username || '—'}</h3>
                              <div className="user-email-text">
                                <Mail size={14} />
                                {u.email}
                              </div>
                            </div>
                          </div>

                          <div className={`status-badge-button ${getStatusBadgeClass(statusValue)}`}>
                            {statusValue === 'active' ? (
                              <>
                                <CheckCircle size={14} />
                                {statusLabelMap.active}
                              </>
                            ) : (
                              <>
                                <XCircle size={14} />
                                {statusLabelMap.inactive}
                              </>
                            )}
                          </div>
                        </div>

                        <div className="user-card-body">
                          <div className="user-contact-section">
                            {u.phone && (
                              <div className="contact-item-row">
                                <Phone size={14} />
                                <span>{u.phone}</span>
                              </div>
                            )}
                            {u.telegram && (
                              <div className="contact-item-row">
                                <MessageSquare size={14} />
                                <span>@{u.telegram}</span>
                              </div>
                            )}
                            {!u.phone && !u.telegram && (
                              <div className="contact-item-row text-muted">{t('profile.noContacts')}</div>
                            )}
                          </div>

                          <div className="user-role-section">
                            <label className="role-label">{t('users.table.role')}</label>
                            <CustomSelect
                              value={roleValue}
                              onChange={(newRole: string) => {
                                if (isDeleted) return;
                                if (isEditing) {
                                  setEditDraft((p) => ({ ...p, role: newRole as any }));
                                  return;
                                }
                                adminUpdateMutation.mutate({ id, payload: { role: newRole as any } });
                              }}
                              options={[
                                { value: 'admin', label: t('users.roles.admin') },
                                { value: 'teamlead', label: t('users.roles.teamlead') },
                                { value: 'operator', label: t('users.roles.operator') },
                                { value: 'pending', label: t('users.roles.pending') },
                              ]}
                              disabled={adminUpdateMutation.isPending || isDeleted || String(currentUser?.id) === id}
                              triggerClassName={`role-select-dropdown ${getRoleBadgeClass(roleValue)}`}
                            />
                          </div>

                          <div className="user-meta-section">
                            <div className="meta-item">
                              <span className="meta-label">{t('users.table.registered')}</span>
                              <span className="meta-value">{formatDate(u.createdAt)}</span>
                            </div>
                          </div>

                          {isEditing ? (
                            <div className="profile-user-edit">
                              <div className="profile-user-edit-grid">
                                <input
                                  className="users-input"
                                  value={editDraft.username ?? u.username ?? ''}
                                  onChange={(e) => setEditDraft((p) => ({ ...p, username: e.target.value }))}
                                  placeholder={t('profile.fields.username')}
                                />
                                <input
                                  className="users-input"
                                  value={editDraft.email ?? u.email ?? ''}
                                  onChange={(e) => setEditDraft((p) => ({ ...p, email: e.target.value }))}
                                  placeholder={t('profile.fields.email')}
                                />
                                <input
                                  className="users-input"
                                  value={editDraft.phone ?? u.phone ?? ''}
                                  onChange={(e) => setEditDraft((p) => ({ ...p, phone: e.target.value }))}
                                  placeholder={t('profile.fields.phone')}
                                />
                                <input
                                  className="users-input"
                                  value={editDraft.telegram ?? u.telegram ?? ''}
                                  onChange={(e) => setEditDraft((p) => ({ ...p, telegram: e.target.value }))}
                                  placeholder={t('profile.fields.telegram')}
                                />
                                <input
                                  className="users-input"
                                  type="password"
                                  value={editDraft.password ?? ''}
                                  onChange={(e) => setEditDraft((p) => ({ ...p, password: e.target.value }))}
                                  placeholder={t('profile.newPasswordOptional')}
                                  autoComplete="new-password"
                                />
                              </div>

                              <div className="profile-user-edit-actions">
                                <button
                                  className="users-btn"
                                  disabled={adminUpdateMutation.isPending}
                                  onClick={() => adminUpdateMutation.mutate({ id, payload: editDraft })}
                                >
                                  {t('common.save')}
                                </button>
                                <button
                                  className="users-btn secondary"
                                  onClick={() => {
                                    setEditingUserId(null);
                                    setEditDraft({});
                                    setEditError('');
                                  }}
                                >
                                  {t('common.cancel')}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="profile-user-actions-row">
                              <button
                                className="users-btn"
                                disabled={isDeleted}
                                onClick={() => {
                                  if (isDeleted) return;
                                  setEditingUserId(id);
                                  setEditDraft({
                                    username: u.username,
                                    email: u.email,
                                    phone: u.phone || '',
                                    telegram: u.telegram || '',
                                    role: u.role,
                                    status: u.status,
                                    password: '',
                                  });
                                  setEditError('');
                                }}
                              >
                                {t('common.edit')}
                              </button>

                              <button
                                className="users-btn danger"
                                disabled={
                                  adminDeleteMutation.isPending ||
                                  String(currentUser?.id) === id ||
                                  isDeleted
                                }
                                onClick={() => {
                                  setDeleteError('');
                                  setDeleteConfirm({ id, label: displayName });
                                }}
                              >
                                {t('common.delete')}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
