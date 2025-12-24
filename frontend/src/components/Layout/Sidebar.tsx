import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Droplet, 
  BarChart3, 
  CreditCard, 
  ArrowUpCircle, 
  Clock,
  Users
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import './Sidebar.css';

export default function Sidebar() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard'), roles: ['admin', 'teamlead', 'operator'] },
    { to: '/operators', icon: Users, label: t('nav.operators'), roles: ['admin'] },
    { to: '/drops', icon: Droplet, label: t('nav.drops'), roles: ['admin', 'teamlead', 'operator'] },
    { to: '/analytics', icon: BarChart3, label: t('nav.analytics'), roles: ['admin', 'teamlead'] },
    { to: '/bank-accounts', icon: CreditCard, label: t('nav.bankAccounts'), roles: ['admin', 'teamlead', 'operator'] },
    { to: '/transactions', icon: ArrowUpCircle, label: t('nav.transactions'), roles: ['admin', 'teamlead', 'operator'] },
    { to: '/shifts', icon: Clock, label: t('nav.shifts'), roles: ['admin', 'teamlead', 'operator'] },
  ];

  const visibleNavItems = navItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Droplet size={32} color="#5b6cf5" />
          <span>Crypto Port</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            {user?.username[0].toUpperCase()}
          </div>
          <div className="user-details">
            <div className="user-name">{user?.username}</div>
            <div className="user-role">{user?.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
