import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Argentina','Armenia','Australia','Austria',
  'Bangladesh','Belgium','Bolivia','Brazil','Bulgaria','Cambodia','Cameroon',
  'Canada','Chile','China','Colombia','Costa Rica','Croatia','Czech Republic',
  'Denmark','Dominican Republic','Ecuador','Egypt','El Salvador','Estonia',
  'Ethiopia','Finland','France','Georgia','Germany','Ghana','Greece','Guatemala',
  'Honduras','Hong Kong','Hungary','Iceland','India','Indonesia','Iran','Iraq',
  'Ireland','Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya',
  'Kuwait','Latvia','Lebanon','Lithuania','Malaysia','Mexico','Morocco',
  'Netherlands','New Zealand','Nicaragua','Nigeria','Norway','Pakistan',
  'Panama','Paraguay','Peru','Philippines','Poland','Portugal','Qatar',
  'Romania','Russia','Saudi Arabia','Senegal','Serbia','Singapore',
  'Slovakia','Slovenia','South Africa','South Korea','Spain','Sri Lanka',
  'Sweden','Switzerland','Taiwan','Tanzania','Thailand','Trinidad and Tobago',
  'Tunisia','Turkey','UAE','Uganda','Ukraine','United Kingdom','Uruguay',
  'Uzbekistan','Venezuela','Vietnam','Zimbabwe',
];

const TAX_CLASSIFICATIONS = [
  'Individual/sole proprietor',
  'LLC (single-member)',
  'LLC (multi-member)',
  'S Corporation',
  'C Corporation',
  'Partnership',
  'Other',
];

