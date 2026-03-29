import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const API = import.meta.env.VITE_API_URL || 'https://caztiq-api-production.up.railway.app';

type PayoutInfo = {
  amount: number;
  currency: string;
  brand_name: string;
  note?: string;
  requires_tax_form: boolean;
};

type Step = 'loading' | 'error' | 'amount' | 'tax' | 'payment' | 'success';
type ErrorType = 'already_claimed' | 'cancelled' | 'expired' | 'invalid';

const PAYMENT_METHODS = [
  { id: 'paypal', label: 'PayPal', field: 'paypal_email', placeholder: 'you@paypal.com' },
  { id: 'venmo', label: 'Venmo', field: 'venmo_handle', placeholder: '@yourhandle' },
  { id: 'wise', label: 'Wise', field: 'wise_email', placeholder: 'you@wise.com' },
  { id: 'bank', label: 'Bank Transfer', field: 'account_number', placeholder: 'Account number' },
];

export default function ClaimPage() {
  const { token } = useParams<{ token: string }>();
  const [step, setStep] = useState<Step>('loading');
  const [errorType, setErrorType] = useState<ErrorType>('invalid');
  const [payout, setPayout] = useState<PayoutInfo | null>(null);

  // Tax form
  const [taxType, setTaxType] = useState<'w9' | 'w8ben' | null>(null);
  const [legalName, setLegalName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
  const [taxLoading, setTaxLoading] = useState(false);

  // Payment method
  const [selectedMethod, setSelectedMethod] = useState('');
  const [paymentValue, setPaymentValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/claim/${token}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) {
          setErrorType(data.error as ErrorType);
          setStep('error');
        } else {
          setPayout(data);
          setStep('amount');
        }
      })
      .catch(() => { setErrorType('invalid'); setStep('error'); });
  }, [token]);

  const handleTaxSubmit = async () => {
    if (!legalName) return;
    setTaxLoading(true);
    const r = await fetch(`${API}/api/claim/${token}/tax-form`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ form_type: taxType, legal_name: legalName, tax_id: taxId, address, country }),
    });
    setTaxLoading(false);
    if (r.ok) setStep('payment');
  };

  const handleClaim = async () => {
    if (!selectedMethod || !paymentValue) return;
    setSubmitting(true);
    const method = PAYMENT_METHODS.find(m => m.id === selectedMethod)!;
    const r = await fetch(`${API}/api/claim/${token}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payment_method: selectedMethod,
        payment_details: { [method.field]: paymentValue },
      }),
    });
    setSubmitting(false);
    if (r.ok) setStep('success');
  };

  const amountDisplay = payout
    ? `$${payout.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    : '';

  const errorMessages: Record<ErrorType, { title: string; msg: string }> = {
    already_claimed: { title: 'Already claimed', msg: 'This payment has already been claimed.' },
    cancelled: { title: 'Payment cancelled', msg: 'This payment was cancelled by the sender.' },
    expired: { title: 'Link expired', msg: 'This claim link has expired. Contact the brand for a new one.' },
    invalid: { title: 'Invalid link', msg: 'This link is invalid or no longer active.' },
  };

  return (
    <div className="min-h-screen bg-[#F9F8F4] flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B6F542]">
            <span className="text-lg font-black text-[#1A1A18]">C</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E8E6DF] bg-white p-8 shadow-sm">

          {/* Loading */}
          {step === 'loading' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#B6F542]" />
              <p className="text-sm text-[#6B6B65]">Loading payment…</p>
            </div>
          )}

          {/* Error */}
          {step === 'error' && (
            <div className="flex flex-col items-center gap-4 text-center py-4">
              <XCircle className="h-12 w-12 text-red-400" />
              <h2 className="text-xl font-bold text-[#1A1A18]">{errorMessages[errorType].title}</h2>
              <p className="text-sm text-[#6B6B65]">{errorMessages[errorType].msg}</p>
            </div>
          )}

          {/* Step 1: View amount */}
          {step === 'amount' && payout && (
            <div className="space-y-6">
              <div>
                <p className="text-sm text-[#6B6B65]">Payment from</p>
                <h2 className="text-xl font-bold text-[#1A1A18]">{payout.brand_name}</h2>
              </div>
              <div className="rounded-xl bg-[#F9F8F4] py-6 text-center">
                <p className="text-4xl font-black text-[#1A1A18]">{amountDisplay}</p>
                <p className="mt-1 text-sm text-[#6B6B65]">{payout.currency}</p>
              </div>
              {payout.note && (
                <p className="text-sm text-[#6B6B65]"><span className="font-medium text-[#1A1A18]">Note:</span> {payout.note}</p>
              )}
              <Button
                className="w-full bg-[#B6F542] text-[#1A1A18] font-bold hover:bg-[#a8e83a]"
                onClick={() => payout.requires_tax_form ? setStep('tax') : setStep('payment')}
              >
                Continue to claim →
              </Button>
              <p className="text-center text-xs text-[#9B9B95]">No account required. Choose your preferred payment method.</p>
            </div>
          )}

          {/* Step 2: Tax form */}
          {step === 'tax' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-[#1A1A18]">Tax information</h2>
                <p className="text-sm text-[#6B6B65]">Required for payments over $600/year.</p>
              </div>
              <div className="flex gap-2">
                {(['w9', 'w8ben'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTaxType(t)}
                    className={cn(
                      'flex-1 rounded-lg border-2 py-3 text-sm font-semibold transition-colors',
                      taxType === t ? 'border-[#B6F542] bg-[#B6F542]/10 text-[#1A1A18]' : 'border-[#E8E6DF] text-[#6B6B65]'
                    )}
                  >
                    {t === 'w9' ? '🇺🇸 US-based (W-9)' : '🌍 Outside US (W-8BEN)'}
                  </button>
                ))}
              </div>
              {taxType && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Legal name *</Label>
                    <Input value={legalName} onChange={e => setLegalName(e.target.value)} placeholder="Full legal name" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{taxType === 'w9' ? 'SSN / EIN' : 'Tax ID / Passport'}</Label>
                    <Input value={taxId} onChange={e => setTaxId(e.target.value)} placeholder="Optional" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Address</Label>
                    <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Street address" />
                  </div>
                  {taxType === 'w8ben' && (
                    <div className="space-y-1.5">
                      <Label>Country</Label>
                      <Input value={country} onChange={e => setCountry(e.target.value)} placeholder="e.g. Mexico" />
                    </div>
                  )}
                  <Button
                    className="w-full bg-[#B6F542] text-[#1A1A18] font-bold hover:bg-[#a8e83a]"
                    onClick={handleTaxSubmit}
                    disabled={!legalName || taxLoading}
                  >
                    {taxLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save & Continue →'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Payment method */}
          {step === 'payment' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-[#1A1A18]">How do you want to receive {amountDisplay}?</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedMethod(m.id); setPaymentValue(''); }}
                    className={cn(
                      'rounded-xl border-2 p-4 text-left transition-colors',
                      selectedMethod === m.id ? 'border-[#B6F542] bg-[#B6F542]/10' : 'border-[#E8E6DF] hover:border-[#B6F542]/50'
                    )}
                  >
                    <p className="text-sm font-semibold text-[#1A1A18]">{m.label}</p>
                  </button>
                ))}
              </div>
              {selectedMethod && (
                <div className="space-y-1.5">
                  <Label>{PAYMENT_METHODS.find(m => m.id === selectedMethod)?.label} {selectedMethod === 'venmo' ? 'handle' : 'email / details'}</Label>
                  <Input
                    value={paymentValue}
                    onChange={e => setPaymentValue(e.target.value)}
                    placeholder={PAYMENT_METHODS.find(m => m.id === selectedMethod)?.placeholder}
                  />
                </div>
              )}
              <Button
                className="w-full bg-[#B6F542] text-[#1A1A18] font-bold hover:bg-[#a8e83a]"
                onClick={handleClaim}
                disabled={!selectedMethod || !paymentValue || submitting}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Claim Payment →'}
              </Button>
            </div>
          )}

          {/* Success */}
          {step === 'success' && (
            <div className="flex flex-col items-center gap-4 text-center py-4">
              <CheckCircle2 className="h-16 w-16 text-[#B6F542]" />
              <h2 className="text-xl font-bold text-[#1A1A18]">Payment on the way! 🎉</h2>
              <p className="text-sm text-[#6B6B65]">
                You'll receive your funds within 1–2 business days to your chosen account.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
