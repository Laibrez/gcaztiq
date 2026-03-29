import { useState, useEffect } from 'react';
import { Upload, Check, Loader2 } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { api } from '@/lib/api';

const tabs = ['Profile', 'Payment Rails', 'Notifications', 'Billing'];

const paymentRails = [
  { name: 'PayPal', desc: 'Send payouts to creators via PayPal', connected: true },
  { name: 'Stripe', desc: 'Process payments through Stripe', connected: true },
  { name: 'Payoneer', desc: 'International payouts via Payoneer', connected: false },
  { name: 'Wise', desc: 'Low-cost international transfers', connected: false },
  { name: 'Revolut', desc: 'Fast business payments via Revolut', connected: false },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Profile');
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('EST');
  const [notifications, setNotifications] = useState({
    payouts: true,
    signups: true,
    milestones: true,
    weekly: false,
    lowBalance: true,
  });

  useEffect(() => {
    api.get('/api/auth/me').then((data: any) => {
      setCompanyName(data.company_name || data.email?.split('@')[0] || '');
      setCompanyEmail(data.email || '');
    }).finally(() => setProfileLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/api/auth/profile', { company_name: companyName });
      toast.success('Settings saved!');
    } catch {
      toast.error('Failed to save — please try again');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-foreground">Settings</h1>

      <div className="flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              activeTab === t
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'Profile' && (
        <div className="max-w-lg space-y-5">
          {profileLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading profile…
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Company name</Label>
                <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Your company name" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Company email</Label>
                <Input value={companyEmail} disabled className="opacity-70" />
                <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Logo</Label>
                <div className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted transition-colors hover:border-muted-foreground/40">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Preferred currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EST">Eastern (EST)</SelectItem>
                      <SelectItem value="CST">Central (CST)</SelectItem>
                      <SelectItem value="MST">Mountain (MST)</SelectItem>
                      <SelectItem value="PST">Pacific (PST)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : 'Save Changes'}
              </Button>
            </>
          )}
        </div>
      )}

      {activeTab === 'Payment Rails' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paymentRails.map((r) => (
            <div key={r.name} className="space-y-3 rounded-xl border border-border bg-card p-5">
              <h3 className="text-base font-semibold text-foreground">{r.name}</h3>
              <p className="text-sm text-muted-foreground">{r.desc}</p>
              <div className="flex items-center justify-between pt-2">
                {r.connected ? (
                  <>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-status-sent">
                      <Check className="h-4 w-4" /> Connected
                    </span>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="text-sm text-muted-foreground">Not connected</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary text-foreground"
                    >
                      Connect
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Notifications' && (
        <div className="max-w-lg space-y-4">
          {([
            [
              'payouts',
              'Payout notifications',
              'Get notified when payouts are sent or claimed',
            ],
            [
              'signups',
              'Creator signup alerts',
              'Get notified when creators join your program',
            ],
            [
              'milestones',
              'Campaign milestone alerts',
              'Get notified when campaigns hit milestones',
            ],
            [
              'weekly',
              'Weekly summary email',
              'Receive a weekly digest of your program activity',
            ],
            [
              'lowBalance',
              'Low balance warning',
              'Get alerted when your wallet balance is low',
            ],
          ] as const).map(([key, label, desc]) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <Switch
                checked={notifications[key]}
                onCheckedChange={(v) =>
                  setNotifications({ ...notifications, [key]: v })
                }
              />
            </div>
          ))}
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => toast.success('Preferences saved!')}
          >
            Save Preferences
          </Button>
        </div>
      )}

      {activeTab === 'Billing' && (
        <div className="max-w-2xl space-y-5">
          <div className="space-y-3 rounded-xl border border-border bg-card p-5">
            <h3 className="text-base font-semibold text-foreground">Free Plan — $0/mo</h3>
            <p className="text-sm text-muted-foreground">
              5% platform fee on creator payouts
            </p>
            <div className="flex gap-6 text-sm">
              <span className="text-muted-foreground">34 active creators</span>
              <span className="text-muted-foreground">
                $24,850 in payouts this month
              </span>
            </div>
            <Button variant="outline">Contact Sales</Button>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 text-base font-semibold text-foreground">
              Invoice History
            </h3>
            <div className="flex flex-col items-center py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No invoices — Caztiq is free for brands
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Revenue comes from a 5% fee on creator payouts
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
