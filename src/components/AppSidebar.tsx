import { Link, useLocation } from 'react-router-dom';
import {
  Circle,
  LayoutGrid,
  Megaphone,
  Users,
  Receipt,
  Zap,
  Wallet,
  Settings,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

const topNavItems = [
  { label: 'Get Started', icon: Circle, path: '/get-started' },
  { label: 'Dashboard', icon: LayoutGrid, path: '/' },
  { label: 'Campaigns', icon: Megaphone, path: '/campaigns' },
  { label: 'Creators', icon: Users, path: '/creators' },
  { label: 'Payouts', icon: Receipt, path: '/payouts' },
  { label: 'Quick Pay', icon: Zap, path: '/quick-pay' },
  { label: 'Wallet', icon: Wallet, path: '/wallet' },
];

const bottomNavItems = [
  { label: 'Team', icon: Users, path: '/team' },
  { label: 'Settings', icon: Settings, path: '/settings' },
  { label: 'Get Help', icon: HelpCircle, path: '/help' },
];

export function SidebarContent({ onInteract }: { onInteract?: () => void }) {
  const location = useLocation();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get('/api/auth/me'),
    retry: false,
  });

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout', {});
    } catch (e) {}
    localStorage.removeItem('gc_token');
    window.location.href = '/login';
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const NavItem = ({ item }: { item: (typeof topNavItems)[number] }) => {
    const active = isActive(item.path);
    return (
      <Link
        to={item.path}
        onClick={onInteract}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          active
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      <div className="flex h-14 items-center px-5 shrink-0">
        <Link to="/" onClick={onInteract} className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <span className="text-xs font-bold text-primary-foreground">G</span>
          </div>
          <span className="text-base font-semibold text-foreground">Gcaztiq</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-2 overflow-y-auto">
        {topNavItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}

        <div className="my-3 border-t border-border" />

        <div className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground">
          <span>Demo Mode</span>
          <Switch defaultChecked className="scale-75" />
        </div>

        {bottomNavItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </nav>

      <div className="border-t border-border p-3 shrink-0">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Link to="/profile" onClick={onInteract} className="flex items-center gap-3 min-w-0 flex-1 group">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground uppercase group-hover:opacity-80 transition-opacity">
              {profile?.name ? profile.name.charAt(0) : 'B'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                {profile?.name || 'Brand Account'}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {profile?.email || '...'}
              </p>
            </div>
          </Link>
          <button 
            onClick={handleLogout}
            className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}

export function AppSidebar() {
  return (
    <aside className="hidden md:flex w-[240px] flex-col border-r border-border bg-sidebar shrink-0">
      <SidebarContent />
    </aside>
  );
}
