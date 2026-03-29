import { useState } from 'react';
import { Search, MoreHorizontal, X, Copy, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { usePayouts, useCancelPayout } from '@/hooks/usePayouts';

const statusStyles: Record<string, string> = {
  pending:   'bg-status-pending/15 text-status-pending',
  sent:      'bg-status-sent/15 text-status-sent',
  claimed:   'bg-emerald-600/15 text-emerald-700',
  cancelled: 'bg-destructive/15 text-destructive',
  processing:'bg-status-processing/15 text-status-processing',
};

const AVATAR_COLORS = [
  'bg-pink-400','bg-violet-400','bg-sky-400','bg-amber-400',
  'bg-emerald-400','bg-rose-400','bg-indigo-400','bg-teal-400',
];
function avatarColor(id: string) {
  let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export default function PayoutsPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = usePayouts(statusFilter !== 'all' ? statusFilter : undefined);
  const cancel = useCancelPayout();
  const payouts: any[] = data?.payouts ?? [];

  const filtered = payouts.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.creators?.name?.toLowerCase().includes(q) || p.creators?.email?.toLowerCase().includes(q);
  });

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this payout?')) return;
    try {
      await cancel.mutateAsync(id);
      toast.success('Payout cancelled');
    } catch (err: any) {
      toast.error(err?.error || 'Failed to cancel payout');
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success('Payout ID copied');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Payouts</h1>
          <p className="text-sm text-muted-foreground">Historical record of all payouts.</p>
        </div>
        <div className="relative w-56">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search creators…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="claimed">Claimed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
          </SelectContent>
        </Select>
        {statusFilter !== 'all' && (
          <button onClick={() => setStatusFilter('all')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Clear filter
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {['Creator', 'Campaign', 'Amount', 'Date', 'Status', ''].map((h, i) => (
                <th key={i} className={cn('px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground', i === 2 ? 'text-right' : 'text-left')}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">Loading payouts…</td></tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Receipt className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground mb-3">
                      {search || statusFilter !== 'all' ? 'No payouts match your filters.' : 'Send your first payout using Quick Pay'}
                    </p>
                    {!(search || statusFilter !== 'all') && (
                      <Button variant="outline" size="sm" onClick={() => navigate('/quick-pay')} className="gap-2">
                        <Receipt className="h-4 w-4" /> Go to Quick Pay
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((p: any) => {
                const name = p.creators?.name || p.creators?.email || '—';
                const email = p.creators?.email || '—';
                const initial = name.charAt(0).toUpperCase();
                const dollars = (p.amount_cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 });
                const creatorGets = ((p.creator_receives_cents ?? p.amount_cents) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 });
                const canCancel = ['pending', 'sent'].includes(p.status);

                return (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white', avatarColor(p.id))}>
                          {initial}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{name}</p>
                          <p className="text-xs text-muted-foreground">{email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      {p.campaigns?.name ?? <span className="italic">Direct</span>}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <p className="text-sm font-semibold text-foreground">${dollars} {p.currency}</p>
                      <p className="text-xs text-muted-foreground">Creator gets: ${creatorGets}</p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-5 py-3">
                      <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', statusStyles[p.status] ?? 'bg-muted text-foreground')}>
                        {p.status}
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
                          <DropdownMenuItem className="gap-2" onClick={() => handleCopyId(p.id)}>
                            <Copy className="h-4 w-4" /> Copy payout ID
                          </DropdownMenuItem>
                          {canCancel && (
                            <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleCancel(p.id)}>
                              <X className="h-4 w-4" /> Cancel
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} payout{filtered.length !== 1 ? 's' : ''}{statusFilter !== 'all' ? ` (${statusFilter})` : ''}
      </p>
    </div>
  );
}
