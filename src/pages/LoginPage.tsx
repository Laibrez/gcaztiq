import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/lib/api';

export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await api.post('/api/auth/login', { email, password }, false);
            localStorage.setItem('gc_token', data.session.access_token);
            navigate('/');
        } catch (err: any) {
            setError(err?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page" id="login-page">
            <div className="auth-card">
                {/* Logo */}
                <div className="logo-row">
                    <img src="/rollio-logo.svg" alt="Rollio" />
                    <span>Rollio</span>
                </div>

                <h1 className="auth-heading">Welcome back</h1>
                <p className="auth-sub">Sign in to manage your creator payments</p>

                <form onSubmit={handleLogin}>
                    {error && <div className="auth-error">{error}</div>}

                    <div className="input-wrap">
                        <label htmlFor="login-email">Email</label>
                        <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="4" width="20" height="16" rx="3" />
                            <polyline points="22,7 12,14 2,7" />
                        </svg>
                        <input
                            id="login-email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
                        />
                    </div>

                    <div className="input-wrap">
                        <label htmlFor="login-password">Password</label>
                        <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <input
                            id="login-password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <a href="#" className="forgot-link">Forgot password?</a>

                    <button
                        type="submit"
                        disabled={loading}
                        className="auth-btn"
                        id="login-submit"
                    >
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                                </svg>
                                Signing in…
                            </span>
                        ) : 'Sign in'}
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account?{' '}
                    <Link to="/signup">Sign up</Link>
                </div>
            </div>
        </div>
    );
}
