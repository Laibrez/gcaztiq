import { useState } from 'react';
import {
  Search,
  MoreHorizontal,
  UserPlus,
  Eye,
  Pause,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface CreatorRow {
  name: string;
  handle: string;
  email: string;
  initial: string;
  color: string;
  country: string;
  flag: string;
  campaigns: number;
  earned: number;
  taxStatus: 'w9' | 'w8ben' | 'pending';
  status: 'Active' | 'Paused' | 'Pending';
}

const creatorsData: CreatorRow[] = [
  {
    name: 'Sarah Jenkins',
    handle: '@sarah.j_lifestyle',
    email: 'sarah.j@gmail.com',
    initial: 'S',
    color: 'bg-pink-400',
    country: 'United States',
    flag: '🇺🇸',
    campaigns: 3,
    earned: 4250,
    taxStatus: 'w9',
    status: 'Active',
  },
  {
    name: 'Yu Wei',
    handle: '@yuwei_eats',
    email: 'yuwei@creator.cn',
    initial: 'Y',
    color: 'bg-violet-400',
    country: 'China',
    flag: '🇨🇳',
    campaigns: 2,
    earned: 1890,
    taxStatus: 'w8ben',
    status: 'Active',
  },
  {
    name: 'David Russo',
    handle: '@drusso_tech',
    email: 'drusso@outlook.com',
    initial: 'D',
    color: 'bg-sky-400',
    country: 'United States',
    flag: '🇺🇸',
    campaigns: 1,
    earned: 750,
    taxStatus: 'w9',
    status: 'Active',
  },
  {
    name: 'Maria Gonzalez',
    handle: '@maria_glow',
    email: 'maria.g@outlook.com',
    initial: 'M',
    color: 'bg-amber-400',
    country: 'Mexico',
    flag: '🇲🇽',
    campaigns: 2,
    earned: 2100,
    taxStatus: 'w8ben',
    status: 'Active',
  },
  {
    name: 'Oliver Hayes',
    handle: '@oliver.creates',
    email: 'oliver.h@gmail.com',
    initial: 'O',
    color: 'bg-emerald-400',
    country: 'United Kingdom',
    flag: '🇬🇧',
    campaigns: 2,
    earned: 3360,
    taxStatus: 'w8ben',
    status: 'Active',
  },
  {
    name: 'Claire Thompson',
    handle: '@claire.designs',
    email: 'claire.d@gmail.com',
    initial: 'C',
    color: 'bg-rose-400',
    country: 'United States',
    flag: '🇺🇸',
    campaigns: 1,
    earned: 3500,
    taxStatus: 'w9',
    status: 'Active',
  },
  {
    name: 'Hana Tanaka',
    handle: '@hana.tokyo',
    email: 'hana.t@yahoo.co.jp',
    initial: 'H',
    color: 'bg-indigo-400',
    country: 'Japan',
    flag: '🇯🇵',
    campaigns: 1,
    earned: 3800,
    taxStatus: 'w8ben',
    status: 'Active',
  },
  {
    name: 'Jake Fitzpatrick',
    handle: '@jake.fits',
    email: 'jake.fits@gmail.com',
    initial: 'J',
    color: 'bg-teal-400',
    country: 'United States',
    flag: '🇺🇸',
    campaigns: 1,
    earned: 150,
    taxStatus: 'w9',
    status: 'Paused',
  },
  {
    name: 'Priya Sharma',
    handle: '@priya.wellness',
    email: 'priya.s@gmail.com',
    initial: 'P',
    color: 'bg-orange-400',
    country: 'United States',
    flag: '🇺🇸',
    campaigns: 1,
    earned: 400,
    taxStatus: 'w9',
    status: 'Active',
  },
  {
    name: 'Chen Wei',
    handle: '@chen.codes',
    email: 'chen.codes@163.com',
    initial: 'C',
    color: 'bg-cyan-400',
    country: 'China',
    flag: '🇨🇳',
    campaigns: 1,
    earned: 1800,
    taxStatus: 'w8ben',
    status: 'Active',
  },
  {
    name: 'Luca Bianchi',
    handle: '@luca.films',
    email: 'luca.b@gmail.com',
    initial: 'L',
    color: 'bg-purple-400',
    country: 'Italy',
    flag: '🇮🇹',
    campaigns: 1,
    earned: 1050,
    taxStatus: 'w8ben',
    status: 'Active',
  },
  {
    name: 'Tabby Rodriguez',
    handle: '@tabby.creates',
    email: 'tabby49@hotmail.com',
    initial: 'T',
    color: 'bg-lime-400',
    country: 'United States',
    flag: '🇺🇸',
    campaigns: 1,
    earned: 534,
    taxStatus: 'pending',
    status: 'Active',
  },
  {
    name: 'André Santos',
    handle: '@andre.digital',
    email: 'andre.s@gmail.com',
    initial: 'A',
    color: 'bg-green-400',
    country: 'Brazil',
    flag: '🇧🇷',
    campaigns: 0,
    earned: 0,
    taxStatus: 'pending',
    status: 'Pending',
  },
  {
    name: 'Kenji Moto',
    handle: '@kenji.reviews',
    email: 'kenji.m@gmail.com',
    initial: 'K',
    color: 'bg-red-400',
    country: 'Japan',
    flag: '🇯🇵',
    campaigns: 0,
    earned: 0,
    taxStatus: 'w8ben',
    status: 'Pending',
  },
];

const statusStyles: Record<string, string> = {
  Active: 'bg-status-sent/15 text-status-sent',
  Paused: 'bg-status-pending/15 text-status-pending',
  Pending: 'bg-muted text-muted-foreground',
};

const locations = [
  'All',
  'United States',
  'United Kingdom',
  'Brazil',
  'Japan',
  'Mexico',
  'Canada',
  'China',
  'Italy',
];

export default function CreatorsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('All');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteCountry, setInviteCountry] = useState('');

  const filtered = creatorsData.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (locationFilter !== 'All' && c.country !== locationFilter) return false;
    if (
      search &&
      !c.name.toLowerCase().includes(search.toLowerCase()) &&
      !c.handle.toLowerCase().includes(search.toLowerCase()) &&
      !c.email.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const handleInvite = () => {
    setShowInvite(false);
    setInviteName('');
    setInviteEmail('');
    setInviteCountry('');
    toast.success("Invite sent! They'll receive an email to complete their setup.");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Creators</h1>
          <p className="text-sm text-muted-foreground">
            Manage your creator network.
          </p>
        </div>
        <Button
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setShowInvite(true)}
        >
          <UserPlus className="h-4 w-4" /> Invite Creator
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search creators..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Paused">Paused</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {locations.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Creator
              </th>
              <th className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Email
              </th>
              <th className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Location
              </th>
              <th className="px-5 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Campaigns
              </th>
              <th className="px-5 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Total Earned
              </th>
              <th className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Tax Status
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
            {filtered.map((c, i) => (
              <tr
                key={i}
                className="border-b border-border transition-colors last:border-0 hover:bg-muted/50"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'h-8 w-8 shrink-0 rounded-full text-xs font-semibold text-white',
                        'flex items-center justify-center',
                        c.color
                      )}
                    >
                      {c.initial}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.handle}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{c.email}</td>
                <td className="whitespace-nowrap px-5 py-3 text-sm text-foreground">
                  {c.flag} {c.country}
                </td>
                <td className="px-5 py-3 text-right text-sm text-foreground">
                  {c.campaigns}
                </td>
                <td className="px-5 py-3 text-right text-sm font-medium text-foreground">
                  ${c.earned.toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-sm">
                  {c.taxStatus === 'w9' && (
                    <span className="font-medium text-status-sent">W-9 ✓</span>
                  )}
                  {c.taxStatus === 'w8ben' && (
                    <span className="font-medium text-status-sent">W-8BEN ✓</span>
                  )}
                  {c.taxStatus === 'pending' && (
                    <span className="font-medium text-status-pending">Pending ⚠️</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                      statusStyles[c.status]
                    )}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem className="gap-2">
                        <Eye className="h-4 w-4" /> View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <Pause className="h-4 w-4" /> Pause
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-destructive">
                        <Trash2 className="h-4 w-4" /> Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="sm:max-w-md">
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Invite a Creator</h2>
              <p className="text-sm text-muted-foreground">
                They'll receive an email to set up their payment method and tax
                forms.
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Creator name</Label>
                <Input
                  placeholder="Full name"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Creator email</Label>
                <Input
                  placeholder="creator@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Country</Label>
                <Select value={inviteCountry} onValueChange={setInviteCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations
                      .filter((l) => l !== 'All')
                      .map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleInvite}
              disabled={!inviteName || !inviteEmail}
            >
              Send Invite
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
