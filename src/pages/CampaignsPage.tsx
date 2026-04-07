import { useState, useMemo } from 'react';
import { Plus, X, Users, Video, DollarSign, Info, Search, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { useCampaigns, useCreateCampaign } from '@/hooks/useCampaigns';
import { useCreators } from '@/hooks/useCreators';

const platforms = ['TikTok', 'Instagram', 'YouTube', 'Multi-Platform'];

const statusStyles: Record<string, string> = {
  active: 'bg-status-sent/15 text-status-sent',
  completed: 'bg-muted text-muted-foreground',
  draft: 'bg-status-pending/15 text-status-pending',
};

const colors = ['bg-pink-400', 'bg-violet-400', 'bg-sky-400', 'bg-amber-400', 'bg-emerald-400', 'bg-rose-400', 'bg-indigo-400', 'bg-teal-400', 'bg-orange-400', 'bg-cyan-400', 'bg-purple-400', 'bg-lime-400'];

export default function CampaignsPage() {
  const { data: campaigns = [], isLoading } = useCampaigns();
  const { data: creators = [] } = useCreators();
  const create = useCreateCampaign();

  const [showNew, setShowNew] = useState(false);
  
  // Section 1: Details
  const [campaignName, setCampaignName] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [description, setDescription] = useState('');

  // Section 2: Payments
  const [paymentType, setPaymentType] = useState('');
  const [flatAmount, setFlatAmount] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [cpmRate, setCpmRate] = useState('');
  const [customPaymentDesc, setCustomPaymentDesc] = useState('');

  // Section 3: Bonuses
  const [showBonuses, setShowBonuses] = useState(false);
  const [bonusTiers, setBonusTiers] = useState([{ views: '', bonus: '' }]);

  // Section 4: Creators
  const [selectedCreators, setSelectedCreators] = useState<string[]>([]);
  const [creatorSearch, setCreatorSearch] = useState('');

  const resetForm = () => {
    setCampaignName('');
    setSelectedPlatform('');
    setStartsAt('');
    setEndsAt('');
    setDescription('');
    setPaymentType('');
    setFlatAmount('');
    setMonthlyAmount('');
    setCpmRate('');
    setCustomPaymentDesc('');
    setShowBonuses(false);
    setBonusTiers([{ views: '', bonus: '' }]);
    setSelectedCreators([]);
    setCreatorSearch('');
  };

  const handleCreate = async () => {
    if (!campaignName.trim()) { toast.error('Campaign name is required'); return; }
    
    const payment_config = {
      platform: selectedPlatform,
      paymentType,
      flatAmount,
      monthlyAmount,
      cpmRate,
      customPaymentDesc,
      bonusTiers: showBonuses ? bonusTiers : [],
    };

    try {
      await create.mutateAsync({ 
        name: campaignName.trim(), 
        description, 
        starts_at: startsAt || undefined, 
        ends_at: endsAt || undefined, 
        creator_ids: selectedCreators,
        payment_config
      });
      setShowNew(false);
      resetForm();
      toast.success(selectedCreators.length > 0 ? 'Campaign created! Notifications sent to assigned creators.' : 'Campaign created!');
    } catch (err: any) {
      toast.error(err?.error || 'Failed to create campaign');
    }
  };

  const toggleCreator = (id: string) => {
    setSelectedCreators((prev) => prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]);
  };

  const filteredCreators = (creators as any[]).filter(
    (c) => !creatorSearch || (c.name || '').toLowerCase().includes(creatorSearch.toLowerCase()) || (c.email || '').toLowerCase().includes(creatorSearch.toLowerCase())
  );

  const creatorMap = useMemo(() => Object.fromEntries((creators as any[]).map(c => [c.id, c.name || c.email])), [creators]);

  const formattedCampaigns = useMemo(() => {
    return (campaigns as any[]).map(c => {
      const creatorCount = c.campaign_creators?.length || 0;
      
      let dateRange = 'Dates not set';
      if (c.starts_at && c.ends_at) dateRange = `${new Date(c.starts_at).toLocaleDateString(undefined, {month:'short', day:'numeric'})} – ${new Date(c.ends_at).toLocaleDateString(undefined, {month:'short', day:'numeric'})}`;
      else if (c.starts_at) dateRange = `Starts ${new Date(c.starts_at).toLocaleDateString(undefined, {month:'short', day:'numeric'})}`;
      else if (c.ends_at) dateRange = `Ends ${new Date(c.ends_at).toLocaleDateString(undefined, {month:'short', day:'numeric'})}`;

      const avatars = (c.campaign_creators || []).slice(0, 4).map((cc: any, i: number) => ({
        initial: (creatorMap[cc.creator_id] || 'C').charAt(0).toUpperCase(),
        color: colors[i % colors.length]
      }));

      let paymentStructure = 'Not yet configured';
      if (c.payment_config?.paymentType === 'flat') paymentStructure = `$${c.payment_config.flatAmount || 0}/video flat`;
      else if (c.payment_config?.paymentType === 'cpm') paymentStructure = `$${c.payment_config.cpmRate || 0} CPM`;
      else if (c.payment_config?.paymentType === 'retainer') paymentStructure = `$${c.payment_config.monthlyAmount || 0}/month retainer`;
      else if (c.payment_config?.paymentType === 'hybrid') paymentStructure = `$${c.payment_config.monthlyAmount || 0} retainer + $${c.payment_config.cpmRate || 0} CPM`;
      else if (c.payment_config?.paymentType === 'custom') paymentStructure = c.payment_config.customPaymentDesc;

      return {
        id: c.id,
        name: c.name,
        status: (c.status || 'active').toLowerCase(),
        dateRange,
        creatorCount,
        avatars,
        paymentStructure,
        stats: { creators: creatorCount, videos: 0, spent: 0 } // Pending real integration for videos/spent
      };
    });
  }, [campaigns, creatorMap]);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Campaigns</h1>
          <p className="text-sm text-muted-foreground">Manage your creator campaigns.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2" onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4" /> New Campaign
        </Button>
      </div>

      {/* Campaign Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading campaigns…</div>
      ) : formattedCampaigns.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <Megaphone className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-foreground font-medium">No campaigns yet</p>
          <p className="text-xs text-muted-foreground max-w-sm">Create a campaign to start managing and paying creators.</p>
          <Button className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90" size="sm" onClick={() => setShowNew(true)}>Create Campaign</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {formattedCampaigns.map((c, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-foreground truncate">{c.name}</h3>
                    <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize', statusStyles[c.status] || statusStyles.active)}>{c.status}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{c.dateRange}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {c.avatars.map((a, j) => (
                    <div key={j} className={cn('flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white border-2 border-card', a.color)}>
                      {a.initial}
                    </div>
                  ))}
                </div>
                {c.creatorCount > c.avatars.length && (
                  <span className="text-xs text-muted-foreground">+{c.creatorCount - c.avatars.length} more</span>
                )}
                {c.creatorCount === 0 && <span className="text-xs text-muted-foreground">No creators assigned</span>}
              </div>

              <p className="text-sm text-muted-foreground">{c.paymentStructure}</p>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Creators</p>
                    <p className="text-sm font-semibold text-foreground">{c.stats.creators}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Videos</p>
                    <p className="text-sm font-semibold text-foreground">{c.stats.videos}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Spent</p>
                    <p className="text-sm font-semibold text-foreground">${c.stats.spent.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Campaign Modal */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">New Campaign</h2>
              <p className="text-sm text-muted-foreground">Set up a new creator campaign.</p>
            </div>

            {/* Section 1: Campaign Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Campaign Details</h3>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Campaign name</Label>
                <Input placeholder="e.g. Summer TikTok Push" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Platforms</Label>
                <div className="flex flex-wrap gap-2">
                  {platforms.map((p) => (
                    <button
                      key={p}
                      onClick={() => setSelectedPlatform(p)}
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                        selectedPlatform === p ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:border-muted-foreground/40'
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Start date</Label>
                  <Input type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">End date</Label>
                  <Input type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Campaign goal / description</Label>
                <Textarea placeholder="Campaign goals and notes..." rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </div>

            {/* Section 2: Payment Structure */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Payment Structure</h3>
              <RadioGroup value={paymentType} onValueChange={setPaymentType} className="space-y-2">
                <label className="flex items-center gap-2.5 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <RadioGroupItem value="flat" />
                  <span className="text-sm text-foreground">Flat Fee Per Deliverable</span>
                </label>
                <label className="flex items-center gap-2.5 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <RadioGroupItem value="retainer" />
                  <span className="text-sm text-foreground">Retainer (Monthly)</span>
                </label>
                <label className="flex items-center gap-2.5 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <RadioGroupItem value="cpm" />
                  <span className="text-sm text-foreground">Performance-Based (CPM)</span>
                </label>
                <label className="flex items-center gap-2.5 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <RadioGroupItem value="hybrid" />
                  <span className="text-sm text-foreground">Hybrid (Retainer + CPM)</span>
                </label>
                <label className="flex items-center gap-2.5 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <RadioGroupItem value="custom" />
                  <span className="text-sm text-foreground">Custom</span>
                </label>
              </RadioGroup>

              {paymentType === 'flat' && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Amount per video</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    <Input type="number" placeholder="150.00" className="pl-7" value={flatAmount} onChange={e => setFlatAmount(e.target.value)} />
                  </div>
                </div>
              )}
              {paymentType === 'retainer' && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Monthly amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    <Input type="number" placeholder="500.00" className="pl-7" value={monthlyAmount} onChange={e => setMonthlyAmount(e.target.value)} />
                  </div>
                </div>
              )}
              {paymentType === 'cpm' && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Rate per 1,000 views</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    <Input type="number" placeholder="0.30" className="pl-7" value={cpmRate} onChange={e => setCpmRate(e.target.value)} />
                  </div>
                </div>
              )}
              {paymentType === 'hybrid' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Monthly retainer</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                      <Input type="number" placeholder="500.00" className="pl-7" value={monthlyAmount} onChange={e => setMonthlyAmount(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">CPM rate</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                      <Input type="number" placeholder="0.30" className="pl-7" value={cpmRate} onChange={e => setCpmRate(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}
              {paymentType === 'custom' && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Describe payment structure</Label>
                  <Textarea placeholder="e.g. $150/video + $0.30 CPM + performance bonuses" rows={2} value={customPaymentDesc} onChange={e => setCustomPaymentDesc(e.target.value)} />
                </div>
              )}
            </div>

            {/* Section 3: Bonus Tiers */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Bonus Tiers</h3>
                <Switch checked={showBonuses} onCheckedChange={setShowBonuses} className="scale-75" />
              </div>
              {showBonuses && (
                <div className="space-y-2">
                  {bonusTiers.map((tier, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground shrink-0">If views reach</span>
                      <Input type="number" placeholder="10,000" className="w-28" value={tier.views} onChange={(e) => { const t = [...bonusTiers]; t[idx].views = e.target.value; setBonusTiers(t); }} />
                      <span className="text-xs text-muted-foreground shrink-0">→ pay $</span>
                      <Input type="number" placeholder="50" className="w-20" value={tier.bonus} onChange={(e) => { const t = [...bonusTiers]; t[idx].bonus = e.target.value; setBonusTiers(t); }} />
                      {bonusTiers.length > 1 && (
                        <button onClick={() => setBonusTiers(bonusTiers.filter((_, j) => j !== idx))} className="text-muted-foreground hover:text-destructive">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => setBonusTiers([...bonusTiers, { views: '', bonus: '' }])} className="text-xs text-primary hover:text-primary/80 font-medium">
                    + Add another tier
                  </button>
                </div>
              )}
            </div>

            {/* Section 4: Assign Creators */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Assign Creators</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search confirmed creators..." value={creatorSearch} onChange={(e) => setCreatorSearch(e.target.value)} className="pl-9 text-sm" />
              </div>
              <div className="max-h-40 overflow-y-auto space-y-0.5 rounded-lg border border-border p-2">
                {filteredCreators.length === 0 ? (
                  <p className="p-2 text-xs text-muted-foreground text-center">No creators match your search.</p>
                ) : (
                  filteredCreators.map((c) => (
                    <label key={c.id} className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-muted cursor-pointer transition-colors">
                      <Checkbox checked={selectedCreators.includes(c.id)} onCheckedChange={() => toggleCreator(c.id)} />
                      <div className={cn('flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white shrink-0', colors[(c.id.charCodeAt(0)) % colors.length])}>
                        {(c.name || c.email).charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-foreground">{c.name || 'Unnamed'}</span>
                      <span className="text-xs text-muted-foreground truncate">{c.email}</span>
                    </label>
                  ))
                )}
              </div>
              {selectedCreators.length > 0 && (
                <p className="text-xs text-muted-foreground">{selectedCreators.length} creator{selectedCreators.length > 1 ? 's' : ''} selected</p>
              )}
            </div>

            {/* Section 5: Create */}
            <div className="space-y-3">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 text-sm font-semibold" onClick={handleCreate} disabled={create.isPending || !campaignName.trim()}>
                {create.isPending ? 'Creating…' : 'Create Campaign'}
              </Button>
              <div className="rounded-lg bg-accent/50 p-3.5 flex gap-2.5">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  When you create a campaign, each assigned creator receives an email with the campaign details. This is an informational notification; no signature required.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
