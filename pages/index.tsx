import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useApp } from '../lib/AppContext';
import Head from 'next/head';
import Link from 'next/link';

const LOGIN_OPTIONS = [
  {
    role: 'Student',
    icon: '👨‍🎓',
    email: 'student@techlearn.com',
    password: 'Student@2026',
    color: '#38bdf8',
    description: 'Access courses, assignments & challenges',
  },
  {
    role: 'Admin',
    icon: '👩‍🏫',
    email: 'desmondonam@gmail.com',
    password: 'DesmondLMS@2026',
    color: '#a78bfa',
    description: 'Manage students, grades & sessions',
  },
];

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

  const fillCredentials = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
    setError('');
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: '#94a3b8',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
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
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="field-input"
                  required
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Password</label>
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
                  background: 'rgba(248,113,113,0.08)',
                  border: '1px solid rgba(248,113,113,0.2)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  fontSize: '13px',
                  color: '#f87171',
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
            <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
              Don&apos;t have an account?{' '}
              <Link href="/register" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>
                Create one
              </Link>
            </p>

            {/* Login role options */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
              <p style={{ fontSize: '11px', color: '#475569', textAlign: 'center', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                Sign in as
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                {LOGIN_OPTIONS.map(opt => (
                  <button
                    key={opt.role}
                    onClick={() => fillCredentials(opt.email, opt.password)}
                    style={{
                      flex: 1,
                      background: email === opt.email ? `${opt.color}12` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${email === opt.email ? opt.color : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: '12px',
                      padding: '14px 10px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.18s',
                    }}
                    onMouseEnter={e => {
                      if (email !== opt.email) {
                        (e.currentTarget as HTMLElement).style.borderColor = opt.color;
                        (e.currentTarget as HTMLElement).style.background = `${opt.color}0a`;
                      }
                    }}
                    onMouseLeave={e => {
                      if (email !== opt.email) {
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                      }
                    }}
                  >
                    <div style={{ fontSize: '22px', marginBottom: '6px' }}>{opt.icon}</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: email === opt.email ? opt.color : '#e2e8f0', marginBottom: '3px' }}>
                      {opt.role}
                    </div>
                    <div style={{ fontSize: '10px', color: '#475569', lineHeight: 1.4 }}>{opt.description}</div>
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
