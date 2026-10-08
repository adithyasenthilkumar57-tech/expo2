'use client';

import { useState } from 'react';
import { Zap, Mail, Lock, ArrowRight, AlertCircle, User } from 'lucide-react';

export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'signup'>('login');

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sign-up state
  const [suName, setSuName] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [suConfirm, setSuConfirm] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to sign in'); setLoading(false); return; }
      window.location.href = '/app';
    } catch {
      setError('Network connection error. Please try again.');
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (suPassword !== suConfirm) { setError('Passwords do not match.'); return; }
    if (suPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: suName, email: suEmail, password: suPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create account'); setLoading(false); return; }
      setSuccess('Account created! You can now sign in.');
      setSuName(''); setSuEmail(''); setSuPassword(''); setSuConfirm('');
      setTab('login');
      setLoading(false);
    } catch {
      setError('Network connection error. Please try again.');
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    height: 42,
    padding: '0 14px 0 38px',
    background: '#080d14',
    border: '1px solid #1e293b',
    borderRadius: 10,
    color: '#f8fafc',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 212, 200, 0.15), rgba(8, 13, 20, 1))',
      padding: 20,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 440,
        background: '#0d1424',
        border: '1px solid #1e293b',
        borderRadius: 20,
        padding: '36px 32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 212, 200, 0.05)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(0,212,200,0.2) 0%, rgba(124,58,237,0.2) 100%)',
            border: '1px solid rgba(0,212,200,0.3)', marginBottom: 16,
          }}>
            <Zap size={26} color="#00d4c8" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, color: '#f8fafc', margin: '0 0 6px' }}>
            OPS 3.0
          </h1>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
            {tab === 'login' ? 'Sign in to your autonomous operations workspace' : 'Create your account to get started'}
          </p>
        </div>

        {/* Tab Switch */}
        <div style={{ display: 'flex', background: '#080d14', borderRadius: 10, padding: 4, marginBottom: 24, border: '1px solid #1e293b' }}>
          {(['login', 'signup'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); setSuccess(''); }}
              style={{
                flex: 1, height: 34, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                transition: 'all 150ms ease',
                background: tab === t ? 'linear-gradient(135deg, #00d4c8 0%, #0284c7 100%)' : 'transparent',
                color: tab === t ? '#080d14' : '#64748b',
              }}>
              {t === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Error / Success */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 20,
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} /><span>{error}</span>
          </div>
        )}
        {success && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(0, 212, 200, 0.08)', border: '1px solid rgba(0, 212, 200, 0.3)',
            color: '#00d4c8', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 20,
          }}>
            <span>✅ {success}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {tab === 'login' && (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="name@company.com" style={inputStyle} />
                <Mail size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: 13 }} />
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" style={inputStyle} />
                <Lock size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: 13 }} />
              </div>
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: 'linear-gradient(135deg, #00d4c8 0%, #0284c7 100%)',
              color: '#080d14', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'opacity 150ms ease',
            }}>
              {loading ? 'Signing in…' : (<>Sign in to workspace <ArrowRight size={16} /></>)}
            </button>
          </form>
        )}

        {/* SIGN UP FORM */}
        {tab === 'signup' && (
          <form onSubmit={handleSignup}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>Full name</label>
              <div style={{ position: 'relative' }}>
                <input type="text" required value={suName} onChange={e => setSuName(e.target.value)}
                  placeholder="Your full name" style={inputStyle} />
                <User size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: 13 }} />
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <input type="email" required value={suEmail} onChange={e => setSuEmail(e.target.value)}
                  placeholder="name@company.com" style={inputStyle} />
                <Mail size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: 13 }} />
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type="password" required value={suPassword} onChange={e => setSuPassword(e.target.value)}
                  placeholder="Min. 8 characters" style={inputStyle} />
                <Lock size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: 13 }} />
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>Confirm password</label>
              <div style={{ position: 'relative' }}>
                <input type="password" required value={suConfirm} onChange={e => setSuConfirm(e.target.value)}
                  placeholder="Repeat your password" style={inputStyle} />
                <Lock size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: 13 }} />
              </div>
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: 'linear-gradient(135deg, #00d4c8 0%, #0284c7 100%)',
              color: '#080d14', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'opacity 150ms ease',
            }}>
              {loading ? 'Creating account…' : (<>Create account <ArrowRight size={16} /></>)}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
