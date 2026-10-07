'use client';

import { useState } from 'react';
import { Zap, Shield, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@ops3.com');
  const [password, setPassword] = useState('ops3admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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

      // Redirect to main workspace
      window.location.href = '/app';
    } catch {
      setError('Network connection error. Please try again.');
      setLoading(false);
    }
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
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 52,
            height: 52,
            borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(0,212,200,0.2) 0%, rgba(124,58,237,0.2) 100%)',
            border: '1px solid rgba(0,212,200,0.3)',
            marginBottom: 16,
          }}>
            <Zap size={26} color="#00d4c8" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, color: '#f8fafc', margin: '0 0 6px' }}>
            OPS 3.0
          </h1>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
            Sign in to your autonomous operations workspace
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            borderRadius: 10,
            padding: '10px 14px',
            fontSize: 13,
            marginBottom: 20,
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
              Email address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com"
                style={{
                  width: '100%',
                  height: 42,
                  padding: '0 14px 0 38px',
                  background: '#080d14',
                  border: '1px solid #1e293b',
                  borderRadius: 10,
                  color: '#f8fafc',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <Mail size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: 13 }} />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  height: 42,
                  padding: '0 14px 0 38px',
                  background: '#080d14',
                  border: '1px solid #1e293b',
                  borderRadius: 10,
                  color: '#f8fafc',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <Lock size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: 13 }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              background: 'linear-gradient(135deg, #00d4c8 0%, #0284c7 100%)',
              color: '#080d14',
              border: 'none',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 150ms ease',
            }}
          >
            {loading ? 'Authenticating…' : (
              <>
                Sign in to workspace <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Credentials helper */}
        <div style={{
          marginTop: 24,
          padding: 12,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid #1e293b',
          borderRadius: 10,
          fontSize: 12,
          color: '#64748b',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>
            <Shield size={13} color="#00d4c8" /> Default Administrator Access
          </div>
          <div>Email: <strong style={{ color: '#cbd5e1' }}>admin@ops3.com</strong></div>
          <div>Password: <strong style={{ color: '#cbd5e1' }}>ops3admin123</strong></div>
        </div>
      </div>
    </div>
  );
}
