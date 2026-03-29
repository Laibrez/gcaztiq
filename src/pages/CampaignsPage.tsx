import { useState } from 'react';
import { Plus, Users, Megaphone, Trash2, MoreHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useCampaigns, useCreateCampaign, useDeleteCampaign } from '@/hooks/useCampaigns';

const statusStyles: Record<string, string> = {
  active:    'bg-status-sent/15 text-status-sent',
  completed: 'bg-muted text-muted-foreground',
  paused:    'bg-status-pending/15 text-status-pending',
  draft:     'bg-muted text-muted-foreground',
};

function formatDate(d?: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CampaignsPage() {
  const { data: campaigns = [], isLoading } = useCampaigns();
  const create = useCreateCampaign();
  const remove = useDeleteCampaign();

  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) { toast.error('Campaign name is required'); return; }
    try {
      await create.mutateAsync({ name: name.trim(), description, starts_at: startsAt || undefined, ends_at: endsAt || undefined });
      setShowNew(false);
      setName(''); setDescription(''); setStartsAt(''); setEndsAt('');
      toast.success('Campaign created!');
    } catch (err: any) {
      toast.error(err?.error || 'Failed to create campaign');
    }
  };

  const handleDelete = async (id: string, n: string) => {
    if (!confirm(`Delete campaign "${n}"?`)) return;
    try {
      await remove.mutateAsync(id);
      toast.success('Campaign deleted');
    } catch {
      toast.error('Failed to delete campaign');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Campaigns</h1>
          <p className="text-sm text-muted-foreground">Manage your creator campaigns.</p>
        </div>
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4" /> New Campaign
        </Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading campaigns…</div>
      ) : (campaigns as any[]).length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <Megaphone className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground font-medium mb-1">Create your first campaign</p>
          <p className="text-xs text-muted-foreground/70 mb-3 max-w-sm">Set up a campaign to easily organize and pay multiple creators at once.</p>
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 mt-1" onClick={() => setShowNew(true)}>
            <Plus className="h-4 w-4" /> New Campaign
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {(campaigns as any[]).map((c) => {
            const creatorCount = c.campaign_creators?.length ?? 0;

            return (
              <div key={c.id} className="space-y-4 rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-base font-semibold text-foreground">{c.name}</h3>
                      <span className={cn('shrink-0 inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize', statusStyles[c.status] ?? 'bg-muted text-foreground')}>
                        {c.status ?? 'active'}
                      </span>
                    </div>
                    {(c.starts_at || c.ends_at) && (
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {formatDate(c.starts_at)}{c.ends_at ? ` – ${formatDate(c.ends_at)}` : ''}
                      </p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="shrink-0 ml-2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleDelete(c.id, c.name)}>
                        <Trash2 className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {c.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>
                )}

                <div className="flex items-center gap-2 border-t border-border pt-3">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {creatorCount} creator{creatorCount !== 1 ? 's' : ''}
                  </span>
                  {c.starts_at && new Date(c.starts_at) > new Date() && (
                    <span className="ml-auto text-xs text-muted-foreground">Not started</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New campaign dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-foreground">New Campaign</h2>
              <p className="text-sm text-muted-foreground">Set up a new creator campaign.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Campaign name <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. Summer TikTok Push" value={name} onChange={e => setName(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Description (optional)</Label>
                <Textarea placeholder="Campaign goals and notes…" rows={2} value={description} onChange={e => setDescription(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Start date</Label>
                  <Input type="date" value={startsAt} onChange={e => setStartsAt(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">End date</Label>
                  <Input type="date" value={endsAt} onChange={e => setEndsAt(e.target.value)} />
                </div>
              </div>
            </div>

            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleCreate}
              disabled={!name.trim() || create.isPending}
            >
              {create.isPending ? 'Creating…' : 'Create Campaign'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
