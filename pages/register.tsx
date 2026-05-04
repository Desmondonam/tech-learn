import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed.');
      } else {
        setSuccess(data.message);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    background: '#0d1525',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: '#f0f6ff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
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
        <title>TechLearn — Create Account</title>
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
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ width: '100%', maxWidth: '440px' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
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
            <p style={{ color: '#64748b', fontSize: '14px' }}>Start your learning journey today</p>
          </div>

          {/* Card */}
          <div style={{
            background: '#161d2e',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '20px',
            padding: '36px',
          }}>
            {success ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✉️</div>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, color: '#34d399', marginBottom: '12px' }}>
                  Check your inbox!
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
                  {success}
                </p>
                <p style={{ color: '#475569', fontSize: '13px', marginBottom: '20px' }}>
                  Didn't receive it? Check your spam folder or{' '}
                  <button
                    onClick={() => { setSuccess(''); setForm({ name: '', email: '', password: '', confirm: '' }); }}
                    style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '13px', padding: 0 }}
                  >
                    try again
                  </button>.
                </p>
                <Link href="/" style={{
                  display: 'inline-block',
                  padding: '11px 28px',
                  background: 'linear-gradient(135deg, #0ea5e9, #a78bfa)',
                  borderRadius: '10px',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '14px',
                  textDecoration: 'none',
                }}>
                  Go to Login →
                </Link>
              </div>
            ) : (
              <>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px', color: '#f0f6ff' }}>
                  Create your account
                </h2>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '28px' }}>
                  Join TechLearn and start mastering tech skills
                </p>

                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Full Name</label>
                    <input
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      style={inputStyle}
                      className="field-input"
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Email</label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      style={inputStyle}
                      className="field-input"
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Password</label>
                    <input
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
                      style={inputStyle}
                      className="field-input"
                      required
                      minLength={8}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={labelStyle}>Confirm Password</label>
                    <input
                      name="confirm"
                      type="password"
                      value={form.confirm}
                      onChange={handleChange}
                      placeholder="Repeat your password"
                      style={inputStyle}
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
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: loading ? 'rgba(14,165,233,0.4)' : 'linear-gradient(135deg, #0ea5e9, #a78bfa)',
                      border: 'none',
                      borderRadius: '10px',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '15px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      marginBottom: '20px',
                      transition: 'opacity 0.2s',
                    }}
                  >
                    {loading ? 'Creating account...' : 'Create Account →'}
                  </button>
                </form>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px', textAlign: 'center' }}>
                  <p style={{ color: '#64748b', fontSize: '13px' }}>
                    Already have an account?{' '}
                    <Link href="/" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>
                      Sign in
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
