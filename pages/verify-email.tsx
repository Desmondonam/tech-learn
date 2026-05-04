import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

type Status = 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!router.isReady) return;
    const { token } = router.query;

    if (!token || typeof token !== 'string') {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email for the correct link.');
      return;
    }

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Network error. Please try again.');
      });
  }, [router.isReady, router.query]);

  return (
    <>
      <Head>
        <title>TechLearn — Verify Email</title>
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

        <div style={{ width: '100%', maxWidth: '420px', textAlign: 'center' }}>
          {/* Logo */}
          <div style={{ marginBottom: '36px' }}>
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
          </div>

          <div style={{
            background: '#161d2e',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '20px',
            padding: '40px 36px',
          }}>
            {status === 'loading' && (
              <>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, color: '#f0f6ff', marginBottom: '12px' }}>
                  Verifying your email...
                </h2>
                <p style={{ color: '#64748b', fontSize: '14px' }}>Please wait a moment.</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, color: '#34d399', marginBottom: '12px' }}>
                  Email Verified!
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '28px' }}>
                  {message}
                </p>
                <Link href="/" style={{
                  display: 'inline-block',
                  padding: '12px 32px',
                  background: 'linear-gradient(135deg, #0ea5e9, #a78bfa)',
                  borderRadius: '10px',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '15px',
                  textDecoration: 'none',
                }}>
                  Sign In →
                </Link>
              </>
            )}

            {status === 'error' && (
              <>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, color: '#f87171', marginBottom: '12px' }}>
                  Verification Failed
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '28px' }}>
                  {message}
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link href="/register" style={{
                    display: 'inline-block',
                    padding: '11px 24px',
                    background: 'linear-gradient(135deg, #0ea5e9, #a78bfa)',
                    borderRadius: '10px',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '14px',
                    textDecoration: 'none',
                  }}>
                    Register Again
                  </Link>
                  <Link href="/" style={{
                    display: 'inline-block',
                    padding: '11px 24px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    color: '#94a3b8',
                    fontWeight: 600,
                    fontSize: '14px',
                    textDecoration: 'none',
                  }}>
                    Go to Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
