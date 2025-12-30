import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  BarChart3, 
  ArrowUpCircle, 
  Clock,
  Users,
  UserCog,
  Building2,
  UserSquare2,
  ChevronLeft,
  ChevronRight,
  Award
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import './Sidebar.css';

export default function Sidebar() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard'), roles: ['admin', 'teamlead', 'operator'] },
    { to: '/teamlead-dashboard', icon: Award, label: t('nav.teamleadDashboard'), roles: ['teamlead', 'admin'] },
    { to: '/banks', icon: Building2, label: t('nav.banks'), roles: ['operator', 'teamlead', 'admin'] },
    { to: '/drops', icon: UserSquare2, label: t('nav.drops'), roles: ['operator', 'teamlead', 'admin'] },
    { to: '/users', icon: UserCog, label: t('nav.users'), roles: ['admin'] },
    { to: '/operators', icon: Users, label: t('nav.operators'), roles: ['admin'] },
    { to: '/analytics', icon: BarChart3, label: t('nav.analytics'), roles: ['admin', 'teamlead'] },
    { to: '/transactions', icon: ArrowUpCircle, label: t('nav.transactions'), roles: ['admin', 'teamlead', 'operator'] },
    { to: '/shifts', icon: Clock, label: t('nav.shifts'), roles: ['admin', 'teamlead', 'operator'] },
  ];

  const visibleNavItems = navItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  return (
    <>
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="user-info">
            <div className="user-avatar">
              {user?.username[0].toUpperCase()}
            </div>
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
