import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RollioAnimatedLogo } from '@/components/RollioLogo';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const API = import.meta.env.VITE_API_URL || 'https://caztiq-api-production.up.railway.app';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
  'DC',
];

type PayoutInfo = {
  amount: number;
  currency: string;
  brand_name: string;
  note?: string;
  requires_tax_form: boolean;
};

type Step = 'loading' | 'error' | 'amount' | 'us-confirm' | 'tax' | 'payment' | 'success';
type ErrorType = 'already_claimed' | 'cancelled' | 'expired' | 'invalid';

const PAYMENT_METHODS = [
  { id: 'paypal',  label: 'PayPal',        field: 'paypal_email',   placeholder: 'you@paypal.com' },
  { id: 'venmo',   label: 'Venmo',         field: 'venmo_handle',   placeholder: '@yourhandle' },
  { id: 'wise',    label: 'Wise',          field: 'wise_email',     placeholder: 'you@wise.com' },
  { id: 'bank',    label: 'Bank Transfer', field: 'account_number', placeholder: 'Account number' },
];

export default function ClaimPage() {
  const { token } = useParams<{ token: string }>();
  const [step, setStep]           = useState<Step>('loading');
  const [errorType, setErrorType] = useState<ErrorType>('invalid');
  const [payout, setPayout]       = useState<PayoutInfo | null>(null);

  const [legalName,  setLegalName]  = useState('');
  const [street,     setStreet]     = useState('');
  const [city,       setCity]       = useState('');
  const [state,      setState]      = useState('');
  const [zip,        setZip]        = useState('');
  const [taxId,      setTaxId]      = useState('');
  const [certified,  setCertified]  = useState(false);
  const [taxLoading, setTaxLoading] = useState(false);

  const [selectedMethod, setSelectedMethod] = useState('');
  const [paymentValue,   setPaymentValue]   = useState('');
  const [submitting,     setSubmitting]     = useState(false);

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
    if (!legalName || !street || !city || !state || !zip || !certified) return;
    setTaxLoading(true);
    const r = await fetch(`${API}/api/claim/${token}/tax-form`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ legal_name: legalName, tax_id: taxId, street, city, state, zip, certified }),
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
    already_claimed: { title: 'Already claimed',  msg: 'This payment has already been claimed.' },
    cancelled:       { title: 'Payment cancelled', msg: 'This payment was cancelled by the sender.' },
    expired:         { title: 'Link expired',      msg: 'This claim link has expired. Contact the brand for a new one.' },
    invalid:         { title: 'Invalid link',      msg: 'This link is invalid or no longer active.' },
  };

  const w9Valid = legalName.trim() && street.trim() && city.trim() && state && zip.trim() && certified;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2.5 animate-fade-up">
          <RollioAnimatedLogo size={44} float />
          <span className="text-xl font-semibold tracking-tight text-foreground">Rollio</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">

          {/* Loading */}
          {step === 'loading' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading payment…</p>
            </div>
          )}

          {/* Error */}
          {step === 'error' && (
            <div className="flex flex-col items-center gap-4 text-center py-4">
              <XCircle className="h-12 w-12 text-destructive" />
              <h2 className="text-xl font-bold text-foreground">{errorMessages[errorType].title}</h2>
              <p className="text-sm text-muted-foreground">{errorMessages[errorType].msg}</p>
            </div>
          )}

          {/* Step 1: View amount */}
          {step === 'amount' && payout && (
            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground">Payment from</p>
                <h2 className="text-xl font-bold text-foreground">{payout.brand_name}</h2>
              </div>
              <div className="rounded-xl bg-muted/50 py-6 text-center">
                <p className="text-4xl font-black text-foreground">{amountDisplay}</p>
                <p className="mt-1 text-sm text-muted-foreground">{payout.currency}</p>
              </div>
              {payout.note && (
                <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Note:</span> {payout.note}</p>
              )}
              <Button
                className="w-full bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                onClick={() => payout.requires_tax_form ? setStep('us-confirm') : setStep('payment')}
              >
                Continue to claim →
              </Button>
              <p className="text-center text-xs text-muted-foreground/70">No account required. Choose your preferred payment method.</p>
            </div>
          )}

          {/* Step 2a: US confirmation */}
          {step === 'us-confirm' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Before we continue</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  We need to collect your tax information to comply with IRS requirements.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground leading-relaxed">
                Payments to US-based creators may be reported to the IRS. We collect your W-9 information to stay compliant — the same fields you'd fill out on a paper form.
              </div>
              <Button
                className="w-full bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                onClick={() => setStep('tax')}
              >
                Yes, I'm US-based →
              </Button>
              <p className="text-center text-xs text-muted-foreground/70">
                For MVP, only US-based creators are supported at this time.
              </p>
            </div>
          )}

          {/* Step 2b: W-9 form */}
          {step === 'tax' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-foreground">Tax Information (W-9)</h2>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  We need this to comply with IRS requirements. Your information is encrypted and secure.
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-foreground">Full Legal Name</Label>
                  <Input value={legalName} onChange={e => setLegalName(e.target.value)} placeholder="As it appears on tax documents" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-foreground">Street Address</Label>
                  <Input value={street} onChange={e => setStreet(e.target.value)} placeholder="123 Main St" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-foreground">City</Label>
                  <Input value={city} onChange={e => setCity(e.target.value)} placeholder="City" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-foreground">State</Label>
                    <select
                      value={state}
                      onChange={e => setState(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="">Select…</option>
                      {US_STATES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-foreground">ZIP Code</Label>
                    <Input
                      value={zip}
                      onChange={e => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                      placeholder="12345"
                      maxLength={5}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-foreground">SSN or EIN</Label>
                  <Input
                    type="password"
                    value={taxId}
                    onChange={e => setTaxId(e.target.value)}
                    placeholder="•••-••-____"
                    autoComplete="off"
                  />
                  <p className="text-xs text-muted-foreground/70">Optional but required for payments over $600/year.</p>
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 hover:border-primary/60 transition-colors">
                  <input
                    type="checkbox"
                    checked={certified}
                    onChange={e => setCertified(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                  />
                  <span className="text-sm text-muted-foreground leading-relaxed">
                    I certify under penalty of perjury that the information I have provided is correct and complete.
                  </span>
                </label>
              </div>

              <Button
                className="w-full bg-primary text-primary-foreground font-bold hover:bg-primary/90 disabled:opacity-50"
                onClick={handleTaxSubmit}
                disabled={!w9Valid || taxLoading}
              >
                {taxLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit →'}
              </Button>
            </div>
          )}

          {/* Step 3: Payment method */}
          {step === 'payment' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-foreground">How do you want to receive {amountDisplay}?</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedMethod(m.id); setPaymentValue(''); }}
                    className={cn(
                      'rounded-xl border-2 p-4 text-left transition-colors',
                      selectedMethod === m.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    )}
                  >
                    <p className="text-sm font-semibold text-foreground">{m.label}</p>
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
                className="w-full bg-primary text-primary-foreground font-bold hover:bg-primary/90"
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
              <CheckCircle2 className="h-16 w-16 text-status-paid" />
              <h2 className="text-xl font-bold text-foreground">You're all set! ✓</h2>
              <p className="text-sm text-muted-foreground">
                Your tax information has been received. You'll get an email notification
                each time {payout?.brand_name || 'the brand'} sends you a payment.
              </p>
              <p className="text-xs text-muted-foreground/70 mt-2">You can close this page.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
