import { useState } from 'react';
import { CreditCard, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useWallet } from '@/hooks/useWallet';
import { api } from '@/lib/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const typeBadge: Record<string, string> = {
  topup: 'bg-green-100 text-green-700',
  payout: 'bg-orange-100 text-orange-700',
  refund: 'bg-yellow-100 text-yellow-700',
};

// ── Stripe checkout inner form ──────────────────────────────────────────────
function CheckoutForm({ amount, onSuccess }: { amount: string; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + '/wallet' },
      redirect: 'if_required',
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Payment received! Balance will update in a moment…');
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        type="submit"
        disabled={!stripe || loading}
      >
        {loading ? 'Processing…' : `Pay $${amount}`}
      </Button>
    </form>
  );
}

// ── Main wallet page ─────────────────────────────────────────────────────────
export default function WalletPage() {
  const { data, isLoading, refetch } = useWallet();

  const balanceDollars = data?.balance_cents ? (data.balance_cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
  const transactions: any[] = data?.transactions ?? [];

  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [intentLoading, setIntentLoading] = useState(false);

  // Step 1: Ask backend to create a PaymentIntent
  const handleNext = async () => {
    const amountCents = Math.round(parseFloat(topUpAmount) * 100);
    if (!amountCents || amountCents < 1000) {
      toast.error('Minimum top-up is $10.00');
      return;
    }
    setIntentLoading(true);
    try {
      const res = await api.post('/api/wallet/topup/intent', { amount_cents: amountCents });
      if (res?.client_secret) setClientSecret(res.client_secret);
    } catch (err: any) {
      toast.error(err?.error || 'Failed to create payment intent');
    }
    setIntentLoading(false);
  };

  // Step 3: After Stripe confirms payment, wait for webhook then refetch
  const handleSuccess = () => {
    setShowTopUp(false);
    setTopUpAmount('');
    setClientSecret('');
    // Stripe webhook typically arrives within 2-4s
    setTimeout(() => refetch(), 3000);
    setTimeout(() => refetch(), 7000);
  };

  // CSV export
  const handleDownloadStatement = () => {
    if (!transactions.length) { toast.error('No transactions to download.'); return; }
    const header = 'Date,Type,Description,Amount (USD),Balance After (USD)';
    const rows = transactions.map((tx) => {
      const date = new Date(tx.created_at).toLocaleDateString();
      const amt = (tx.amount_cents / 100).toFixed(2);
      const bal = (tx.balance_after_cents / 100).toFixed(2);
      return `"${date}","${tx.type}","${tx.description}","${amt}","${bal}"`;
    });
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: `wallet-statement-${new Date().toISOString().slice(0, 10)}.csv`,
    });
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success('Statement downloaded!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Wallet</h1>
        <p className="text-sm text-muted-foreground">Manage your balance and view transaction history.</p>
      </div>

      {/* Balance card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <div className="mt-1 flex items-baseline gap-3">
              {isLoading ? (
                <span className="text-3xl font-bold text-muted-foreground animate-pulse">Loading…</span>
              ) : (
                <>
                  <span className="text-4xl font-bold text-foreground">${balanceDollars}</span>
                  <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">USD</span>
                </>
              )}
            </div>
          </div>
          <Wallet className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="mt-5">
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => { setShowTopUp(true); setClientSecret(''); }}
          >
            Top Up
          </Button>
        </div>
      </div>

      {/* Transaction history */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="text-base font-semibold text-foreground">Transaction History</h2>
          <Button variant="outline" size="sm" onClick={handleDownloadStatement}>
            Download Statement
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-border">
                {['Date', 'Type', 'Description', 'Amount', 'Balance After'].map((h, i) => (
                  <th
                    key={h}
                    className={cn(
                      'px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground',
                      i >= 3 ? 'text-right' : 'text-left'
                    )}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="py-10 text-center text-sm text-muted-foreground">Loading…</td></tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Wallet className="h-8 w-8 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground mb-3">
                        Top up your wallet to start paying creators
                      </p>
                      <Button variant="outline" size="sm" onClick={() => { setShowTopUp(true); setClientSecret(''); }} className="gap-2">
                        <CreditCard className="h-4 w-4" /> Add Funds
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((tx: any) => {
                  const positive = tx.amount_cents > 0;
                  return (
                    <tr key={tx.id} className="border-t border-border hover:bg-muted/40 transition-colors">
                      <td className="whitespace-nowrap px-5 py-3 text-sm text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3">
                        <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', typeBadge[tx.type] ?? 'bg-muted text-foreground')}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-foreground">{tx.description}</td>
                      <td className={cn('whitespace-nowrap px-5 py-3 text-right text-sm font-medium', positive ? 'text-green-600' : 'text-destructive')}>
                        {positive ? '+' : '-'}${Math.abs(tx.amount_cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-right text-sm text-foreground">
                        ${(tx.balance_after_cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top-up dialog */}
      <Dialog open={showTopUp} onOpenChange={setShowTopUp}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md max-h-[90vh] overflow-y-auto">
          {!clientSecret ? (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-foreground">Add Funds</h2>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Amount (USD)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                  <Input
                    className="pl-7"
                    type="number"
                    min="10"
                    step="1"
                    placeholder="0.00"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Minimum top-up is $10.00</p>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-border p-3 bg-muted/30">
                <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-foreground">Credit / Debit Card via Stripe</span>
              </div>

              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleNext}
                disabled={!topUpAmount || intentLoading}
              >
                {intentLoading ? 'Creating payment…' : 'Next →'}
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-foreground">Complete Payment</h2>
              <p className="text-sm text-muted-foreground">Adding <span className="font-semibold text-foreground">${topUpAmount}</span> to your wallet.</p>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm amount={topUpAmount} onSuccess={handleSuccess} />
              </Elements>
              <button
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setClientSecret('')}
              >
                ← Change amount
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
