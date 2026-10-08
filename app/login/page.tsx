'use client';

import { useState } from 'react';
import { Zap, Mail, Lock, ArrowRight, AlertCircle, User, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'signup'>('login');

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sign-up state
  const [suName, setSuName] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPassword, setSuPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInstantAccess = async () => {
    setError(''); setSuccess('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isGuest: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to enter workspace');
        setLoading(false);
        return;
      }
      window.location.href = '/app';
    } catch {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

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
      if (!res.ok) {
        setError(data.error || 'Failed to sign in');
        setLoading(false);
        return;
      }
      window.location.href = '/app';
    } catch {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: suName, email: suEmail, password: suPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create account');
        setLoading(false);
        return;
      }
      // Auto-logs in upon registration
      window.location.href = '/app';
    } catch {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  // 16px font-size prevents iOS auto-zoom blowout on mobile!
  const inputStyle = {
    width: '100%',
    height: 46,
    padding: '0 14px 0 42px',
    background: '#080d14',
    border: '1px solid #1e293b',
    borderRadius: 12,
    color: '#f8fafc',
    fontSize: 16, // 16px is critical for mobile Safari / Chrome
    outline: 'none',
    boxSizing: 'border-box' as const,
    WebkitAppearance: 'none' as const,
  };

  return (
    <div style={{
      minHeight: '100dvh',
      width: '100%',
      maxWidth: '100vw',
      overflowX: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(0, 212, 200, 0.16), rgba(8, 13, 20, 1))',
      padding: '24px 16px',
      boxSizing: 'border-box',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: '#0d1424',
        border: '1px solid #1e293b',
        borderRadius: 20,
        padding: '30px 24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 212, 200, 0.05)',
        boxSizing: 'border-box',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 50, height: 50, borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(0,212,200,0.2) 0%, rgba(59,130,246,0.2) 100%)',
            border: '1px solid rgba(0,212,200,0.3)', marginBottom: 12,
          }}>
            <Zap size={24} color="#00d4c8" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, color: '#f8fafc', margin: '0 0 4px' }}>
            OPS 3.0 Platform
          </h1>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
            Autonomous operations workspace
          </p>
        </div>

        {/* ⚡ One-Click Instant Access Button */}
        <button
          type="button"
          onClick={handleInstantAccess}
          disabled={loading}
          style={{
            width: '100%',
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            background: 'linear-gradient(135deg, #00d4c8 0%, #0284c7 100%)',
            color: '#080d14',
            border: 'none',
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 800,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 20px rgba(0, 212, 200, 0.25)',
            marginBottom: 20,
            boxSizing: 'border-box',
          }}
        >
          <Sparkles size={18} />
          {loading ? 'Entering workspace…' : 'Enter Workspace Instantly'}
          <ArrowRight size={16} />
        </button>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 20,
          color: '#64748b',
          fontSize: 12,
        }}>
          <div style={{ flex: 1, height: 1, background: '#1e293b' }} />
          <span>or sign in with your email</span>
          <div style={{ flex: 1, height: 1, background: '#1e293b' }} />
        </div>

        {/* Tab Switch */}
        <div style={{ display: 'flex', background: '#080d14', borderRadius: 10, padding: 4, marginBottom: 20, border: '1px solid #1e293b' }}>
          {(['login', 'signup'] as const).map(t => (
            <button key={t} type="button" onClick={() => { setTab(t); setError(''); setSuccess(''); }}
              style={{
                flex: 1, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                transition: 'all 150ms ease',
                background: tab === t ? '#1e293b' : 'transparent',
                color: tab === t ? '#00d4c8' : '#94a3b8',
              }}>
              {t === 'login' ? 'Sign In (Any Email)' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Error / Success */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 18,
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} /><span>{error}</span>
          </div>
        )}
        {success && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(0, 212, 200, 0.08)', border: '1px solid rgba(0, 212, 200, 0.3)',
            color: '#00d4c8', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 18,
          }}>
            <span>✅ {success}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {tab === 'login' && (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
                Email address (anyone can sign in)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your.email@company.com"
                  style={inputStyle}
                  autoCapitalize="none"
                  autoCorrect="off"
                />
                <Mail size={18} color="#64748b" style={{ position: 'absolute', left: 14, top: 14 }} />
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1' }}>Password (optional)</label>
                <span style={{ fontSize: 11, color: '#64748b' }}>Any password works</span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={inputStyle}
                />
                <Lock size={18} color="#64748b" style={{ position: 'absolute', left: 14, top: 14 }} />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: 46,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #334155',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 150ms ease',
              }}
            >
              {loading ? 'Signing in…' : (<>Continue with Email <ArrowRight size={16} /></>)}
            </button>
          </form>
        )}

        {/* SIGN UP FORM */}
        {tab === 'signup' && (
          <form onSubmit={handleSignup}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>Your name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  value={suName}
                  onChange={e => setSuName(e.target.value)}
                  placeholder="Full name"
                  style={inputStyle}
                />
                <User size={18} color="#64748b" style={{ position: 'absolute', left: 14, top: 14 }} />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  value={suEmail}
                  onChange={e => setSuEmail(e.target.value)}
                  placeholder="your.email@company.com"
                  style={inputStyle}
                  autoCapitalize="none"
                  autoCorrect="off"
                />
                <Mail size={18} color="#64748b" style={{ position: 'absolute', left: 14, top: 14 }} />
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  value={suPassword}
                  onChange={e => setSuPassword(e.target.value)}
                  placeholder="Choose a password"
                  style={inputStyle}
                />
                <Lock size={18} color="#64748b" style={{ position: 'absolute', left: 14, top: 14 }} />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: 46,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: 'linear-gradient(135deg, #00d4c8 0%, #0284c7 100%)',
                color: '#080d14',
                border: 'none',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Creating account…' : (<>Create & Enter Workspace <ArrowRight size={16} /></>)}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
