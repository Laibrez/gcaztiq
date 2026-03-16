import { useState } from 'react';
import {
  DollarSign,
  FileText,
  Upload,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
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
import { toast } from 'sonner';

const mockBulkData = [
  { row: 1, email: 'james@creator.co', amount: 170.89, currency: 'CAD' },
  { row: 2, email: 'lotts@creator.co', amount: 289.73, currency: 'GBP' },
  { row: 3, email: 'aaron@gmail.com', amount: 683.11, currency: 'USD' },
  { row: 4, email: 'tabby49@hotmail.com', amount: 89.1, currency: 'USD' },
  { row: 5, email: 'maria.g@outlook.com', amount: 425.0, currency: 'USD' },
];

const BULK_TOTAL = 1657.83;
const BULK_FEE = 82.89;
const BULK_CREATOR_RECEIVES = 1574.94;

export default function QuickPayPage() {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');

  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [note, setNote] = useState('');
  const [showSingleConfirm, setShowSingleConfirm] = useState(false);

  const [bulkStep, setBulkStep] = useState<1 | 2 | 3 | 4>(1);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  const parsedAmount = parseFloat(amount) || 0;
  const singleFee = parsedAmount * 0.05;
  const singleCreatorReceives = parsedAmount - singleFee;

  const handleSingleConfirm = () => {
    setShowSingleConfirm(false);
    setEmail('');
    setAmount('');
    setNote('');
    toast.success(
      'Payout sent! Creator will receive an email with their withdrawal link within 1 hour.'
    );
  };

  const handleBulkConfirm = () => {
    setShowBulkConfirm(false);
    setBulkStep(4);
  };

  const currencySymbol = (c: string) => {
    if (c === 'GBP') return '£';
    if (c === 'EUR') return '€';
    if (c === 'CAD') return 'C$';
    return '$';
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Quick Pay</h1>
        <p className="text-sm text-muted-foreground">
          Send direct payouts to creators by email. Funds settle in 3-5 business
          days.
        </p>
      </div>

      <div className="inline-flex rounded-lg border border-border bg-muted p-1">
        <button
          onClick={() => {
            setActiveTab('single');
            setBulkStep(1);
          }}
          className={cn(
            'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'single'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <DollarSign className="h-4 w-4" />
          Single Payout
        </button>
        <button
          onClick={() => setActiveTab('bulk')}
          className={cn(
            'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'bulk'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <FileText className="h-4 w-4" />
          Bulk Payouts
        </button>
      </div>

      {activeTab === 'single' && (
        <div className="space-y-5 rounded-xl border border-border bg-card p-6">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">
              Creator email
            </Label>
            <Input
              id="email"
              placeholder="creator@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="amount" className="text-sm font-medium">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="CAD">CAD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="note" className="text-sm font-medium">
              Note (optional)
            </Label>
            <Input
              id="note"
              placeholder="Payment for TikTok video #12"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setShowSingleConfirm(true)}
            disabled={!email || !amount}
          >
            Send Payout
          </Button>
        </div>
      )}

      {activeTab === 'bulk' && (
        <>
          {bulkStep === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">Bulk payouts</h2>
                <p className="text-sm text-muted-foreground">
                  Upload a CSV/TSV (.csv, .tsv, .txt) with columns: creatorEmail,
                  amount, currency (currency optional).
                </p>
              </div>
              <button
                onClick={() => setBulkStep(2)}
                className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-card p-12 transition-colors hover:border-primary/40"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  Drop your payout file here or click to select
                </p>
                <p className="text-xs text-muted-foreground">
                  We will validate emails, amounts, currency codes, and duplicates
                  before queuing.
                </p>
              </button>
              <p className="text-xs text-muted-foreground">
                Max one file at a time. Currency defaults to your preferred currency
                when omitted.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm">
                  Clear
                </Button>
                <Button variant="outline" size="sm" onClick={() => setBulkStep(2)}>
                  Preview file
                </Button>
              </div>
            </div>
          )}

          {bulkStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setBulkStep(1)}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to file selection
                </button>
                <span className="inline-flex items-center rounded-full border border-status-sent/30 bg-status-sent/10 px-2.5 py-0.5 text-xs font-medium text-status-sent">
                  Ready to queue
                </span>
              </div>

              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="w-12 px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                        #
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                        Creator email
                      </th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockBulkData.map((row) => (
                      <tr key={row.row} className="border-b border-border last:border-0">
                        <td className="px-4 py-2.5 text-sm text-muted-foreground">
                          {row.row + 1}
                        </td>
                        <td className="px-4 py-2.5 text-sm text-foreground">
                          {row.email}
                        </td>
                        <td className="px-4 py-2.5 text-right text-sm text-foreground">
                          {row.amount.toFixed(2)} {row.currency}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Total Recipients:{' '}
                  <span className="font-medium text-foreground">5</span>
                </span>
                <span className="text-muted-foreground">
                  Total Amount:{' '}
                  <span className="font-semibold text-foreground">
                    {BULK_TOTAL.toLocaleString()} USD
                  </span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-sm text-status-sent">
                  <CheckCircle2 className="h-4 w-4" />
                  Sufficient balance
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setBulkStep(1)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => setShowBulkConfirm(true)}
                  >
                    Approve & Queue
                  </Button>
                </div>
              </div>
            </div>
          )}

          {bulkStep === 4 && (
            <div className="space-y-6">
              <button
                onClick={() => setBulkStep(2)}
                className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-card p-8 transition-colors hover:border-primary/40"
              >
                <Upload className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drop your payout file here or click to select
                </p>
              </button>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      Previous bulk payouts
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Monitor payouts after you queue them. We refresh while anything
                      is processing.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full border border-status-sent/30 bg-status-sent/10 px-2 py-0.5 text-xs font-medium text-status-sent">
                      Live
                    </span>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <RefreshCw className="h-3.5 w-3.5" />
                      Refresh
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 rounded-xl border border-border bg-card p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        creator_payout_mar_2026 - Sheet1.csv
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Mar 13, 08:03 PM · 5 recipients
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Estimated debit: 1,657.83 USD
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-status-processing/10 px-2.5 py-0.5 text-xs font-medium text-status-processing">
                      Processing
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="h-2 overflow-hidden rounded-full">
                      <div className="flex gap-1">
                        <div
                          className="rounded-full bg-status-sent"
                          style={{ width: '40%' }}
                        />
                        <div
                          className="rounded-full bg-status-processing"
                          style={{ width: '20%' }}
                        />
                        <div
                          className="rounded-full bg-status-pending"
                          style={{ width: '40%' }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-status-sent" />2 sent
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-status-processing" />1
                        processing
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-status-pending" />2
                        pending
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={showSingleConfirm} onOpenChange={setShowSingleConfirm}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
              <DollarSign
                className="h-7 w-7 text-primary-foreground"
                style={{ color: 'hsl(72, 76%, 40%)' }}
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Confirm Payout</h2>
              <p className="text-sm text-muted-foreground">
                Please review the payment details below
              </p>
            </div>

            <div className="w-full space-y-2 rounded-lg border border-border p-4 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Recipient</span>
                <span className="font-medium text-foreground">{email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium text-foreground">
                  {currencySymbol(currency)}
                  {parsedAmount.toFixed(2)} {currency}
                </span>
              </div>
            </div>

            <div className="w-full space-y-2 rounded-lg bg-muted p-4 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Platform fee (creator pays)</span>
                <span className="text-foreground">
                  {currencySymbol(currency)}
                  {singleFee.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total charged to you</span>
                <span className="font-semibold text-foreground">
                  {currencySymbol(currency)}
                  {parsedAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Creator receives</span>
                <span className="text-foreground">
                  {currencySymbol(currency)}
                  {singleCreatorReceives.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex w-full gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowSingleConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleSingleConfirm}
              >
                Confirm Payout
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBulkConfirm} onOpenChange={setShowBulkConfirm}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
              <DollarSign className="h-7 w-7" style={{ color: 'hsl(72, 76%, 40%)' }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Confirm Payout</h2>
              <p className="text-sm text-muted-foreground">
                Please review the payment details below
              </p>
            </div>

            <div className="w-full space-y-2 rounded-lg border border-border p-4 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Recipients</span>
                <span className="font-medium text-foreground">5</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium text-foreground">
                  {BULK_TOTAL.toLocaleString()} USD
                </span>
              </div>
            </div>

            <div className="w-full space-y-2 rounded-lg bg-muted p-4 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Platform fee (creator pays)</span>
                <span className="text-foreground">{BULK_FEE} USD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total charged to you</span>
                <span className="font-semibold text-foreground">
                  {BULK_TOTAL.toLocaleString()} USD
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Creators receive</span>
                <span className="text-foreground">
                  {BULK_CREATOR_RECEIVES.toLocaleString()} USD
                </span>
              </div>
            </div>

            <div className="flex w-full gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowBulkConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleBulkConfirm}
              >
                Confirm Payout
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