type Step = 'loading' | 'error' | 'choose-type' | 'w9-form' | 'w8ben-form' | 'success';
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

  // W-9 fields
  const [legalName,       setLegalName]       = useState('');
  const [businessName,    setBusinessName]    = useState('');
  const [taxClass,        setTaxClass]        = useState('');
  const [street,          setStreet]          = useState('');
  const [city,            setCity]            = useState('');
  const [state,           setState_]          = useState('');
  const [zip,             setZip]             = useState('');
  const [ssn,             setSsn]             = useState('');

  // W-8BEN fields
  const [w8Country,       setW8Country]       = useState('');
  const [foreignTaxId,    setForeignTaxId]    = useState('');
  const [treatyClaim,     setTreatyClaim]     = useState('');

  // Shared
  const [signature,       setSignature]       = useState('');
  const [certified,       setCertified]       = useState(false);
  const [submitting,      setSubmitting]      = useState(false);
  const [fieldError,      setFieldError]      = useState('');

  useEffect(() => {
    fetch(`${API}/api/invite/${token}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) {
          setErrorType(data.error as ErrorType ?? 'unknown');
          setStep('error');
        } else {
          setInfo(data);
          setStep('choose-type');
        }
      })
      .catch(() => { setErrorType('unknown'); setStep('error'); });
  }, [token]);

  // ─── Submit W-9 ─────────────────────────────────────────────────
  const handleSubmitW9 = async () => {
    setFieldError('');
    if (!legalName || !street || !city || !state || !zip || !ssn || !signature || !certified) {
      setFieldError('Please fill in all required fields, sign, and check the certification box.');
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch(`${API}/api/invite/${token}/submit-w9`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_legal_name: legalName,
          business_name: businessName || undefined,
          tax_classification: taxClass || undefined,
          street_address: street,
          city,
          state,
          zip_code: zip,
          ssn,
          electronic_signature: signature,
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

  // ─── Submit W-8BEN ──────────────────────────────────────────────
  const handleSubmitW8BEN = async () => {
    setFieldError('');
    if (!legalName || !w8Country || !signature || !certified) {
      setFieldError('Please fill in all required fields, sign, and check the certification box.');
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch(`${API}/api/invite/${token}/submit-w8ben`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_legal_name: legalName,
          country: w8Country,
          foreign_tax_id: foreignTaxId || undefined,
          treaty_claim: treatyClaim || undefined,
          electronic_signature: signature,
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
    already_confirmed: { title: 'Already done!',   msg: 'You\'ve already completed your tax setup. You\'re all set to receive payments.' },
    unknown:           { title: 'Something went wrong', msg: 'Please try again or contact support.' },
  };

  const isW9Valid = legalName && street && city && state && zip && ssn && signature && certified;
  const isW8Valid = legalName && w8Country && signature && certified;

  return (
    <div className="min-h-screen bg-[#F9F8F4] flex items-center justify-center p-5">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B6F542]">
            <span className="text-lg font-black text-[#1A1A18]">R</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E8E6DF] bg-white p-8 shadow-sm">

          {/* Loading */}
          {step === 'loading' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#B6F542]" />
              <p className="text-sm text-[#6B6B65]">Loading your invitation…</p>
            </div>
          )}

          {/* Error */}
          {step === 'error' && (
            <div className="flex flex-col items-center gap-4 text-center py-4">
              {errorType === 'already_confirmed'
                ? <CheckCircle2 className="h-12 w-12 text-[#B6F542]" />
                : <XCircle className="h-12 w-12 text-red-400" />
              }
              <h2 className="text-xl font-bold text-[#1A1A18]">{errorMessages[errorType].title}</h2>
              <p className="text-sm text-[#6B6B65]">{errorMessages[errorType].msg}</p>
            </div>
          )}

          {/* Step 1: US or International choice */}
          {step === 'choose-type' && info && (
            <div className="space-y-6">
              <div>
                <p className="text-sm text-[#6B6B65]">Invitation from</p>
                <h2 className="text-xl font-bold text-[#1A1A18]">{info.brand_name}</h2>
              </div>
              <p className="text-sm text-[#6B6B65]">
                Hi <strong className="text-[#1A1A18]">{info.creator_name}</strong> 👋 — before you can receive payments,
                we need to collect your tax information. This takes about 2 minutes.
              </p>

              <div className="space-y-3">
                {/* US option */}
                <button
                  onClick={() => setStep('w9-form')}
                  className="w-full flex items-center gap-4 rounded-xl border-2 border-[#E8E6DF] p-4 text-left transition-colors hover:border-[#B6F542] hover:bg-[#B6F542]/5"
                >
                  <span className="text-2xl">🇺🇸</span>
                  <div>
                    <p className="font-semibold text-[#1A1A18]">I'm based in the US (W-9)</p>
                    <p className="text-xs text-[#6B6B65]">Fill out a W-9 — takes 2 minutes</p>
                  </div>
                </button>

                {/* International option */}
                <button
                  onClick={() => setStep('w8ben-form')}
                  className="w-full flex items-center gap-4 rounded-xl border-2 border-[#E8E6DF] p-4 text-left transition-colors hover:border-[#B6F542] hover:bg-[#B6F542]/5"
                >
                  <span className="text-2xl">🌍</span>
                  <div>
                    <p className="font-semibold text-[#1A1A18]">I'm outside the US (W-8BEN)</p>
                    <p className="text-xs text-[#6B6B65]">Fill out a W-8BEN — takes 2 minutes</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 2a: W-9 form */}
          {step === 'w9-form' && info && (
            <div className="space-y-5">
              <div>
                <button onClick={() => setStep('choose-type')} className="text-xs text-[#6B6B65] hover:text-[#1A1A18] mb-2">← Back</button>
                <h2 className="text-xl font-bold text-[#1A1A18]">Tax Information (W-9)</h2>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-[#6B6B65]">
                  <Shield className="h-3.5 w-3.5 text-[#B6F542] shrink-0" />
                  Your information is encrypted and secure.
                </div>
              </div>

              <div className="space-y-4">
                {/* Full Legal Name */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-[#1A1A18]">Full Legal Name <span className="text-red-400">*</span></Label>
                  <Input value={legalName} onChange={e => setLegalName(e.target.value)} placeholder="As it appears on tax documents" />
                </div>

                {/* Business Name */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-[#1A1A18]">Business Name</Label>
                  <Input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Leave blank if individual" />
                </div>

                {/* Tax Classification */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-[#1A1A18]">Federal Tax Classification <span className="text-red-400">*</span></Label>
                  <select
                    value={taxClass}
                    onChange={e => setTaxClass(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">Select…</option>
                    {TAX_CLASSIFICATIONS.map(tc => (
                      <option key={tc} value={tc}>{tc}</option>
                    ))}
                  </select>
                </div>

                {/* Street */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-[#1A1A18]">Street Address <span className="text-red-400">*</span></Label>
                  <Input value={street} onChange={e => setStreet(e.target.value)} placeholder="123 Main St" />
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-[#1A1A18]">City <span className="text-red-400">*</span></Label>
                  <Input value={city} onChange={e => setCity(e.target.value)} placeholder="City" />
                </div>

                {/* State + ZIP */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-[#1A1A18]">State <span className="text-red-400">*</span></Label>
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
                    <Label className="text-sm font-medium text-[#1A1A18]">ZIP Code <span className="text-red-400">*</span></Label>
                    <Input
                      value={zip}
                      onChange={e => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                      placeholder="12345"
                      maxLength={5}
                    />
                  </div>
                </div>

                {/* SSN / EIN */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-[#1A1A18]">SSN or EIN <span className="text-red-400">*</span></Label>
                  <Input
                    type="password"
                    value={ssn}
                    onChange={e => setSsn(e.target.value)}
                    placeholder="123-45-6789"
                    autoComplete="off"
                  />
                  <p className="text-xs text-[#9B9B95]">Your SSN is encrypted and never shared with the brand.</p>
                </div>

                {/* Electronic Signature */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-[#1A1A18]">Electronic Signature <span className="text-red-400">*</span></Label>
                  <Input
                    value={signature}
                    onChange={e => setSignature(e.target.value)}
                    placeholder="Type your full legal name to sign"
                    className="italic"
                  />
                </div>

                {/* Certification */}
                <label className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors',
                  certified ? 'border-[#B6F542] bg-[#B6F542]/5' : 'border-[#E8E6DF] hover:border-[#B6F542]/60'
                )}>
                  <input
                    type="checkbox"
                    checked={certified}
                    onChange={e => setCertified(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#1A1A18] shrink-0"
                  />
                  <span className="text-sm text-[#6B6B65] leading-relaxed">
                    I certify under penalty of perjury that the information I have provided is true, correct, and complete.
                  </span>
                </label>

                {/* Error message */}
                {fieldError && (
                  <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{fieldError}</p>
                )}
              </div>

              <Button
                className="w-full bg-[#B6F542] text-[#1A1A18] font-bold hover:bg-[#a8e83a] disabled:opacity-50"
                onClick={handleSubmitW9}
                disabled={!isW9Valid || submitting}
              >
                {submitting
                  ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Submitting…</>
                  : 'Submit W-9 →'
                }
              </Button>
            </div>
          )}

          {/* Step 2b: W-8BEN form */}
          {step === 'w8ben-form' && info && (
            <div className="space-y-5">
              <div>
                <button onClick={() => setStep('choose-type')} className="text-xs text-[#6B6B65] hover:text-[#1A1A18] mb-2">← Back</button>
                <h2 className="text-xl font-bold text-[#1A1A18]">Tax Information (W-8BEN)</h2>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-[#6B6B65]">
                  <Shield className="h-3.5 w-3.5 text-[#B6F542] shrink-0" />
                  Your information is encrypted and secure.
                </div>
              </div>

              <div className="space-y-4">
                {/* Full Legal Name */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-[#1A1A18]">Full Legal Name <span className="text-red-400">*</span></Label>
                  <Input value={legalName} onChange={e => setLegalName(e.target.value)} placeholder="As it appears on tax documents" />
                </div>

                {/* Country of Residence */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-[#1A1A18]">Country of Residence <span className="text-red-400">*</span></Label>
                  <select
                    value={w8Country}
                    onChange={e => setW8Country(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">Select country…</option>
                    {COUNTRIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Foreign Tax ID */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-[#1A1A18]">Foreign Tax ID</Label>
                  <Input value={foreignTaxId} onChange={e => setForeignTaxId(e.target.value)} placeholder="Optional" />
                  <p className="text-xs text-[#9B9B95]">Tax identification number from your country.</p>
                </div>

                {/* Treaty Claim */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-[#1A1A18]">Tax Treaty Claim</Label>
                  <Input value={treatyClaim} onChange={e => setTreatyClaim(e.target.value)} placeholder="e.g. Article 12, 0% rate" />
                  <p className="text-xs text-[#9B9B95]">If your country has a tax treaty with the US, specify the article and rate.</p>
                </div>

                {/* Electronic Signature */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-[#1A1A18]">Electronic Signature <span className="text-red-400">*</span></Label>
                  <Input
                    value={signature}
                    onChange={e => setSignature(e.target.value)}
                    placeholder="Type your full legal name to sign"
                    className="italic"
                  />
                </div>

                {/* Certification */}
                <label className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors',
                  certified ? 'border-[#B6F542] bg-[#B6F542]/5' : 'border-[#E8E6DF] hover:border-[#B6F542]/60'
                )}>
                  <input
                    type="checkbox"
                    checked={certified}
                    onChange={e => setCertified(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#1A1A18] shrink-0"
                  />
                  <span className="text-sm text-[#6B6B65] leading-relaxed">
                    I certify under penalty of perjury that I am the beneficial owner of the income to which this form relates and that the information provided is true, correct, and complete.
                  </span>
                </label>

                {/* Error message */}
                {fieldError && (
                  <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{fieldError}</p>
                )}
              </div>

              <Button
                className="w-full bg-[#B6F542] text-[#1A1A18] font-bold hover:bg-[#a8e83a] disabled:opacity-50"
                onClick={handleSubmitW8BEN}
                disabled={!isW8Valid || submitting}
              >
                {submitting
                  ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Submitting…</>
                  : 'Submit W-8BEN →'
                }
              </Button>
            </div>
          )}

          {/* Success */}
          {step === 'success' && info && (
            <div className="flex flex-col items-center gap-4 text-center py-4">
              <div className="h-20 w-20 rounded-full bg-[#B6F542] flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-[#1A1A18]" />
              </div>
              <h2 className="text-xl font-bold text-[#1A1A18]">You're all set!</h2>
              <p className="text-sm text-[#6B6B65]">
                Your tax information has been received. You'll receive an email each time{' '}
                <strong className="text-[#1A1A18]">{info.brand_name}</strong> sends you a payment.
              </p>
              <p className="text-xs text-[#9B9B95] mt-2">You can close this page.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
