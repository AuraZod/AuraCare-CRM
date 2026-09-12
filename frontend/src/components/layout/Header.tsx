import { useState, useEffect } from 'react';
import { Bell, Search, ChevronDown, Plus, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { roleConfigs } from '@/config/roles';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const getNotificationsByRole = (role: string) => {
  switch (role) {
    case 'doctor':
      return [
        { id: '1', title: 'New Consultation Request', description: 'Patient Rahul Verma is in queue', time: '5 mins ago', read: false },
        { id: '2', title: 'Lab Report Ready', description: 'Lab report uploaded for Anjali Mehta', time: '1 hr ago', read: false },
        { id: '3', title: 'Prescription Dispensed', description: 'Patient Rohan Gupta collected medicines', time: '3 hrs ago', read: true },
      ];
    case 'receptionist':
      return [
        { id: '1', title: 'New Appointment Booking', description: 'Online booking request for Dr. Sharma', time: '10 mins ago', read: false },
        { id: '2', title: 'Patient Checked In', description: 'Sunita Verma has checked in for consultation', time: '20 mins ago', read: false },
        { id: '3', title: 'Billing Completed', description: 'Invoice generated for Rahul Kumar', time: '2 hrs ago', read: true },
      ];
    case 'pharmacy':
      return [
        { id: '1', title: 'New Prescription Sent', description: 'Dr. Sharma sent prescription for Amit Roy', time: '5 mins ago', read: false },
        { id: '2', title: 'Medicine Stock Alert', description: 'Paracetamol 500mg is running low', time: '1 day ago', read: true },
      ];
    case 'diagnostic':
      return [
        { id: '1', title: 'Lab Test Ordered', description: 'Dr. Verma ordered CBC for Patient S. Sen', time: '15 mins ago', read: false },
        { id: '2', title: 'Report Approved', description: 'Super Admin approved the monthly diagnostic report', time: '4 hrs ago', read: true },
      ];
    default:
      return [
        { id: '1', title: 'Database Backup Completed', description: 'Automated nightly backup successful', time: '4 hrs ago', read: true },
        { id: '2', title: 'New User Registered', description: 'Dr. Neha Sharma registered as Doctor', time: '5 hrs ago', read: false },
        { id: '3', title: 'System Security Update', description: 'Role permission updates deployed', time: '1 day ago', read: true },
      ];
  }
};

export function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [roleNotifications, setRoleNotifications] = useState<{ id: string; title: string; description: string; time: string; read: boolean }[]>([]);

  useEffect(() => {
    if (user) {
      setRoleNotifications(getNotificationsByRole(user.role));
    }
  }, [user]);

  const unreadCount = roleNotifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setRoleNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (id: string) => {
    setRoleNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  if (!user) return null;

  const roleConfig = roleConfigs[user.role];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-card/80 backdrop-blur-md border-b border-border px-6 flex items-center justify-between gap-4">
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-foreground">
          {roleConfig.dashboardTitle}
        </h2>
        <p className="text-sm text-muted-foreground">
          {roleConfig.description}
        </p>
      </div>

      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search patients, appointments..."
          className="pl-10 bg-secondary/50 border-0 focus-visible:ring-1"
        />
      </div>

      <div className="flex items-center gap-3">
        {user.role === 'receptionist' && (
          <Button 
            variant="gradient" 
            size="sm" 
            className="gap-2"
            onClick={() => navigate('/appointments')}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Appointment</span>
          </Button>
        )}
        
        {user.role === 'doctor' && (
          <Button variant="gradient" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Consultation</span>
          </Button>
        )}

        {user.role === 'diagnostic' && (
          <Button variant="gradient" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Upload Report</span>
          </Button>
        )}

        {user.role === 'pharmacy' && (
          <Button variant="gradient" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Dispense Medicine</span>
          </Button>
        )}

        {(user.role === 'admin' || user.role === 'super_admin') && (
          <Button variant="gradient" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add User</span>
          </Button>
        )}

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="relative h-10 w-10 rounded-lg inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary focus-visible:outline-none transition-colors">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" alignOffset={-130} sideOffset={15} className="w-80 p-0 bg-card border-border shadow-lg">
            <DropdownMenuLabel className="p-4 flex items-center justify-between border-b border-border">
              <span className="font-semibold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-xs bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} New
                </span>
              )}
            </DropdownMenuLabel>
            <div className="max-h-80 overflow-y-auto">
              {roleNotifications.length > 0 ? (
                roleNotifications.map((notif) => (
                  <DropdownMenuItem
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif.id)}
                    className="p-4 border-b border-border/50 focus:bg-muted/50 cursor-pointer flex flex-col items-start gap-1"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={cn(
                        "font-semibold text-xs flex items-center gap-1.5",
                        notif.read ? "text-muted-foreground" : "text-foreground"
                      )}>
                        {!notif.read && <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />}
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{notif.time}</span>
                    </div>
                    <span className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notif.description}</span>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No notifications
                </div>
              )}
            </div>
            {unreadCount > 0 && (
              <div className="p-2.5 text-center border-t border-border">
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs font-semibold text-cyan-500 hover:text-cyan-600 dark:text-cyan-400 dark:hover:text-cyan-300"
                >
                  Mark all as read
                </button>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm',
                roleConfig.color
              )}>
                {user.profile.firstName.charAt(0)}{user.profile.lastName.charAt(0)}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{roleConfig.displayName}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={4} className="w-56">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground font-normal">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile Settings</DropdownMenuItem>
            <DropdownMenuItem>Preferences</DropdownMenuItem>
            {(user.role === 'admin' || user.role === 'super_admin') && (
              <DropdownMenuItem>System Settings</DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
