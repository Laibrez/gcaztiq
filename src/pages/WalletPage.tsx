import { useState } from 'react';
import { Wallet, CreditCard, Building2, ArrowRightLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';

const transactions = [
  {
    date: 'Mar 13, 2026',
    type: 'Payout',
    description: 'Bulk payout — 5 creators',
    amount: -1657.83,
    balanceAfter: 17143.35,
  },
  {
    date: 'Mar 12, 2026',
    type: 'Payout',
    description: 'Single payout — @maria.g',
    amount: -425.0,
    balanceAfter: 18801.18,
  },
  {
    date: 'Mar 10, 2026',
    type: 'Top Up',
    description: 'Credit card ending 4242',
    amount: 5000.0,
    balanceAfter: 19226.18,
  },
  {
    date: 'Mar 8, 2026',
    type: 'Payout',
    description: 'Bulk payout — 8 creators',
    amount: -3240.0,
    balanceAfter: 14226.18,
  },
  {
    date: 'Mar 5, 2026',
    type: 'Payout',
    description: 'Single payout — @oliver.h',
    amount: -420.0,
    balanceAfter: 17466.18,
  },
  {
    date: 'Mar 3, 2026',
    type: 'Refund',
    description: 'Cancelled payout — @jake.fits',
    amount: 150.0,
    balanceAfter: 17886.18,
  },
  {
    date: 'Mar 1, 2026',
    type: 'Top Up',
    description: 'Bank transfer',
    amount: 10000.0,
    balanceAfter: 17736.18,
  },
  {
    date: 'Feb 28, 2026',
    type: 'Payout',
    description: 'Bulk payout — 12 creators',
    amount: -5890.0,
    balanceAfter: 7736.18,
  },
  {
    date: 'Feb 25, 2026',
    type: 'Payout',
    description: 'Single payout — @claire.d',
    amount: -3500.0,
    balanceAfter: 13626.18,
  },
  {
    date: 'Feb 20, 2026',
    type: 'Top Up',
    description: 'Wire transfer',
    amount: 15000.0,
    balanceAfter: 17126.18,
  },
];

const typeBadge: Record<string, string> = {
  'Top Up': 'bg-status-sent/10 text-status-sent',
  Payout: 'bg-status-processing/10 text-status-processing',
  Refund: 'bg-status-pending/10 text-status-pending',
};

const paymentMethods = [
  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
  { id: 'bank', label: 'Bank Transfer', icon: Building2 },
  { id: 'wire', label: 'Wire Transfer', icon: ArrowRightLeft },
] as const;

export default function WalletPage() {
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('card');

  const handleAddFunds = () => {
    setShowTopUp(false);
    setTopUpAmount('');
    toast.success('Funds added! Your balance has been updated.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Wallet</h1>
        <p className="text-sm text-muted-foreground">
          Manage your balance and view transaction history.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="text-4xl font-bold text-foreground">$17,143.35</span>
              <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                USD
              </span>
            </div>
          </div>
          <Wallet className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="mt-5 flex gap-3">
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setShowTopUp(true)}
          >
            Top Up
          </Button>
          <Button variant="outline">Withdraw</Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="text-base font-semibold text-foreground">
            Transaction History
          </h2>
          <Button variant="outline" size="sm">
            Download Statement
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-border">
                <th className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Date
                </th>
                <th className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Type
                </th>
                <th className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Description
                </th>
                <th className="px-5 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Amount
                </th>
                <th className="px-5 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Balance After
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, i) => (
                <tr
                  key={i}
                  className="border-t border-border transition-colors hover:bg-muted/50"
                >
                  <td className="whitespace-nowrap px-5 py-3 text-sm text-muted-foreground">
                    {tx.date}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                        typeBadge[tx.type]
                      )}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-foreground">
                    {tx.description}
                  </td>
                  <td
                    className={cn(
                      'whitespace-nowrap px-5 py-3 text-right text-sm font-medium',
                      tx.amount > 0 ? 'text-status-sent' : 'text-destructive'
                    )}
                  >
                    {tx.amount > 0 ? '+' : '-'}$
                    {Math.abs(tx.amount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right text-sm text-foreground">
                    $
                    {tx.balanceAfter.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={showTopUp} onOpenChange={setShowTopUp}>
        <DialogContent className="sm:max-w-md">
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-foreground">Add Funds</h2>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  className="pl-7"
                  type="number"
                  placeholder="0.00"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Payment method</Label>
              <div className="grid grid-cols-3 gap-2">
                {paymentMethods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-colors',
                      paymentMethod === m.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground/30'
                    )}
                  >
                    <m.icon className="h-5 w-5 text-foreground" />
                    <span className="text-xs font-medium leading-tight text-foreground">
                      {m.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod === 'card' && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Card number</Label>
                  <Input placeholder="4242 4242 4242 4242" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Expiry</Label>
                    <Input placeholder="MM/YY" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">CVC</Label>
                    <Input placeholder="123" />
                  </div>
                </div>
              </div>
            )}

            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleAddFunds}
              disabled={!topUpAmount}
            >
              Add Funds
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
