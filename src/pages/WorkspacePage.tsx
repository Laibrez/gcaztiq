import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Mail, Search, Send, CheckCircle2, Clock, Trash2, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  useWorkspaceProspects,
  useAddProspects,
  useUpdateProspect,
  useDeleteProspect,
  useInviteProspect,
  type WorkspaceProspect,
  type InvitationStatus,
} from '@/hooks/useWorkspace';
import { prospectPool } from '@/data/prospectsData';
import { useSearchParams } from 'react-router-dom';

// ── Helpers ────────────────────────────────────────────────────────────────────

function InviteBadge({ status }: { status: InvitationStatus }) {
  if (status === 'accepted')
    return (
      <span className="inline-flex whitespace-nowrap items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
        <UserCheck className="h-3 w-3" /> Accepted
      </span>
    );
  if (status === 'invited')
    return (
      <span className="inline-flex whitespace-nowrap items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-[11px] font-medium text-orange-600 dark:text-orange-400">
        <Clock className="h-3 w-3" /> Invited
      </span>
    );
  return <span className="text-[11px] whitespace-nowrap text-muted-foreground">—</span>;
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn(
        'inline-flex h-6 items-center gap-1 rounded-full px-2 text-[11px] font-medium transition-colors',
        value
          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
          : 'bg-muted text-muted-foreground hover:bg-muted/70'
      )}
    >
      {value ? <><Check className="h-3 w-3" /> Yes</> : 'No'}
    </button>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function WorkspacePage() {
  const [params] = useSearchParams();
  const [search, setSearch] = useState('');

  // Hooks
  const { data: prospects = [], isLoading } = useWorkspaceProspects();
  const addProspects = useAddProspects();
  const updateProspect = useUpdateProspect();
  const deleteProspect = useDeleteProspect();
  const inviteProspect = useInviteProspect();

  // Seed workspace from search params on first load (if params are present)
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current || isLoading) return;
    seeded.current = true;

    const niche = params.get('niche') || '';
    const min = Number(params.get('min') || 0);
    const max = Number(params.get('max') || Infinity);
    const eng = Number(params.get('eng') || 0);
    const format = params.get('format') || 'any';
    const city = (params.get('city') || '').toLowerCase().trim();
    const hasParams = niche || min || eng || format !== 'any' || city;

    if (!hasParams) return;

    const filtered = prospectPool.filter(p => {
      if (niche && niche !== 'any' && !p.niche.includes(niche)) return false;
      if (p.followers < min || p.followers > max) return false;
      if (p.engagement < eng) return false;
      if (format !== 'any' && !p.format.includes(format)) return false;
      if (city && !p.city.toLowerCase().includes(city)) return false;
      return true;
    });

    if (filtered.length === 0) return;

    addProspects.mutate(
      filtered.map(p => ({
        handle: p.handle,
        name: p.name,
        email: p.email,
        niche: p.niche,
        city: p.city,
        country: p.country,
        flag: p.flag,
        followers: p.followers,
        engagement: p.engagement,
        format: p.format,
      })),
      {
        onError: () => {}, // silently swallow — prospects may already exist
      }
    );
  }, [isLoading, params]);

  // Client-side search filter
  const rows = useMemo(() => {
    if (!search.trim()) return prospects;
    const q = search.toLowerCase();
    return prospects.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.handle.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.niche || []).some(n => n.toLowerCase().includes(q))
    );
  }, [prospects, search]);

  // Debounced email patch
  const emailTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const handleEmailChange = (id: string, email: string) => {
    // Optimistic update in React state is handled by the mutation's onMutate
    if (emailTimers.current[id]) clearTimeout(emailTimers.current[id]);
    emailTimers.current[id] = setTimeout(() => {
      updateProspect.mutate({ id, patch: { email } });
    }, 800);
  };

  // Local email state (so the input isn't jumpy while debouncing)
  const [emailOverrides, setEmailOverrides] = useState<Record<string, string>>({});
  const getEmail = (p: WorkspaceProspect) =>
    emailOverrides[p.id] !== undefined ? emailOverrides[p.id] : p.email;

  const handleToggle = (id: string, field: 'reached_out' | 'responded', value: boolean) => {
    updateProspect.mutate({ id, patch: { [field]: value } });
  };

  const handleInvite = (p: WorkspaceProspect) => {
    const email = getEmail(p);
    if (!email) {
      toast.error('Add an email address first');
      return;
    }
    // If email was overridden, save it first then invite
    if (emailOverrides[p.id] !== undefined && emailOverrides[p.id] !== p.email) {
      updateProspect.mutate(
        { id: p.id, patch: { email: emailOverrides[p.id] } },
        {
          onSuccess: () => {
            inviteProspect.mutate(p.id, {
              onSuccess: () => toast.success(`Invite sent to ${email}`),
              onError: () => toast.error('Failed to send invite'),
            });
          },
        }
      );
    } else {
      inviteProspect.mutate(p.id, {
        onSuccess: () => toast.success(`Invite sent to ${email}`),
        onError: () => toast.error('Failed to send invite'),
      });
    }
  };

  const handleDelete = (p: WorkspaceProspect) => {
    deleteProspect.mutate(p.id, {
      onSuccess: () => toast.success(`Removed ${p.name}`),
      onError: () => toast.error('Failed to remove prospect'),
    });
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Prospect Workspace</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? 'Loading…' : `${rows.length} creator${rows.length === 1 ? '' : 's'}`}
            {search ? <> matching <span className="italic">"{search}"</span></> : null}
          </p>
        </div>
        <Link to="/" className="inline-flex w-full sm:w-auto">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Search className="h-4 w-4 mr-2" /> New search
          </Button>
        </Link>
      </div>

      {/* Search bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Filter by name, handle, niche, city…"
          className="pl-9"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      )}

      {/* Mobile cards */}
      {!isLoading && (
        <div className="md:hidden space-y-4">
          {rows.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground rounded-xl border border-border bg-card">
              {prospects.length === 0
                ? 'No prospects yet — run a search to add creators.'
                : 'No creators match your filter.'}
            </div>
          )}
          {rows.map(p => (
            <div key={p.id} className="rounded-xl border border-border bg-card p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-foreground">{p.name}</div>
                  <div className="text-sm text-muted-foreground">{p.handle}</div>
                </div>
                <div className="text-right text-sm">
                  <div className="tabular-nums text-foreground">{p.followers.toLocaleString()} fol.</div>
                  <div className="text-muted-foreground">{p.engagement}% eng.</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col gap-1.5">
                  <span className="text-muted-foreground text-xs">Reached out?</span>
                  <Toggle value={p.reached_out} onChange={v => handleToggle(p.id, 'reached_out', v)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-muted-foreground text-xs">Response?</span>
                  <Toggle value={p.responded} onChange={v => handleToggle(p.id, 'responded', v)} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Email</div>
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <Mail className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={getEmail(p)}
                      onChange={e => {
                        setEmailOverrides(prev => ({ ...prev, [p.id]: e.target.value }));
                        handleEmailChange(p.id, e.target.value);
                      }}
                      placeholder="email@…"
                      className="h-8 pl-7 text-xs w-full"
                    />
                  </div>
                  {p.invitation_status !== 'accepted' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2 text-xs shrink-0"
                      disabled={!getEmail(p) || p.invitation_status === 'invited' || inviteProspect.isPending}
                      onClick={() => handleInvite(p)}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      {p.invitation_status === 'invited' ? 'Sent' : 'Invite'}
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <InviteBadge status={p.invitation_status} />
                <button
                  onClick={() => handleDelete(p)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Desktop table */}
      {!isLoading && (
        <div className="hidden md:block rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Handle</th>
                  <th className="px-4 py-2.5 font-medium">Name</th>
                  <th className="px-4 py-2.5 font-medium">City</th>
                  <th className="px-4 py-2.5 font-medium text-right">Followers</th>
                  <th className="px-4 py-2.5 font-medium text-right">Eng.</th>
                  <th className="px-4 py-2.5 font-medium">Reached out?</th>
                  <th className="px-4 py-2.5 font-medium">Response?</th>
                  <th className="px-4 py-2.5 font-medium">Email</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      {prospects.length === 0
                        ? 'No prospects yet — run a search to add creators.'
                        : 'No creators match your filter.'}
                    </td>
                  </tr>
                )}
                {rows.map(p => (
                  <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-foreground">{p.handle}</td>
                    <td className="px-4 py-3 text-foreground">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.flag} {p.city}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">{p.followers.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">{p.engagement}%</td>
                    <td className="px-4 py-3">
                      <Toggle value={p.reached_out} onChange={v => handleToggle(p.id, 'reached_out', v)} />
                    </td>
                    <td className="px-4 py-3">
                      <Toggle value={p.responded} onChange={v => handleToggle(p.id, 'responded', v)} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            value={getEmail(p)}
                            onChange={e => {
                              setEmailOverrides(prev => ({ ...prev, [p.id]: e.target.value }));
                              handleEmailChange(p.id, e.target.value);
                            }}
                            placeholder="email@…"
                            className="h-8 w-44 pl-7 text-xs"
                          />
                        </div>
                        {p.invitation_status !== 'accepted' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 text-xs"
                            disabled={!getEmail(p) || p.invitation_status === 'invited' || inviteProspect.isPending}
                            onClick={() => handleInvite(p)}
                          >
                            <Send className="h-3 w-3" />
                            {p.invitation_status === 'invited' ? 'Sent' : 'Invite'}
                          </Button>
                        )}
                        {p.invitation_status === 'accepted' && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <InviteBadge status={p.invitation_status} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(p)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
