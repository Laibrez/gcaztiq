import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Upload, Mail, Building2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get('/api/auth/me'),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  const initials = profile?.name
    ? profile.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'B';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Brand Profile</h1>
        <p className="text-sm text-muted-foreground">Your public brand account details.</p>
      </div>

      <div className="flex items-center gap-6 rounded-xl border border-border bg-card p-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground uppercase">
          {initials}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{profile?.name || 'Brand Account'}</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
            <Mail className="h-3.5 w-3.5" />
            {profile?.email || '—'}
          </p>
        </div>
      </div>

      <div className="max-w-lg space-y-5 rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold text-foreground">Edit Details</h3>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Company / Brand Name</Label>
          <Input defaultValue={profile?.name || ''} placeholder="Your brand name" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Email</Label>
          <div className="flex items-center gap-2">
            <Input defaultValue={profile?.email || ''} disabled className="text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground">Email is managed through your login credentials.</p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Logo</Label>
          <div className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted transition-colors hover:border-primary/50">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>

        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => toast.success('Profile saved!')}
        >
          Save Changes
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 font-semibold text-foreground">Account Info</h3>
        <dl className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <dt className="text-muted-foreground">Account type:</dt>
            <dd className="font-medium text-foreground">Brand</dd>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <dt className="text-muted-foreground">Plan:</dt>
            <dd className="font-medium text-foreground">Free — 5% platform fee</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
