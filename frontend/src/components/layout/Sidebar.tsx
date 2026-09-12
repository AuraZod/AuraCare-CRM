import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { roleConfigs } from '@/config/roles';
import { NavItem } from '@/types/auth';
import { apiClient } from '@/lib/api';
import { config } from '@/config/app-config';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [logo, setLogo] = useState("");
  const [name, setName] = useState("");
  const location = useLocation();
  const { user, logout, hasPermission } = useAuth();

  if (!user) return null;

  const roleConfig = roleConfigs[user.role];

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiClient.get('/settings/hospital') as { data?: object };
        const data = response.data as { logo?: string, name?: string };
        setName(data.name || 'Hospital')
        setLogo(data.logo || '');
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);

  const filteredNavItems = roleConfig.navItems.filter(item => {
    if (!item.permission) return true;
    return hasPermission(item.permission.resource, item.permission.action);
  });

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = location.pathname === item.href;
    const Icon = item.icon;

    return (
      <Link to={item.href}>
        <div
          className={cn(
            'group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative border',
            isActive
              ? 'bg-slate-900/60 dark:bg-slate-950/60 text-cyan-500 dark:text-cyan-400 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-semibold'
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border-transparent'
          )}
        >
          <Icon className={cn('h-5 w-5 shrink-0', isActive ? 'text-cyan-500 dark:text-cyan-400' : 'text-muted-foreground group-hover:text-foreground')} />
          {!collapsed && (
            <>
              <span className="font-medium text-sm">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {item.badge}
                </Badge>
              )}
            </>
          )}
          {collapsed && item.badge && (
            <Badge
              variant="secondary"
              className="absolute -top-1 -right-1 text-[10px] w-4 h-4 flex items-center justify-center p-0"
            >
              {item.badge}
            </Badge>
          )}
        </div>
      </Link>
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <aside
      className={cn(
        'h-screen sticky top-0 flex flex-col transition-all duration-300 ease-in-out border-r border-border',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
      style={{ background: 'var(--gradient-sidebar)' }}
    >
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
          <img src="logo.png" alt="AuraCare Logo" className="w-8 h-8 object-contain" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in min-w-0 flex-1">
            <h1 className="font-display font-bold text-lg text-sidebar-foreground truncate">
              {config.siteName.replace(/Arogya/gi, 'AuraCare')}
            </h1>
            <p className="text-xs text-cyan-400 font-semibold truncate">
              {(name || 'AuraCare Hospital').replace(/AArogya/gi, 'AuraCare').replace(/Arogya/gi, 'AuraCare')}
            </p>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="px-4 py-3 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold',
              roleConfig.color
            )}>
              {user.profile.firstName.charAt(0)}{user.profile.lastName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user.name}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {!collapsed && roleConfig.restrictions.length > 0 && (
        <div className="px-4 py-3 border-t border-sidebar-border">
          <p className="text-xs font-medium text-sidebar-foreground/70 mb-2">
            Access Restrictions:
          </p>
          <ul className="space-y-1">
            {roleConfig.restrictions.slice(0, 2).map((restriction, index) => (
              <li key={index} className="text-xs text-sidebar-foreground/50">
                • {restriction}
              </li>
            ))}
            {roleConfig.restrictions.length > 2 && (
              <li className="text-xs text-sidebar-foreground/50">
                • +{roleConfig.restrictions.length - 2} more...
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="px-3 py-4 border-t border-sidebar-border relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none opacity-20 dark:opacity-35">
          <svg className="w-full h-full stroke-cyan-500/30" fill="none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M 0 70 L 30 70 L 35 40 L 40 90 L 45 60 L 50 80 L 53 70 L 100 70" strokeWidth="1.5" />
          </svg>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive transition-all duration-200 relative z-10"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="font-medium text-sm">Logout</span>}
        </button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-card border border-border shadow-md hover:bg-secondary"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-foreground" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-foreground" />
        )}
      </Button>
    </aside>
  );
}
