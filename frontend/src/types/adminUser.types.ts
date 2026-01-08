export type AdminEditableUserRole = 'admin' | 'teamlead' | 'operator' | 'pending';
export type AdminEditableUserStatus = 'active' | 'inactive';

export interface AdminUserListItem {
  id: number;
  username: string;
  email: string;
  phone?: string;
  telegram?: string;
  role: AdminEditableUserRole | string;
  status: AdminEditableUserStatus | string;
  twoFactorEnabled: boolean;
  createdAt?: string;
}

export interface AdminUpdateUserPayload {
  username?: string;
  email?: string;
  password?: string;
  phone?: string;
  telegram?: string;
  role?: AdminEditableUserRole;
  status?: AdminEditableUserStatus;
}
