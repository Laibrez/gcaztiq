import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

import { Check, Mail, Search, Send, CheckCircle2, Clock, ArrowLeft } from 'lucide-react';
import { prospectPool, type Prospect, type TaxStatus } from '@/data/prospectsData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function WorkspacePage() {
  const [params] = useSearchParams();
  const niche = params.get('niche') || '';
  const min = Number(params.get('min') || 0);
  const max = Number(params.get('max') || Infinity);
  const eng = Number(params.get('eng') || 0);
  const format = params.get('format') || 'any';
  const city = (params.get('city') || '').toLowerCase().trim();
  const q = params.get('q') || '';

  const initial = useMemo(() => {
    return prospectPool.filter((p) => {
      if (niche && niche !== 'any' && !p.niche.includes(niche)) return false;
      if (p.followers < min || p.followers > max) return false;
      if (p.engagement < eng) return false;
      if (format !== 'any' && !p.format.includes(format)) return false;
      if (city && !p.city.toLowerCase().includes(city)) return false;
      return true;
    });
  }, [niche, min, max, eng, format, city]);

  const [rows, setRows] = useState<Prospect[]>(initial);
  // re-sync if search changes
  useEffect(() => setRows(initial), [initial]);


  const update = (id: string, patch: Partial<Prospect>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const handleInvite = (p: Prospect) => {
    if (!p.email) {
      toast.error('Add an email first');
      return;
    }
    update(p.id, { taxStatus: 'invited', taxForm: p.country === 'USA' ? 'W-9' : 'W-8BEN' });
    toast.success(`Tax invite sent to ${p.email}`, {
      description: `${p.country === 'USA' ? 'W-9' : 'W-8BEN'} form requested`,
    });
    // simulate creator submitting
    setTimeout(() => {
      update(p.id, { taxStatus: 'submitted' });
      toast.success(`${p.name} submitted their tax info`);
    }, 2800);
  };

  const TaxBadge = ({ s, form }: { s: TaxStatus; form?: string }) => {
    if (s === 'submitted')
      return <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-600 dark:text-blue-400"><CheckCircle2 className="h-3 w-3" /> {form} on file</span>;
    if (s === 'invited')
      return <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-[11px] font-medium text-orange-600 dark:text-orange-400"><Clock className="h-3 w-3" /> Awaiting</span>;
    return <span className="text-[11px] text-muted-foreground">—</span>;
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className={cn(
        'inline-flex h-6 items-center gap-1 rounded-full px-2 text-[11px] font-medium transition-colors',
        value ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-muted text-muted-foreground hover:bg-muted/70'
      )}
    >
      {value ? <><Check className="h-3 w-3" /> Yes</> : 'No'}
    </button>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link to="/" className="inline-flex items-center gap-1 hover:text-foreground"><ArrowLeft className="h-3 w-3" /> Back to search</Link>
          </div>
          <h1 className="mt-1 text-xl font-semibold text-foreground">Prospect workspace</h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} match{rows.length === 1 ? '' : 'es'}
            {q ? <> · <span className="italic">"{q}"</span></> : null}
          </p>
        </div>
        <Link to="/" className="inline-flex">
          <Button variant="outline" size="sm"><Search className="h-4 w-4" /> New search</Button>
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
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
                <th className="px-4 py-2.5 font-medium">Tax</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">No creators match your filters. Try widening the search.</td></tr>
              )}
              {rows.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">{p.handle}</td>
                  <td className="px-4 py-3 text-foreground">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.flag} {p.city}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-foreground">{p.followers.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-foreground">{p.engagement}%</td>
                  <td className="px-4 py-3"><Toggle value={p.reachedOut} onChange={(v) => update(p.id, { reachedOut: v })} /></td>
                  <td className="px-4 py-3"><Toggle value={p.responded} onChange={(v) => update(p.id, { responded: v })} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={p.email}
                          onChange={(e) => update(p.id, { email: e.target.value })}
                          placeholder="email@…"
                          className="h-8 w-44 pl-7 text-xs"
                        />
                      </div>
                      {p.taxStatus !== 'submitted' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2 text-xs"
                          disabled={!p.email || p.taxStatus === 'invited'}
                          onClick={() => handleInvite(p)}
                        >
                          <Send className="h-3 w-3" />
                          {p.taxStatus === 'invited' ? 'Sent' : 'Invite'}
                        </Button>
                      )}
                      {p.taxStatus === 'submitted' && (
                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3"><TaxBadge s={p.taxStatus} form={p.taxForm} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Tip: once a creator submits their W-9 or W-8BEN, it appears in the <Link to="/tax-center" className="text-primary hover:underline">Tax Center</Link>.
      </p>
    </div>
  );
}
