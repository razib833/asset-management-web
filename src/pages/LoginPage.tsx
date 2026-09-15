import { FormEvent, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LockKeyhole, Mail } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { Button } from '../components/common/Button';
import type { ApiError } from '../types';

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(''); setSubmitting(true);
    try { await login(email, password); const target = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname; navigate(target ?? '/dashboard', { replace: true }); }
    catch (reason) { setError((reason as ApiError)?.message ?? (reason as Error)?.message ?? 'Sign in failed.'); }
    finally { setSubmitting(false); }
  };
  return <main className="login-page"><section className="login-hero"><div className="login-hero__content"><img className="login-bank-logo" src="/brand/jamuna-bank-white.png" alt="Jamuna Bank PLC"/><h1>Central Procurement Requisition Portal</h1><p>A secure workspace for transparent, traceable procurement—from requisition to delivery.</p><div className="login-feature"><LockKeyhole size={18} /> Role-based access and auditable workflow</div></div></section><section className="login-panel"><form className="login-card" onSubmit={submit}><img className="login-panel-logo" src="/brand/purple-long.png" alt="Jamuna Bank PLC"/><p className="eyebrow">Welcome back</p><h2>Sign in to continue</h2><p>Use your configured employee account.</p>{error && <div className="alert" role="alert">{error}</div>}<label>Email address<div className="input-wrap"><Mail size={18} /><input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="username" placeholder="name@jamunabank.com" /></div></label><label>Password<div className="input-wrap"><LockKeyhole size={18} /><input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" placeholder="Enter your password" /></div></label><Button type="submit" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in'}</Button><small>Access is restricted to authorized Jamuna Bank personnel.</small></form></section></main>;
}
