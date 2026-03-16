import { useState } from 'react';
import { Plus, X, Users, Video, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface Campaign {
  name: string;
  status: 'Active' | 'Completed' | 'Draft';
  dateRange: string;
  creatorCount: number;
  avatars: { initial: string; color: string }[];
  paymentStructure: string;
  stats: { creators: number; videos: number; spent: number };
}

const campaignsData: Campaign[] = [
  {
    name: 'Summer TikTok Push',
    status: 'Active',
    dateRange: 'Mar 1 – Mar 31, 2026',
    creatorCount: 8,
    avatars: [
      { initial: 'S', color: 'bg-pink-400' },
      { initial: 'Y', color: 'bg-violet-400' },
      { initial: 'M', color: 'bg-amber-400' },
      { initial: 'O', color: 'bg-emerald-400' },
    ],
    paymentStructure: '$150/video + $0.30 CPM + bonuses',
    stats: { creators: 8, videos: 47, spent: 12400 },
  },
  {
    name: 'Product Review Series',
    status: 'Active',
    dateRange: 'Feb 15 – Mar 15, 2026',
    creatorCount: 5,
    avatars: [
      { initial: 'D', color: 'bg-sky-400' },
      { initial: 'C', color: 'bg-rose-400' },
      { initial: 'H', color: 'bg-indigo-400' },
    ],
    paymentStructure: '$200/video flat',
    stats: { creators: 5, videos: 22, spent: 4400 },
  },
  {
    name: 'Unboxing Campaign',
    status: 'Active',
    dateRange: 'Mar 5 – Apr 5, 2026',
    creatorCount: 4,
    avatars: [
      { initial: 'P', color: 'bg-orange-400' },
      { initial: 'L', color: 'bg-purple-400' },
      { initial: 'T', color: 'bg-lime-400' },
    ],
    paymentStructure: '$100/video + $0.50 CPM',
    stats: { creators: 4, videos: 16, spent: 3200 },
  },
  {
    name: 'Instagram Reels Sprint',
    status: 'Completed',
    dateRange: 'Jan 15 – Feb 15, 2026',
    creatorCount: 6,
    avatars: [
      { initial: 'S', color: 'bg-pink-400' },
      { initial: 'O', color: 'bg-emerald-400' },
      { initial: 'C', color: 'bg-cyan-400' },
    ],
    paymentStructure: '$120/video + bonuses',
    stats: { creators: 6, videos: 38, spent: 5880 },
  },
  {
    name: 'Holiday Promo 2025',
    status: 'Completed',
    dateRange: 'Nov 1 – Dec 31, 2025',
    creatorCount: 10,
    avatars: [
      { initial: 'H', color: 'bg-indigo-400' },
      { initial: 'J', color: 'bg-teal-400' },
      { initial: 'M', color: 'bg-amber-400' },
      { initial: 'K', color: 'bg-red-400' },
    ],
    paymentStructure: '$250/month retainer + $0.30 CPM',
    stats: { creators: 10, videos: 120, spent: 18500 },
  },
  {
    name: 'Spring Launch Teaser',
    status: 'Draft',
    dateRange: 'Apr 1 – Apr 30, 2026',
    creatorCount: 0,
    avatars: [],
    paymentStructure: 'Not yet configured',
    stats: { creators: 0, videos: 0, spent: 0 },
  },
];

const statusStyles: Record<string, string> = {
  Active: 'bg-status-sent/15 text-status-sent',
  Completed: 'bg-muted text-muted-foreground',
  Draft: 'bg-status-pending/15 text-status-pending',
};

const creatorsList = [
  { name: 'Sarah Jenkins', handle: '@sarah.j_lifestyle' },
  { name: 'Yu Wei', handle: '@yuwei_eats' },
  { name: 'David Russo', handle: '@drusso_tech' },
  { name: 'Maria Gonzalez', handle: '@maria_glow' },
  { name: 'Oliver Hayes', handle: '@oliver.creates' },
  { name: 'Claire Thompson', handle: '@claire.designs' },
  { name: 'Hana Tanaka', handle: '@hana.tokyo' },
  { name: 'Priya Sharma', handle: '@priya.wellness' },
  { name: 'Chen Wei', handle: '@chen.codes' },
  { name: 'Luca Bianchi', handle: '@luca.films' },
];

const platforms = ['TikTok', 'Instagram', 'YouTube', 'Multi-Platform'];

export default function CampaignsPage() {
  const [showNew, setShowNew] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [showBonuses, setShowBonuses] = useState(false);
  const [bonusTiers, setBonusTiers] = useState([{ views: '', bonus: '' }]);
  const [selectedCreators, setSelectedCreators] = useState<string[]>([]);
  const [creatorSearch, setCreatorSearch] = useState('');

  const handleCreate = () => {
    setShowNew(false);
    setSelectedPlatform('');
    setPaymentType('');
    setShowBonuses(false);
    setBonusTiers([{ views: '', bonus: '' }]);
    setSelectedCreators([]);
    toast.success('Campaign created!');
  };

  const toggleCreator = (name: string) => {
    setSelectedCreators((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const filteredCreators = creatorsList.filter(
    (c) =>
      !creatorSearch ||
      c.name.toLowerCase().includes(creatorSearch.toLowerCase()) ||
      c.handle.toLowerCase().includes(creatorSearch.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Campaigns</h1>
          <p className="text-sm text-muted-foreground">
            Manage your creator campaigns.
          </p>
        </div>
        <Button
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setShowNew(true)}
        >
          <Plus className="h-4 w-4" /> New Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {campaignsData.map((c, i) => (
          <div
            key={i}
            className="space-y-4 rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-foreground">{c.name}</h3>
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                      statusStyles[c.status]
                    )}
                  >
                    {c.status}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{c.dateRange}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {c.avatars.map((a, j) => (
                  <div
                    key={j}
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full border-2 border-card text-xs font-semibold text-white',
                      a.color
                    )}
                  >
                    {a.initial}
                  </div>
                ))}
              </div>
              {c.creatorCount > c.avatars.length && (
                <span className="text-xs text-muted-foreground">
                  +{c.creatorCount - c.avatars.length} more
                </span>
              )}
              {c.creatorCount === 0 && (
                <span className="text-xs text-muted-foreground">
                  No creators assigned
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground">{c.paymentStructure}</p>

            <div className="grid grid-cols-3 gap-3 border-t border-border pt-2">
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Creators</p>
                  <p className="text-sm font-semibold text-foreground">
                    {c.stats.creators}
                  </p>
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
                  <p className="text-sm font-semibold text-foreground">
                    ${c.stats.spent.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-foreground">New Campaign</h2>
              <p className="text-sm text-muted-foreground">
                Set up a new creator campaign.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Campaign name</Label>
                <Input placeholder="e.g. Summer TikTok Push" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Platform</Label>
                <div className="flex flex-wrap gap-2">
                  {platforms.map((p) => (
                    <button
                      key={p}
                      onClick={() => setSelectedPlatform(p)}
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                        selectedPlatform === p
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border text-muted-foreground hover:border-muted-foreground/40'
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
                  <Input type="date" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">End date</Label>
                  <Input type="date" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Description (optional)</Label>
                <Textarea placeholder="Campaign goals and notes..." rows={2} />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Payment structure</Label>
                <Select value={paymentType} onValueChange={setPaymentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat fee per video</SelectItem>
                    <SelectItem value="retainer">Retainer (monthly)</SelectItem>
                    <SelectItem value="cpm">Performance (CPM)</SelectItem>
                    <SelectItem value="hybrid">Hybrid (retainer + CPM)</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>

                {paymentType === 'flat' && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Amount per video
                    </Label>
                    <Input type="number" placeholder="0.00" />
                  </div>
                )}
                {paymentType === 'retainer' && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Monthly amount</Label>
                    <Input type="number" placeholder="0.00" />
                  </div>
                )}
                {paymentType === 'cpm' && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Rate per 1,000 views
                    </Label>
                    <Input type="number" placeholder="0.00" />
                  </div>
                )}
                {paymentType === 'hybrid' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Monthly retainer
                      </Label>
                      <Input type="number" placeholder="0.00" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">CPM rate</Label>
                      <Input type="number" placeholder="0.00" />
                    </div>
                  </div>
                )}
                {paymentType === 'custom' && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Describe payment structure
                    </Label>
                    <Textarea
                      placeholder="e.g. $150/video + $0.30 CPM + performance bonuses"
                      rows={2}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Bonus tiers</Label>
                  <Switch
                    checked={showBonuses}
                    onCheckedChange={setShowBonuses}
                    className="scale-75"
                  />
                </div>
                {showBonuses && (
                  <div className="space-y-2">
                    {bonusTiers.map((tier, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="shrink-0 text-xs text-muted-foreground">
                          If views reach
                        </span>
                        <Input
                          type="number"
                          placeholder="10,000"
                          className="w-28"
                          value={tier.views}
                          onChange={(e) => {
                            const t = [...bonusTiers];
                            t[idx].views = e.target.value;
                            setBonusTiers(t);
                          }}
                        />
                        <span className="shrink-0 text-xs text-muted-foreground">
                          pay $
                        </span>
                        <Input
                          type="number"
                          placeholder="50"
                          className="w-20"
                          value={tier.bonus}
                          onChange={(e) => {
                            const t = [...bonusTiers];
                            t[idx].bonus = e.target.value;
                            setBonusTiers(t);
                          }}
                        />
                        {bonusTiers.length > 1 && (
                          <button
                            onClick={() =>
                              setBonusTiers(bonusTiers.filter((_, j) => j !== idx))
                            }
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() =>
                        setBonusTiers([...bonusTiers, { views: '', bonus: '' }])
                      }
                      className="rounded bg-primary/80 px-2 py-1 text-xs text-primary-foreground transition-colors hover:bg-primary"
                    >
                      + Add tier
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Assign creators</Label>
                <Input
                  placeholder="Search creators..."
                  value={creatorSearch}
                  onChange={(e) => setCreatorSearch(e.target.value)}
                  className="text-sm"
                />
                <div className="max-h-36 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
                  {filteredCreators.map((c) => (
                    <label
                      key={c.name}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted"
                    >
                      <Checkbox
                        checked={selectedCreators.includes(c.name)}
                        onCheckedChange={() => toggleCreator(c.name)}
                      />
                      <span className="text-sm text-foreground">{c.name}</span>
                      <span className="text-xs text-muted-foreground">{c.handle}</span>
                    </label>
                  ))}
                </div>
                {selectedCreators.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {selectedCreators.length} creator
                    {selectedCreators.length > 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
            </div>

            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleCreate}
            >
              Create Campaign
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
