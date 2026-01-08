import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
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
      setCreateError(err?.response?.data?.message || 'Failed to create user');
    },
  });

  const isAdmin = currentUser?.role === 'admin';

  const usersQuery = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: async () => {
      const response = await usersService.getAll({ limit: 100 });
      return response.items;
    },
    enabled: Boolean(isAdmin),
  });

  const adminUpdateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: AdminUpdateUserPayload & { password?: string } }) => {
      setEditError('');
      const cleaned: Record<string, unknown> = { ...payload };
      if (!cleaned.password) {
        delete cleaned.password;
      }
      return usersService.adminUpdate(id, cleaned);
    },
    onSuccess: async () => {
      await usersQuery.refetch();
      setEditingUserId(null);
      setEditDraft({});
    },
    onError: (err: any) => {
      setEditError(err?.response?.data?.message || 'Failed to update user');
    },
  });

  const adminDeleteMutation = useMutation({
    mutationFn: async (deleteUserId: string) => {
      setDeleteError('');
      await usersService.adminDelete(deleteUserId);
    },
    onSuccess: async () => {
      await usersQuery.refetch();
      if (deleteConfirm?.id && editingUserId === deleteConfirm.id) {
        setEditingUserId(null);
        setEditDraft({});
        setEditError('');
      }
      setDeleteConfirm(null);
      setDeleteError('');
    },
    onError: (err: any) => {
      setDeleteError(err?.response?.data?.message || 'Failed to delete user');
    },
  });

  if (isLoading) {
    return <div className="profile-page">Loading…</div>;
  }

  if (error || !data) {
    return <div className="profile-page">Failed to load profile</div>;
  }

  const rows: Array<{ label: string; value?: string }> = [
    { label: 'Username', value: data.username },
    { label: 'Email', value: data.email },
    { label: 'Phone', value: data.phone || '-' },
    { label: 'Telegram', value: data.telegram || '-' },
    { label: 'Role', value: data.role },
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
          <h2 className="profile-title">Profile</h2>
          {rows.map((row) => (
            <div key={row.label} className="profile-row">
              <div className="profile-label">{row.label}</div>
              <div className="profile-value">{row.value}</div>
            </div>
          ))}
        </div>

        {isAdmin && (
          <div className="profile-card profile-admin">
            <h2 className="profile-title">Register user</h2>

            {createError && <div className="profile-error">{createError}</div>}

            <form
              className="profile-form"
              onSubmit={(e) => {
                e.preventDefault();
                createUserMutation.mutate();
              }}
            >
              <div className="profile-form-group">
                <label className="profile-form-label">Username</label>
                <input
                  className="profile-input"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
                  autoComplete="off"
                />
              </div>

              <div className="profile-form-group">
                <label className="profile-form-label">Email</label>
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
                <label className="profile-form-label">Password</label>
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
                <label className="profile-form-label">Role</label>
                <select
                  className="profile-input"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'operator' | 'teamlead')}
                >
                  <option value="operator">operator</option>
                  <option value="teamlead">teamlead</option>
                </select>
              </div>

              <button className="profile-button" type="submit" disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? 'Creating…' : 'Create + QR'}
              </button>
            </form>

            <div className="profile-qr-area">
              {createdQrUrl ? (
                <img className="profile-qr" src={createdQrUrl} alt="QR Code" />
              ) : (
                <div className="profile-qr-placeholder">QR will appear here</div>
              )}
            </div>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="profile-users">
          <div className="profile-card profile-users-card">
            <h2 className="profile-title">Users</h2>

            {editError && <div className="profile-error">{editError}</div>}

            {usersQuery.isLoading ? (
              <div>Loading…</div>
            ) : usersQuery.isError ? (
              <div>Failed to load users</div>
            ) : (
              <div className="users-grid">
                {(usersQuery.data || []).length === 0 ? (
                  <div className="empty-state">
                    <p>No users</p>
                  </div>
                ) : (
                  (usersQuery.data || []).map((u: any) => {
                    const id = String(u.id);
                    const isEditing = editingUserId === id;
                    const displayName = u.username || u.email || 'User';
                    const statusValue = (isEditing ? (editDraft.status ?? u.status) : u.status) as string;
                    const roleValue = (isEditing ? (editDraft.role ?? u.role) : u.role) as string;

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

                          <button
                            className={`status-badge-button ${getStatusBadgeClass(statusValue)}`}
                            disabled={adminUpdateMutation.isPending}
                            onClick={() => {
                              if (isEditing) {
                                const newStatus = statusValue === 'active' ? 'inactive' : 'active';
                                setEditDraft((p) => ({ ...p, status: newStatus as any }));
                                return;
                              }

                              const newStatus = u.status === 'active' ? 'inactive' : 'active';
                              if (confirm('Change status?')) {
                                adminUpdateMutation.mutate({ id, payload: { status: newStatus as any } });
                              }
                            }}
                          >
                            {statusValue === 'active' ? (
                              <>
                                <CheckCircle size={14} />
                                active
                              </>
                            ) : (
                              <>
                                <XCircle size={14} />
                                inactive
                              </>
                            )}
                          </button>
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
                              <div className="contact-item-row text-muted">No contacts</div>
                            )}
                          </div>

                          <div className="user-role-section">
                            <label className="role-label">role</label>
                            <CustomSelect
                              value={roleValue}
                              onChange={(newRole: string) => {
                                if (isEditing) {
                                  setEditDraft((p) => ({ ...p, role: newRole as any }));
                                  return;
                                }
                                adminUpdateMutation.mutate({ id, payload: { role: newRole as any } });
                              }}
                              options={[
                                { value: 'admin', label: 'admin' },
                                { value: 'teamlead', label: 'teamlead' },
                                { value: 'operator', label: 'operator' },
                                { value: 'pending', label: 'pending' },
                              ]}
                              disabled={adminUpdateMutation.isPending}
                              triggerClassName={`role-select-dropdown ${getRoleBadgeClass(roleValue)}`}
                            />
                          </div>

                          <div className="user-meta-section">
                            <div className="meta-item">
                              <span className="meta-label">registered</span>
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
                                  placeholder="Username"
                                />
                                <input
                                  className="users-input"
                                  value={editDraft.email ?? u.email ?? ''}
                                  onChange={(e) => setEditDraft((p) => ({ ...p, email: e.target.value }))}
                                  placeholder="Email"
                                />
                                <input
                                  className="users-input"
                                  value={editDraft.phone ?? u.phone ?? ''}
                                  onChange={(e) => setEditDraft((p) => ({ ...p, phone: e.target.value }))}
                                  placeholder="Phone"
                                />
                                <input
                                  className="users-input"
                                  value={editDraft.telegram ?? u.telegram ?? ''}
                                  onChange={(e) => setEditDraft((p) => ({ ...p, telegram: e.target.value }))}
                                  placeholder="Telegram"
                                />
                                <input
                                  className="users-input"
                                  type="password"
                                  value={editDraft.password ?? ''}
                                  onChange={(e) => setEditDraft((p) => ({ ...p, password: e.target.value }))}
                                  placeholder="New password (optional)"
                                  autoComplete="new-password"
                                />
                              </div>

                              <div className="profile-user-edit-actions">
                                <button
                                  className="users-btn"
                                  disabled={adminUpdateMutation.isPending}
                                  onClick={() => adminUpdateMutation.mutate({ id, payload: editDraft })}
                                >
                                  Save
                                </button>
                                <button
                                  className="users-btn secondary"
                                  onClick={() => {
                                    setEditingUserId(null);
                                    setEditDraft({});
                                    setEditError('');
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="profile-user-actions-row">
                              <button
                                className="users-btn"
                                onClick={() => {
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
                                Edit
                              </button>

                              <button
                                className="users-btn danger"
                                disabled={adminDeleteMutation.isPending || String(currentUser?.id) === id}
                                onClick={() => {
                                  setDeleteError('');
                                  setDeleteConfirm({ id, label: displayName });
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
