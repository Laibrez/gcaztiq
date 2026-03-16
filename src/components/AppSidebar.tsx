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

export function AppSidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const NavItem = ({ item }: { item: (typeof topNavItems)[number] }) => {
    const active = isActive(item.path);
    return (
      <Link
        to={item.path}
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
    <aside className="flex w-[240px] flex-col border-r border-border bg-sidebar">
      <div className="flex h-14 items-center px-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <span className="text-xs font-bold text-primary-foreground">P</span>
          </div>
          <span className="text-base font-semibold text-foreground">PayGrade</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-2">
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

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            D
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">Derek Martinez</p>
            <p className="truncate text-xs text-muted-foreground">derek@paygrade.io</p>
          </div>
          <button className="text-muted-foreground transition-colors hover:text-foreground">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
