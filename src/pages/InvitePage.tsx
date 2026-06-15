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
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
];

type Step = 'loading' | 'error' | 'us-confirm' | 'w9-form' | 'success';
type ErrorType = 'invalid_token' | 'already_confirmed' | 'unknown';

type InviteInfo = {
  creator_name: string;
  brand_name: string;
};

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();

  const [step, setStep]             = useState<Step>('loading');
  const [errorType, setErrorType]   = useState<ErrorType>('unknown');
  const [info, setInfo]             = useState<InviteInfo | null>(null);

  const [legalName,  setLegalName]  = useState('');
  const [street,     setStreet]     = useState('');
  const [city,       setCity]       = useState('');
  const [state,      setState_]     = useState('');
  const [zip,        setZip]        = useState('');
  const [ssn,        setSsn]        = useState('');
  const [certified,  setCertified]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState('');

  useEffect(() => {
    fetch(`${API}/api/invite/${token}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) {
          setErrorType(data.error as ErrorType ?? 'unknown');
          setStep('error');
        } else {
          setInfo(data);
          setStep('us-confirm');
        }
      })
      .catch(() => { setErrorType('unknown'); setStep('error'); });
  }, [token]);

  const handleSubmit = async () => {
    setFieldError('');
    if (!legalName || !street || !city || !state || !zip || !ssn || !certified) {
      setFieldError('Please fill in all fields and check the certification box.');
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch(`${API}/api/invite/${token}/submit-w9`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_legal_name: legalName,
          street_address: street,
          city,
          state,
          zip_code: zip,
          ssn,
          certification_accepted: certified,
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        setFieldError(data.error || 'Something went wrong. Please try again.');
        return;
      }
      setStep('success');
    } catch {
      setFieldError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const errorMessages: Record<ErrorType, { title: string; msg: string }> = {
    invalid_token:     { title: 'Invalid link',    msg: 'This invitation link is invalid or has expired. Contact the brand for a new one.' },
    already_confirmed: { title: 'Already done!',   msg: "You've already completed your tax setup. You're all set to receive payments." },
    unknown:           { title: 'Something went wrong', msg: 'Please try again or contact support.' },
  };

  const isValid = legalName && street && city && state && zip && ssn && certified;

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
              <p className="text-sm text-muted-foreground">Loading your invitation…</p>
            </div>
          )}

          {/* Error */}
          {step === 'error' && (
            <div className="flex flex-col items-center gap-4 text-center py-4">
              {errorType === 'already_confirmed'
                ? <CheckCircle2 className="h-12 w-12 text-status-paid" />
                : <XCircle className="h-12 w-12 text-destructive" />
              }
              <h2 className="text-xl font-bold text-foreground">{errorMessages[errorType].title}</h2>
              <p className="text-sm text-muted-foreground">{errorMessages[errorType].msg}</p>
            </div>
          )}

          {/* Step 1: US or International choice */}
          {step === 'us-confirm' && info && (
            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground">Invitation from</p>
                <h2 className="text-xl font-bold text-foreground">{info.brand_name}</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Hi <strong className="text-foreground">{info.creator_name}</strong> 👋 — before you can receive payments,
                we need to collect your tax information. Are you US-based or international?
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => setStep('w9-form')}
                  className="w-full flex items-center gap-4 rounded-xl border-2 border-border p-4 text-left transition-colors hover:border-primary hover:bg-primary/5"
                >
                  <span className="text-2xl">🇺🇸</span>
                  <div>
                    <p className="font-semibold text-foreground">US-based</p>
                    <p className="text-xs text-muted-foreground">Fill out a W-9 — takes 2 minutes</p>
                  </div>
                </button>

                <div className="w-full flex items-center gap-4 rounded-xl border-2 border-border p-4 text-left opacity-60 cursor-not-allowed">
                  <span className="text-2xl">🌍</span>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">International</p>
                    <p className="text-xs text-muted-foreground">W-8BEN — not available yet</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-muted border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    Coming soon
                  </span>
                </div>
              </div>

              <p className="text-center text-xs text-muted-foreground/70">
                International support is coming soon. Email <a href="mailto:support@rollio.com" className="underline">support@rollio.com</a> if you need help.
              </p>
            </div>
          )}

          {/* Step 2: W-9 form */}
          {step === 'w9-form' && info && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-foreground">Tax Information (W-9)</h2>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Shield className="h-3.5 w-3.5 text-primary shrink-0" />
                  Your information is encrypted and secure.
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
                      onChange={e => setState_(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
                    value={ssn}
                    onChange={e => setSsn(e.target.value)}
                    placeholder="•••-••-____"
                    autoComplete="off"
                  />
                  <p className="text-xs text-muted-foreground/70">Required for payments over $600/year. Encrypted at rest.</p>
                </div>

                <label className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors',
                  certified ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/60'
                )}>
                  <input
                    type="checkbox"
                    checked={certified}
                    onChange={e => setCertified(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-primary shrink-0"
                  />
                  <span className="text-sm text-muted-foreground leading-relaxed">
                    I certify under penalty of perjury that the information I have provided is correct and complete.
                  </span>
                </label>

                {fieldError && (
                  <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{fieldError}</p>
                )}
              </div>

              <Button
                className="w-full bg-primary text-primary-foreground font-bold hover:bg-primary/90 disabled:opacity-50"
                onClick={handleSubmit}
                disabled={!isValid || submitting}
              >
                {submitting
                  ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Submitting…</>
                  : 'Submit'
                }
              </Button>
            </div>
          )}

          {/* Success */}
          {step === 'success' && info && (
            <div className="flex flex-col items-center gap-4 text-center py-4">
              <CheckCircle2 className="h-16 w-16 text-status-paid" />
              <h2 className="text-xl font-bold text-foreground">You're all set! ✓</h2>
              <p className="text-sm text-muted-foreground">
                Your tax information has been received. You'll get an email notification
                each time <strong className="text-foreground">{info.brand_name}</strong> sends you a payment.
              </p>
              <p className="text-xs text-muted-foreground/70 mt-2">You can close this page.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
