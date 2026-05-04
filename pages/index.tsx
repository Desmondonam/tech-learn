import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useApp } from '../lib/AppContext';
import Head from 'next/head';
import Link from 'next/link';

export default function LoginPage() {
  const { login, currentUser, sessionLoaded } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionLoaded && currentUser) router.replace('/dashboard');
  }, [sessionLoaded, currentUser, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(email, password);
    if (result.ok) {
      router.push('/dashboard');
    } else {
      setError(result.error || 'Login failed. Please try again.');
    }
    setLoading(false);
  };

  const quickLogin = (e: string) => {
    setEmail(e);
    setPassword('demo');
  };

  return (
    <>
      <Head>
        <title>TechLearn — Login</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0e1a',
        position: 'relative',
        overflow: 'hidden',
        padding: '20px',
      }}>
        {/* Background orbs */}
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ width: '100%', maxWidth: '420px', animation: 'fadeIn 0.5s ease' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '64px', height: '64px', borderRadius: '18px',
              background: 'linear-gradient(135deg, #0ea5e9, #a78bfa)',
              marginBottom: '16px', fontSize: '28px',
              boxShadow: '0 0 40px rgba(56,189,248,0.3)',
            }}>
              🚀
            </div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '32px', fontWeight: 800, color: '#f0f6ff', marginBottom: '6px' }}>
              TechLearn
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Your gateway to tech mastery</p>
          </div>

          {/* Card */}
          <div style={{
            background: '#161d2e',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '20px',
            padding: '36px',
          }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px', color: '#f0f6ff' }}>
              Welcome back
            </h2>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '28px' }}>Sign in to continue your learning journey</p>

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</label>
                <input
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="field-input"
                  required
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="field-input"
                  required
                />
              </div>

              {error && (
                <div style={{
                  background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
                  borderRadius: '10px', padding: '10px 14px', marginBottom: '16px',
                  fontSize: '13px', color: '#f87171',
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', marginBottom: '20px', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? <><span className="spinner" /> Signing in...</> : 'Sign In →'}
              </button>
            </form>

            {/* Register link */}
            <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
              Don&apos;t have an account?{' '}
              <Link href="/register" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>
                Create one
              </Link>
            </p>

            {/* Quick access */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
              <p style={{ fontSize: '11px', color: '#475569', textAlign: 'center', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Quick Demo Access</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { label: '👨‍🎓 Student — Alex Johnson', email: 'alex@student.com', color: '#38bdf8' },
                  { label: '👩‍🎓 Student — Maria Chen', email: 'maria@student.com', color: '#34d399' },
                  { label: '👩‍🏫 Tutor / Admin', email: 'admin@techlearn.com', color: '#a78bfa' },
                ].map(d => (
                  <button
                    key={d.email}
                    onClick={() => quickLogin(d.email)}
                    style={{
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: '9px', padding: '10px 14px', color: '#94a3b8',
                      cursor: 'pointer', fontSize: '13px', textAlign: 'left',
                      transition: 'all 0.15s',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = d.color; (e.target as HTMLElement).style.color = d.color; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.target as HTMLElement).style.color = '#94a3b8'; }}
                  >
                    <span>{d.label}</span>
                    <span style={{ fontSize: '11px', opacity: 0.5 }}>click to fill</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
