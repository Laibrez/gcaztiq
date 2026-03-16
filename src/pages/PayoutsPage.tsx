import { useState } from 'react';
import {
  Info,
  Search,
  MoreHorizontal,
  X,
  HelpCircle,
  Copy,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface PayoutRow {
  creator: { name: string; email: string; initial: string; color: string };
  campaign: string;
  isDirect: boolean;
  amount: string;
  creatorReceives: string;
  date: string;
  status: 'Creating' | 'Processing' | 'Sent' | 'Claimed' | 'Cancelled';
}

const payoutRows: PayoutRow[] = [
  {
    creator: {
      name: 'Sarah Jenkins',
      email: 'sarah.j@gmail.com',
      initial: 'S',
      color: 'bg-pink-400',
    },
    campaign: 'Summer TikTok Push',
    isDirect: false,
    amount: '450 USD',
    creatorReceives: '427 USD',
    date: 'Mar 13',
    status: 'Sent',
  },
  {
    creator: {
      name: 'Yu Wei',
      email: 'yuwei@creator.cn',
      initial: 'Y',
      color: 'bg-violet-400',
    },
    campaign: 'Product Review Series',
    isDirect: false,
    amount: '289 GBP',
    creatorReceives: '274 GBP',
    date: 'Mar 13',
    status: 'Processing',
  },
  {
    creator: {
      name: 'David Russo',
      email: 'drusso@outlook.com',
      initial: 'D',
      color: 'bg-sky-400',
    },
    campaign: '(Direct Payout)',
    isDirect: true,
    amount: '150 USD',
    creatorReceives: '142 USD',
    date: 'Mar 12',
    status: 'Claimed',
  },
  {
    creator: {
      name: 'Maria Gonzalez',
      email: 'maria.g@outlook.com',
      initial: 'M',
      color: 'bg-amber-400',
    },
    campaign: 'Unboxing Campaign',
    isDirect: false,
    amount: '425 USD',
    creatorReceives: '403 USD',
    date: 'Mar 12',
    status: 'Sent',
  },
  {
    creator: {
      name: 'Oliver Hayes',
      email: 'oliver.h@gmail.com',
      initial: 'O',
      color: 'bg-emerald-400',
    },
    campaign: 'Summer TikTok Push',
    isDirect: false,
    amount: '420 GBP',
    creatorReceives: '399 GBP',
    date: 'Mar 10',
    status: 'Claimed',
  },
  {
    creator: {
      name: 'Claire Thompson',
      email: 'claire.d@gmail.com',
      initial: 'C',
      color: 'bg-rose-400',
    },
    campaign: '(Direct Payout)',
    isDirect: true,
    amount: '3,500 USD',
    creatorReceives: '3,325 USD',
    date: 'Mar 9',
    status: 'Claimed',
  },
  {
    creator: {
      name: 'Hana Tanaka',
      email: 'hana.t@yahoo.co.jp',
      initial: 'H',
      color: 'bg-indigo-400',
    },
    campaign: 'Product Review Series',
    isDirect: false,
    amount: '580,000 JPY',
    creatorReceives: '551,000 JPY',
    date: 'Mar 8',
    status: 'Sent',
  },
  {
    creator: {
      name: 'Jake Fitzpatrick',
      email: 'jake.fits@gmail.com',
      initial: 'J',
      color: 'bg-teal-400',
    },
    campaign: 'Summer TikTok Push',
    isDirect: false,
    amount: '150 USD',
    creatorReceives: '142 USD',
    date: 'Mar 7',
    status: 'Cancelled',
  },
  {
    creator: {
      name: 'Priya Sharma',
      email: 'priya.s@gmail.com',
      initial: 'P',
      color: 'bg-orange-400',
    },
    campaign: 'Unboxing Campaign',
    isDirect: false,
    amount: '200 USD',
    creatorReceives: '190 USD',
    date: 'Mar 5',
    status: 'Creating',
  },
  {
    creator: {
      name: 'Chen Wei',
      email: 'chen.codes@163.com',
      initial: 'C',
      color: 'bg-cyan-400',
    },
    campaign: '(Direct Payout)',
    isDirect: true,
    amount: '28,000 CNY',
    creatorReceives: '26,600 CNY',
    date: 'Mar 4',
    status: 'Sent',
  },
  {
    creator: {
      name: 'Luca Bianchi',
      email: 'luca.b@gmail.com',
      initial: 'L',
      color: 'bg-purple-400',
    },
    campaign: 'Product Review Series',
    isDirect: false,
    amount: '350 EUR',
    creatorReceives: '332 EUR',
    date: 'Mar 2',
    status: 'Claimed',
  },
  {
    creator: {
      name: 'Tabby Rodriguez',
      email: 'tabby49@hotmail.com',
      initial: 'T',
      color: 'bg-lime-400',
    },
    campaign: 'Summer TikTok Push',
    isDirect: false,
    amount: '89 USD',
    creatorReceives: '84 USD',
    date: 'Mar 1',
    status: 'Sent',
  },
];

const statusStyles: Record<string, string> = {
  Creating: 'bg-status-creating/15 text-status-creating',
  Processing: 'bg-status-processing/15 text-status-processing',
  Sent: 'bg-status-sent/15 text-status-sent',
  Claimed: 'bg-emerald-600/15 text-emerald-700',
  Cancelled: 'bg-destructive/15 text-destructive',
};

export default function PayoutsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = payoutRows.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (
      search &&
      !r.creator.name.toLowerCase().includes(search.toLowerCase()) &&
      !r.creator.email.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Payouts</h1>
          <p className="text-sm text-muted-foreground">
            Historical record of all payouts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-primary text-foreground">
            Edit Bonuses
          </Button>
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search creators..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 rounded-xl border border-border bg-card p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          When a payout is triggered, we send an email to the admins of your
          organization and the creator, informing them that there is a payout being
          processed. After 1 hour the creator will receive another email with a link
          to withdraw their funds. You can cancel a payout anytime before the creator
          has been notified.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Input type="date" defaultValue="2025-12-21" className="w-[140px] text-sm" />
            <span className="text-sm text-muted-foreground">→</span>
            <Input type="date" defaultValue="2026-03-13" className="w-[140px] text-sm" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Creating">Creating</SelectItem>
              <SelectItem value="Processing">Processing</SelectItem>
              <SelectItem value="Sent">Sent</SelectItem>
              <SelectItem value="Claimed">Claimed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          {statusFilter !== 'all' && (
            <button
              onClick={() => setStatusFilter('all')}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Clear filters
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Download CSV
          </Button>
          <Button variant="outline" size="sm">
            Download PDF
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Creator Name
              </th>
              <th className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Campaign Name
              </th>
              <th className="px-5 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Amount
              </th>
              <th className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Payout Triggered
              </th>
              <th className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="px-5 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr
                key={i}
                className="border-b border-border transition-colors last:border-0 hover:bg-muted/50"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white',
                        row.creator.color
                      )}
                    >
                      {row.creator.initial}
                    </div>
                    <div>
                      <p className="cursor-pointer text-sm font-medium text-foreground transition-colors hover:text-primary">
                        {row.creator.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{row.creator.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  {row.isDirect ? (
                    <div>
                      <p className="text-sm text-muted-foreground">{row.campaign}</p>
                      <p className="text-xs text-muted-foreground">—</p>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground">{row.campaign}</p>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <p className="text-sm font-semibold text-foreground">{row.amount}</p>
                  <p className="text-xs text-muted-foreground">
                    Creators receive: {row.creatorReceives}
                  </p>
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-sm text-muted-foreground">
                  {row.date}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                      statusStyles[row.status]
                    )}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem className="gap-2 text-destructive">
                        <X className="h-4 w-4" /> Cancel
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <HelpCircle className="h-4 w-4" /> Get help
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-2"
                        onClick={() => toast.success('Payout ID copied to clipboard')}
                      >
                        <Copy className="h-4 w-4" /> Copy payout ID
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Showing 1-12 of 47 payouts</p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {[1, 2, 3, 4].map((p) => (
            <Button
              key={p}
              variant={page === p ? 'default' : 'outline'}
              size="icon"
              className={cn('h-8 w-8', page === p && 'bg-primary text-primary-foreground')}
              onClick={() => setPage(p)}
            >
              {p}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setPage(page + 1)}
            disabled={page === 4}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
