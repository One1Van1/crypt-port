import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  BarChart3, 
  ArrowUpCircle, 
  Clock,
  Users,
  Building2,
  UserSquare2,
  ChevronLeft,
  ChevronRight,
  Award,
  Wallet,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import './Sidebar.css';

export default function Sidebar() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getTeamleadDashboardLabel = () => {
    if (user?.role === 'admin') return 'Панель админа';
    if (user?.role === 'teamlead') return 'Панель тимлида';
    return t('nav.teamleadDashboard');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard'), roles: ['admin', 'teamlead', 'operator'] },
    { to: '/teamlead-dashboard', icon: Award, label: getTeamleadDashboardLabel(), roles: ['teamlead', 'admin'] },
    { to: '/platforms', icon: Building2, label: 'Площадки', roles: ['admin'] },
    { to: '/banks', icon: Building2, label: t('nav.banks'), roles: ['operator', 'teamlead', 'admin'] },
    { to: '/drops', icon: UserSquare2, label: t('nav.drops'), roles: ['operator', 'teamlead', 'admin'] },
    { to: '/drop-neo-banks', icon: Wallet, label: t('nav.dropNeoBanks'), roles: ['admin', 'teamlead'] },
    { to: '/operators', icon: Users, label: t('nav.operators'), roles: ['admin'] },
    { to: '/analytics', icon: BarChart3, label: t('nav.analytics'), roles: ['admin', 'teamlead'] },
    { to: '/transactions', icon: ArrowUpCircle, label: t('nav.transactions'), roles: ['admin', 'teamlead', 'operator'] },
    { to: '/shifts', icon: Clock, label: t('nav.shifts'), roles: ['admin', 'teamlead', 'operator'] },
  ];

  const role = user?.role || '';

  const visibleNavItems = navItems
    .filter((item) => item.roles.includes(role))
    .sort((a, b) => {
      if (role !== 'admin') return 0;

      const adminOrder = new Map<string, number>([
        ['/dashboard', 10],
        ['/teamlead-dashboard', 20],
        ['/analytics', 30],
        ['/platforms', 40],
        ['/banks', 50],
        ['/drop-neo-banks', 60],
        ['/drops', 70],
        ['/operators', 80],
        ['/transactions', 90],
        ['/shifts', 100],
      ]);

      const aOrder = adminOrder.get(a.to) ?? 999;
      const bOrder = adminOrder.get(b.to) ?? 999;
      return aOrder - bOrder;
    });

  return (
    <>
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="user-info">
            <NavLink
              to={user?.id ? `/profile/${user.id}` : '/dashboard'}
              style={{ textDecoration: 'none', color: 'inherit' }}
              title="Profile"
            >
              <div className="user-avatar">
                {user?.username[0].toUpperCase()}
              </div>
            </NavLink>
            {!isCollapsed && (
              <div className="user-details">
                <div className="user-name">{user?.username}</div>
                <div className="user-role">{user?.role}</div>
              </div>
            )}
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
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon size={20} />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      <button 
        className="sidebar-corner-toggle"
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? 'Развернуть' : 'Свернуть'}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </>
  );
}
