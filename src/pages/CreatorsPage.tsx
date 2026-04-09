import { useState } from 'react';
import { Search, MoreHorizontal, UserPlus, Trash2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useCreators, useInviteCreator, useDeleteCreator } from '@/hooks/useCreators';

const statusStyles: Record<string, string> = {
  active:   'bg-status-sent/15 text-status-sent',
  paused:   'bg-status-pending/15 text-status-pending',
  pending:  'bg-muted text-muted-foreground',
};

function getInitial(name: string) {
  return name ? name.charAt(0).toUpperCase() : '?';
}

const AVATAR_COLORS = [
  'bg-pink-400',   'bg-violet-400', 'bg-sky-400',    'bg-amber-400',
  'bg-emerald-400','bg-rose-400',   'bg-indigo-400', 'bg-teal-400',
  'bg-orange-400', 'bg-cyan-400',   'bg-purple-400', 'bg-lime-400',
];

function avatarColor(id: string) {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export default function CreatorsPage() {
  const { data: creators = [], isLoading } = useCreators();
  const invite = useInviteCreator();
  const remove = useDeleteCreator();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteCountry, setInviteCountry] = useState('US');

  const filtered = (creators as any[]).filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    const q = search.toLowerCase();
    if (q && !c.name?.toLowerCase().includes(q) && !c.email?.toLowerCase().includes(q)) return false;
    return true;
  });

  const handleInvite = async () => {
    if (!inviteEmail) { toast.error('Email is required'); return; }
    try {
      await invite.mutateAsync({ email: inviteEmail, name: inviteName, country: inviteCountry });
      setShowInvite(false);
      setInviteName('');
      setInviteEmail('');
      setInviteCountry('US');
      toast.success("Creator added! They'll receive an email to complete setup.");
    } catch (err: any) {
      toast.error(err?.error || 'Failed to add creator');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove ${name || 'this creator'}?`)) return;
    try {
      await remove.mutateAsync(id);
      toast.success('Creator removed');
    } catch (err: any) {
      toast.error(err?.error || err?.message || 'Failed to remove creator');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Creators</h1>
          <p className="text-sm text-muted-foreground">Manage your creator network.</p>
        </div>
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setShowInvite(true)}>
          <UserPlus className="h-4 w-4" /> Invite Creator
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name or email…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {['Creator', 'Email', 'Invitation Status', 'Total Earned', 'Actions'].map((h, i) => (
                <th key={h} className={cn('px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground', i >= 3 ? 'text-right' : 'text-left')}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="py-12 text-center text-sm text-muted-foreground">Loading creators…</td></tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground mb-3">
                      {search || statusFilter !== 'all' ? 'No creators match your filters.' : 'Invite your first creator to get started'}
                    </p>
                    {!(search || statusFilter !== 'all') && (
                      <Button variant="outline" size="sm" onClick={() => setShowInvite(true)} className="gap-2">
                        <UserPlus className="h-4 w-4" /> Invite Creator
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((c: any) => {
                const earned = (c.payouts as any[] | undefined)
                  ?.filter(p => p.status === 'sent' || p.status === 'claimed')
                  .reduce((sum: number, p: any) => sum + (p.amount_cents || 0), 0) ?? 0;

                return (
                  <tr key={c.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={cn('h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold text-white', avatarColor(c.id))}>
                          {getInitial(c.name || c.email)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{c.name || '—'}</p>
                          {c.handle && <p className="text-xs text-muted-foreground">{c.handle}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{c.email}</td>
                    <td className="px-5 py-3">
                      {c.invitation_status === 'confirmed'
                        ? <span className="inline-flex items-center gap-1.5 rounded-full bg-status-sent/15 px-2.5 py-0.5 text-xs font-medium text-status-sent">✓ Confirmed</span>
                        : <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">Invite sent</span>
                      }
                    </td>
                    <td className="px-5 py-3 text-right text-sm font-medium text-foreground">
                      ${(earned / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleDelete(c.id, c.name)}>
                            <Trash2 className="h-4 w-4" /> Remove
                          </DropdownMenuItem>
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

      {/* Invite dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md">
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Invite a Creator</h2>
              <p className="text-sm text-muted-foreground">Add them to your creator network.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Creator name</Label>
                <Input placeholder="Full name" value={inviteName} onChange={(e) => setInviteName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Creator email <span className="text-destructive">*</span></Label>
                <Input placeholder="creator@example.com" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Country</Label>
                <select
                  value={inviteCountry}
                  onChange={(e) => setInviteCountry(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="US">🇺🇸 United States</option>
                  <option value="GB">🇬🇧 United Kingdom</option>
                  <option value="CA">🇨🇦 Canada</option>
                  <option value="AU">🇦🇺 Australia</option>
                  <option value="MX">🇲🇽 Mexico</option>
                  <option value="BR">🇧🇷 Brazil</option>
                  <option value="DE">🇩🇪 Germany</option>
                  <option value="FR">🇫🇷 France</option>
                  <option value="IN">🇮🇳 India</option>
                  <option value="PH">🇵🇭 Philippines</option>
                  <option value="NG">🇳🇬 Nigeria</option>
                  <option value="OTHER">🌍 Other</option>
                </select>
                {inviteCountry !== 'US' && (
                  <p className="text-xs text-amber-600">International tax forms (W-8BEN) are coming soon. The creator will still receive their invitation.</p>
                )}
              </div>
            </div>
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleInvite}
              disabled={!inviteEmail || invite.isPending}
            >
              {invite.isPending ? 'Adding…' : 'Add Creator'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
