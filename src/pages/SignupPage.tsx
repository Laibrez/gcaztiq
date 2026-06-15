import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { RollioAnimatedLogo } from '@/components/RollioLogo';

export default function SignupPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await api.post('/api/auth/signup', { email, password, company_name: companyName }, false);
            if (data.session?.access_token) {
                localStorage.setItem('gc_token', data.session.access_token);
                navigate('/');
            } else {
                navigate('/login');
            }
        } catch (err: any) {
            setError(err?.error || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm space-y-6">

                {/* Logo */}
                <div className="flex items-center gap-2.5 animate-fade-up">
                    <RollioAnimatedLogo size={42} float />
                    <span className="text-xl font-semibold tracking-tight text-foreground">Rollio</span>
                </div>

                <div className="space-y-1 animate-fade-up delay-150">
                    <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
                    <p className="text-sm text-muted-foreground">Start paying creators the right way</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-1.5 animate-fade-up delay-200">
                        <label className="text-sm font-medium text-foreground">Company name</label>
                        <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Acme Inc."
                            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div className="space-y-1.5 animate-fade-up delay-250">
                        <label className="text-sm font-medium text-foreground">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
                            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div className="space-y-1.5 animate-fade-up delay-300">
                        <label className="text-sm font-medium text-foreground">Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min. 6 characters"
                            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {error && <p className="text-sm text-destructive animate-fade-in">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 animate-fade-up delay-350"
                    >
                        {loading ? 'Creating account…' : 'Create account'}
                    </button>
                </form>

                <p className="text-center text-sm text-muted-foreground animate-fade-up delay-400">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-primary hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
