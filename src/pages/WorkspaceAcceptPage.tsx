import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BASE = import.meta.env.VITE_API_URL || 'https://caztiq-api-production.up.railway.app';

type State = 'loading' | 'ready' | 'submitting' | 'done' | 'already' | 'error';

export default function WorkspaceAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<State>('loading');
  const [info, setInfo] = useState<{ creator_name: string; brand_name: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setState('error');
      setErrorMsg('No invite token found.');
      return;
    }
    fetch(`${BASE}/api/workspace/accept/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error === 'already_accepted') {
          setState('already');
        } else if (data.error) {
          setState('error');
          setErrorMsg(data.error);
        } else {
          setInfo(data);
          setState('ready');
        }
      })
      .catch(() => {
        setState('error');
        setErrorMsg('Could not load invitation. Please check your link.');
      });
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;
    setState('submitting');
    try {
      const res = await fetch(`${BASE}/api/workspace/accept/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setState('done');
      } else {
        setState('error');
        setErrorMsg(data.error || 'Something went wrong.');
      }
    } catch {
      setState('error');
      setErrorMsg('Network error — please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F4] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E8E6DF] p-10 text-center shadow-sm">
        {/* Logo mark */}
        <div className="w-10 h-10 bg-[#B6F542] rounded-lg mx-auto mb-6" />

        {state === 'loading' && (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-[#B6F542] mx-auto mb-4" />
            <p className="text-[#6B6B65]">Loading your invitation…</p>
          </>
        )}

        {state === 'ready' && info && (
          <>
            <h1 className="text-2xl font-bold text-[#1A1A18] mb-3">
              You're invited to collaborate
            </h1>
            <p className="text-[#6B6B65] mb-2">
              Hi <strong className="text-[#1A1A18]">{info.creator_name}</strong>,
            </p>
            <p className="text-[#6B6B65] mb-8">
              <strong className="text-[#1A1A18]">{info.brand_name}</strong> wants to work with
              you. Click below to accept their invitation and confirm your interest.
            </p>
            <Button
              className="w-full h-12 bg-[#B6F542] hover:bg-[#a3dc32] text-[#1A1A18] font-bold text-base rounded-xl"
              onClick={handleAccept}
            >
              Accept Invitation
            </Button>
            <p className="text-xs text-[#9B9B95] mt-4">
              No account required. Accepting just lets {info.brand_name} know you're interested.
            </p>
          </>
        )}

        {state === 'submitting' && (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-[#B6F542] mx-auto mb-4" />
            <p className="text-[#6B6B65]">Confirming your acceptance…</p>
          </>
        )}

        {state === 'done' && (
          <>
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#1A1A18] mb-3">You're confirmed! 🎉</h1>
            <p className="text-[#6B6B65]">
              The brand has been notified. They'll be in touch soon to discuss the collaboration.
            </p>
          </>
        )}

        {state === 'already' && (
          <>
            <CheckCircle2 className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#1A1A18] mb-3">Already accepted</h1>
            <p className="text-[#6B6B65]">You've already accepted this invitation. The brand has been notified.</p>
          </>
        )}

        {state === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#1A1A18] mb-3">Invalid link</h1>
            <p className="text-[#6B6B65]">{errorMsg || 'This invitation link is invalid or has expired.'}</p>
          </>
        )}

        <p className="text-xs text-[#9B9B95] mt-8 pt-6 border-t border-[#E8E6DF]">— Rollio</p>
      </div>
    </div>
  );
}
