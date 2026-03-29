import { useState, useRef } from 'react';
import { DollarSign, FileText, Upload, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useSinglePayout } from '@/hooks/usePayouts';
import { useWallet } from '@/hooks/useWallet';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

export default function QuickPayPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');

  // Single payout state
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [note, setNote] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  // Bulk payout state
  const [file, setFile] = useState<File | null>(null);
  const [validating, setValidating] = useState(false);
  const [bulkResult, setBulkResult] = useState<any>(null);
  const [bulkConfirming, setBulkConfirming] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: walletData, isLoading: walletLoading } = useWallet();
  const sendPayout = useSinglePayout();

  const parsedAmount = parseFloat(amount) || 0;
  const amountCents = Math.round(parsedAmount * 100);
  const feeCents = Math.round(amountCents * 0.05);
  const creatorReceivesCents = amountCents - feeCents;
  const balanceCents = walletData?.balance_cents ?? 0;
  const hasBalance = !walletLoading && balanceCents >= amountCents && amountCents > 0;

  const currencySymbol = (c: string) => {
    if (c === 'GBP') return '£';
    if (c === 'EUR') return '€';
    if (c === 'CAD') return 'C$';
    return '$';
  };

  const handleConfirmSingle = async () => {
    try {
      await sendPayout.mutateAsync({ creator_email: email, amount_cents: amountCents, currency, note });
      setShowConfirm(false);
      setEmail(''); setAmount(''); setNote('');
      toast.success('Payout sent! Creator will receive their payment shortly.');
    } catch (err: any) {
      setShowConfirm(false);
      toast.error(err?.error || 'Failed to send payout');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setValidating(true);
    setBulkResult(null);

    console.log('[DEBUG] Validating CSV file:', f.name, f.size, 'bytes');
    const formData = new FormData();
    formData.append('file', f);

    try {
      console.log('[DEBUG] Sending fetch request to bulk validate...');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://caztiq-api-production.up.railway.app'}/api/payouts/bulk/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('gb_token')}`
        },
        body: formData
      });
      
      const res = await response.json();
      if (!response.ok) throw res;
      setBulkResult(res);
    } catch (err: any) {
      toast.error(err?.error || 'Failed to validate CSV');
      setFile(null);
    } finally {
      setValidating(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmBulk = async () => {
    setBulkConfirming(true);
    try {
      const res = await api.post('/api/payouts/bulk/confirm', { rows: bulkResult.rows });
      toast.success(`Sent ${res.created} payouts successfully!`);
      setFile(null);
      setBulkResult(null);
      setTimeout(() => navigate('/payouts'), 1500);
    } catch (err: any) {
      toast.error(err?.error || 'Failed to confirm bulk payouts');
    } finally {
      setBulkConfirming(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Quick Pay</h1>
        <p className="text-sm text-muted-foreground">Send direct payouts to creators by email.</p>
      </div>

      {/* Tab switcher */}
      <div className="inline-flex rounded-lg border border-border bg-muted p-1">
        {(['single', 'bulk'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors capitalize',
              activeTab === tab ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab === 'single' ? <DollarSign className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
            {tab === 'single' ? 'Single Payout' : 'CSV Bulk Payouts'}
          </button>
        ))}
      </div>

      {activeTab === 'single' && (
        <div className="space-y-5 rounded-xl border border-border bg-card p-6">
          {/* Balance indicator */}
          <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
            <span className="text-sm text-muted-foreground">Wallet balance</span>
            {walletLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Loading…</span>
              </div>
            ) : (
              <span className="text-sm font-semibold text-foreground">
                ${(balanceCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
              </span>
            )}
          </div>
          {balanceCents === 0 && !walletLoading && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              Your wallet is empty.{' '}
              <Link to="/wallet" className="font-semibold underline">Add funds</Link> to send payouts.
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">Creator email <span className="text-destructive">*</span></Label>
            <Input id="email" placeholder="creator@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="amount" className="text-sm font-medium">Amount <span className="text-destructive">*</span></Label>
              <Input id="amount" type="number" min="1" step="0.01" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Currency</Label>
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
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note" className="text-sm font-medium">Note (optional)</Label>
            <Input id="note" placeholder="Payment for TikTok video #12" value={note} onChange={e => setNote(e.target.value)} />
          </div>

          {amountCents > 0 && (
            <div className="space-y-1.5 rounded-lg bg-muted p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform fee (5%)</span>
                <span className="text-foreground">{currencySymbol(currency)}{(feeCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Creator receives</span>
                <span className="font-medium text-foreground">{currencySymbol(currency)}{(creatorReceivesCents / 100).toFixed(2)}</span>
              </div>
              {!hasBalance && amountCents > 0 && (
                <p className="text-xs text-destructive mt-1">Insufficient balance for this payout.</p>
              )}
            </div>
          )}

          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setShowConfirm(true)}
            disabled={!email || !amount || !hasBalance}
          >
            Review & Send
          </Button>
        </div>
      )}

      {activeTab === 'bulk' && !bulkResult && (
        <div className="rounded-xl border border-border bg-card p-8 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            {validating ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : <Upload className="h-6 w-6 text-muted-foreground" />}
          </div>
          <div>
            <p className="text-base font-medium text-foreground">{validating ? 'Validating CSV…' : 'Upload Bulk Payout CSV'}</p>
            <p className="text-sm text-muted-foreground mt-1 text-center">
              Requires 3 columns: <code className="bg-muted px-1 py-0.5 rounded text-xs">creatorEmail</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs">amount</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs">currency</code>
            </p>
          </div>
          <div>
            <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} disabled={validating} />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={validating}>
              {validating ? 'Validating…' : 'Select CSV File'}
            </Button>
            {file && <p className="text-xs text-muted-foreground mt-2">{file.name}</p>}
          </div>
        </div>
      )}

      {activeTab === 'bulk' && bulkResult && (
        <div className="space-y-5 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Bulk Preview</h3>
            <Button variant="ghost" size="sm" onClick={() => { setBulkResult(null); setFile(null); }}>
              Cancel
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-muted p-4 space-y-1">
              <p className="text-sm text-muted-foreground">Valid Payouts</p>
              <p className="text-2xl font-semibold text-foreground">{bulkResult.summary.valid_count}</p>
            </div>
            <div className="rounded-lg bg-muted p-4 space-y-1">
              <p className="text-sm text-muted-foreground">Errors</p>
              <p className={cn("text-2xl font-semibold", bulkResult.summary.error_count > 0 ? "text-destructive" : "text-foreground")}>
                {bulkResult.summary.error_count}
              </p>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-border p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total payout volume</span>
              <span className="font-medium">${(bulkResult.summary.creator_receives_cents / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Platform fees</span>
              <span className="font-medium">${(bulkResult.summary.total_fee_cents / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold border-t border-border pt-2 mt-2">
              <span>Total cost</span>
              <span>${(bulkResult.summary.total_cents / 100).toFixed(2)}</span>
            </div>
          </div>

           <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
              <span className="text-sm text-muted-foreground">Wallet balance</span>
              <span className={cn("text-sm font-semibold", bulkResult.summary.sufficient_balance ? "text-foreground" : "text-destructive")}>
                ${(bulkResult.summary.wallet_balance_cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
           </div>

          {bulkResult.summary.error_count > 0 && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive flex gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Some rows have errors</p>
                <p className="text-xs opacity-90 mt-1">Only valid rows will be processed. Please fix and re-upload if you want to send all.</p>
              </div>
            </div>
          )}

          {!bulkResult.summary.sufficient_balance && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
               Insufficient wallet balance to cover this bulk payout. <Link to="/wallet" className="font-semibold underline">Add funds</Link>.
            </div>
          )}

          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleConfirmBulk}
            disabled={!bulkResult.summary.sufficient_balance || bulkResult.summary.valid_count === 0 || bulkConfirming}
          >
            {bulkConfirming ? 'Processing…' : `Confirm & Send ${bulkResult.summary.valid_count} Payouts`}
          </Button>
        </div>
      )}

      {/* Confirm standard dialog (single) */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
              <DollarSign className="h-7 w-7" style={{ color: 'hsl(72, 76%, 40%)' }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Confirm Payout</h2>
              <p className="text-sm text-muted-foreground">Review before sending</p>
            </div>

            <div className="w-full space-y-2 rounded-lg border border-border p-4 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Recipient</span>
                <span className="font-medium text-foreground">{email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium text-foreground">{currencySymbol(currency)}{parsedAmount.toFixed(2)} {currency}</span>
              </div>
              {note && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Note</span>
                  <span className="text-foreground max-w-[200px] text-right">{note}</span>
                </div>
              )}
            </div>

            <div className="w-full space-y-2 rounded-lg bg-muted p-4 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Platform fee (5%)</span>
                <span className="text-foreground">{currencySymbol(currency)}{(feeCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Creator receives</span>
                <span className="font-semibold text-foreground">{currencySymbol(currency)}{(creatorReceivesCents / 100).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex w-full gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)} disabled={sendPayout.isPending}>
                Cancel
              </Button>
              <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleConfirmSingle} disabled={sendPayout.isPending}>
                {sendPayout.isPending ? 'Sending…' : 'Confirm & Send'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
