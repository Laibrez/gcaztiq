import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/lib/api';

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
                // Supabase email confirmation required
                navigate('/login');
            }
        } catch (err: any) {
            setError(err?.error || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page" id="signup-page">
            <div className="auth-card">
                {/* Logo */}
                <div className="logo-row">
                    <img src="/rollio-logo.svg" alt="Rollio" />
                    <span>Rollio</span>
                </div>

                <h1 className="auth-heading">Create your account</h1>
                <p className="auth-sub">Start paying creators the right way</p>

                <form onSubmit={handleSignup}>
                    {error && <div className="auth-error">{error}</div>}

                    <div className="input-wrap">
                        <label htmlFor="signup-company">Company name</label>
                        <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 21h18" />
                            <path d="M5 21V7l8-4v18" />
                            <path d="M19 21V11l-6-4" />
                            <path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
                        </svg>
                        <input
                            id="signup-company"
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Acme Inc."
                        />
                    </div>

                    <div className="input-wrap">
                        <label htmlFor="signup-email">Email</label>
                        <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="4" width="20" height="16" rx="3" />
                            <polyline points="22,7 12,14 2,7" />
                        </svg>
                        <input
                            id="signup-email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
                        />
                    </div>

                    <div className="input-wrap">
                        <label htmlFor="signup-password">Password</label>
                        <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <input
                            id="signup-password"
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min. 6 characters"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="auth-btn"
                        id="signup-submit"
                    >
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                                </svg>
                                Creating account…
                            </span>
                        ) : 'Create account'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account?{' '}
                    <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
