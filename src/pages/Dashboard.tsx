import { Users, Megaphone, Receipt, Wallet } from 'lucide-react';
import {
  recentPayouts,
  payoutChartData,
  currencyDistribution,
  getInitials,
} from '@/data/mockData';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const stats = [
  { label: 'Total Creators', value: '34', icon: Users },
  { label: 'Active Campaigns', value: '6', icon: Megaphone },
  { label: 'Payouts This Month', value: '$24,850', icon: Receipt },
  { label: 'Wallet Balance', value: '$17,143.35', icon: Wallet },
];

const statusStyles: Record<string, string> = {
  Sent: 'bg-status-sent/10 text-status-sent',
  Processing: 'bg-status-processing/10 text-status-processing',
  Claimed: 'bg-status-claimed/10 text-status-claimed',
  Creating: 'bg-status-creating/10 text-status-creating',
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your creator program performance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold text-foreground">Payouts Over Time</h2>
          <p className="text-sm text-muted-foreground">Monthly payout totals</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={payoutChartData}>
                <defs>
                  <linearGradient id="areaGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="hsl(72, 76%, 57%)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(72, 76%, 57%)"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: 'hsl(218, 11%, 46%)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: 'hsl(218, 11%, 46%)' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: 'hsl(0, 0%, 100%)',
                    border: '1px solid hsl(220, 13%, 91%)',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(72, 76%, 57%)"
                  strokeWidth={2}
                  fill="url(#areaGreen)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold text-foreground">Payouts by Currency</h2>
          <p className="text-sm text-muted-foreground">Currency distribution</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={currencyDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {currencyDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value}%`, 'Share']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="p-5 pb-3">
          <h2 className="text-base font-semibold text-foreground">Recent Payouts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-border">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Creator
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Campaign
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Amount
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Date
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {recentPayouts.map((payout, i) => (
                <tr
                  key={i}
                  className="border-t border-border transition-colors hover:bg-muted/50"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-foreground">
                        {getInitials(payout.creator.name)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {payout.creator.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {payout.creator.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">
                    {payout.campaign}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {payout.currency === 'GBP'
                        ? '£'
                        : payout.currency === 'CAD'
                          ? 'C$'
                          : '$'}
                      {payout.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Creators receive:{' '}
                      {payout.currency === 'GBP'
                        ? '£'
                        : payout.currency === 'CAD'
                          ? 'C$'
                          : '$'}
                      {payout.creatorReceives.toLocaleString()}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">
                    {payout.date}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        statusStyles[payout.status]
                      )}
                    >
                      {payout.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end border-t border-border p-4">
          <Link
            to="/payouts"
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            View All Payouts
          </Link>
        </div>
      </div>
    </div>
  );
}
