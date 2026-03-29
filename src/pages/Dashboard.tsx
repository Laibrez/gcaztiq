import { Users, Megaphone, Receipt, Wallet } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { usePayouts } from '@/hooks/usePayouts';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const statusStyles: Record<string, string> = {
  pending:    'bg-status-pending/10 text-status-pending',
  processing: 'bg-status-processing/10 text-status-processing',
  sent:       'bg-status-sent/10 text-status-sent',
  claimed:    'bg-emerald-600/10 text-emerald-700',
  cancelled:  'bg-destructive/10 text-destructive',
};

const PIE_COLORS = [
  'hsl(72,76%,57%)', 'hsl(210,80%,60%)', 'hsl(280,60%,65%)', 'hsl(30,90%,60%)',
];

const AVATAR_COLORS = [
  'bg-pink-400','bg-violet-400','bg-sky-400','bg-amber-400',
  'bg-emerald-400','bg-rose-400','bg-indigo-400','bg-teal-400',
];
function avatarColor(id: string) {
  let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function fmt(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

function StatCard({ label, value, icon: Icon, loading }: { label: string; value: string; icon: any; loading: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className={cn('mt-2 text-2xl font-semibold text-foreground', loading && 'animate-pulse text-muted-foreground')}>
        {loading ? '—' : value}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: payoutsData, isLoading: payoutsLoading } = usePayouts();
  const recentPayouts: any[] = payoutsData?.payouts?.slice(0, 8) ?? [];

  // Build a simple monthly chart from payouts
  const chartData = (() => {
    const months: Record<string, number> = {};
    (payoutsData?.payouts ?? []).forEach((p: any) => {
      const m = new Date(p.created_at).toLocaleString('default', { month: 'short' });
      months[m] = (months[m] || 0) + (p.amount_cents / 100);
    });
    return Object.entries(months).map(([month, amount]) => ({ month, amount })).slice(-6);
  })();

  // Currency distribution from recent payouts
  const currencyDist = (() => {
    const totals: Record<string, number> = {};
    (payoutsData?.payouts ?? []).forEach((p: any) => {
      totals[p.currency] = (totals[p.currency] || 0) + p.amount_cents;
    });
    const total = Object.values(totals).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(totals).map(([name, v], i) => ({
      name, value: Math.round((v / total) * 100), fill: PIE_COLORS[i % PIE_COLORS.length]
    }));
  })();

  const statCards = [
    { label: 'Total Creators',        value: String(stats?.total_creators ?? 0),              icon: Users   },
    { label: 'Active Campaigns',      value: String(stats?.active_campaigns ?? 0),            icon: Megaphone },
    { label: 'Payouts This Month',    value: fmt(stats?.payouts_this_month_cents ?? 0),       icon: Receipt },
    { label: 'Wallet Balance',        value: fmt(stats?.wallet_balance_cents ?? 0),           icon: Wallet  },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your creator program performance.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} loading={statsLoading} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold text-foreground">Payouts Over Time</h2>
          <p className="text-sm text-muted-foreground">Monthly payout totals</p>
          <div className="mt-4 h-64">
            {chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No payout data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="areaGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(72,76%,57%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(72,76%,57%)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(218,11%,46%)' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'hsl(218,11%,46%)' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Amount']} contentStyle={{ backgroundColor: '#fff', border: '1px solid hsl(220,13%,91%)', borderRadius: '8px', fontSize: '13px' }} />
                  <Area type="monotone" dataKey="amount" stroke="hsl(72,76%,57%)" strokeWidth={2} fill="url(#areaGreen)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold text-foreground">Payouts by Currency</h2>
          <p className="text-sm text-muted-foreground">Currency distribution</p>
          <div className="mt-4 h-64">
            {currencyDist.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No payout data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={currencyDist} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                    {currencyDist.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v}%`, 'Share']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Payouts */}
      <div className="rounded-xl border border-border bg-card">
        <div className="p-5 pb-3">
          <h2 className="text-base font-semibold text-foreground">Recent Payouts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-border">
                {['Creator', 'Campaign', 'Amount', 'Date', 'Status'].map((h, i) => (
                  <th key={h} className={cn('px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground', i === 2 ? 'text-right' : 'text-left')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payoutsLoading ? (
                <tr><td colSpan={5} className="py-10 text-center text-sm text-muted-foreground">Loading…</td></tr>
              ) : recentPayouts.length === 0 ? (
                <tr><td colSpan={5} className="py-10 text-center text-sm text-muted-foreground">No payouts yet — use Quick Pay to send the first one.</td></tr>
              ) : (
                recentPayouts.map((p: any) => {
                  const name = p.creators?.name || p.creators?.email || '—';
                  const initial = name.charAt(0).toUpperCase();
                  return (
                    <tr key={p.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white', avatarColor(p.id))}>
                            {initial}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{name}</p>
                            <p className="text-xs text-muted-foreground">{p.creators?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{p.campaigns?.name ?? <span className="italic">Direct</span>}</td>
                      <td className="px-5 py-3 text-right">
                        <p className="text-sm font-semibold text-foreground">${(p.amount_cents/100).toLocaleString()} {p.currency}</p>
                        <p className="text-xs text-muted-foreground">Creator gets: ${((p.creator_receives_cents ?? p.amount_cents)/100).toLocaleString()}</p>
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(p.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-5 py-3">
                        <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', statusStyles[p.status] ?? 'bg-muted text-foreground')}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end border-t border-border p-4">
          <Link to="/payouts" className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
            View All Payouts
          </Link>
        </div>
      </div>
    </div>
  );
}
