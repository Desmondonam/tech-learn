import React, { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useApp } from '../lib/AppContext';
import Head from 'next/head';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  roles: ('student' | 'admin')[];
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',    label: 'Dashboard',    icon: '🏠', roles: ['student', 'admin'] },
  { href: '/courses',      label: 'My Courses',   icon: '📚', roles: ['student', 'admin'] },
  { href: '/assignments',  label: 'Assignments',  icon: '📝', roles: ['student', 'admin'] },
  { href: '/challenges',   label: 'Code Challenges', icon: '⚡', roles: ['student', 'admin'] },
  { href: '/playground',   label: 'Code Playground', icon: '💻', roles: ['student', 'admin'] },
  { href: '/messages',     label: 'Messages',     icon: '💬', roles: ['student', 'admin'] },
  { href: '/webinars',     label: 'Schedule',     icon: '📅', roles: ['student', 'admin'] },
  { href: '/resources',    label: 'Resources',    icon: '📁', roles: ['student', 'admin'] },
  { href: '/feedback',     label: 'Feedback',     icon: '⭐', roles: ['student', 'admin'] },
  { href: '/admin',        label: 'Admin Panel',  icon: '⚙️', roles: ['admin'] },
];

export default function Layout({ children, title }: { children: ReactNode; title?: string }) {
  const { currentUser, logout, notifications } = useApp();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      router.replace('/');
    }
  }, [currentUser, router]);

  if (!currentUser) return null;

  const unreadCount = notifications.filter(n => !n.read).length;
  const navItems = NAV_ITEMS.filter(item => item.roles.includes(currentUser.role));

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #0ea5e9, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px',
          }}>🚀</div>
          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '18px', color: '#f0f6ff' }}>TechLearn</div>
            <div style={{ fontSize: '11px', color: '#475569', fontWeight: 500 }}>{currentUser.role === 'admin' ? 'Admin Portal' : 'Student Portal'}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '0 12px', flex: 1 }}>
        {navItems.map(item => {
          const isActive = router.pathname === item.href || router.pathname.startsWith(item.href + '/');
          return (
            <Link href={item.href} key={item.href} style={{ textDecoration: 'none' }}>
              <div
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                style={{ marginBottom: '2px' }}
                onClick={() => setSidebarOpen(false)}
              >
                <span style={{ fontSize: '18px', width: '22px', textAlign: 'center' }}>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && (
                  <span style={{
                    marginLeft: 'auto', background: '#0ea5e9', color: 'white',
                    borderRadius: '100px', padding: '1px 7px', fontSize: '11px', fontWeight: 700,
                  }}>{item.badge}</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User card */}
      <div style={{ padding: '12px', margin: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '12px',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #0ea5e9, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: 'white',
            flexShrink: 0,
          }}>
            {currentUser.name.charAt(0)}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.name}</div>
            <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.email}</div>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '16px', padding: '4px', flexShrink: 0 }}
          >
            ↪
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Head>
        <title>{title ? `${title} — TechLearn` : 'TechLearn LMS'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0e1a' }}>
        {/* Desktop Sidebar */}
        <aside style={{
          width: '240px', flexShrink: 0,
          background: '#0f1623',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexDirection: 'column',
          position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
        }} className="hidden-mobile">
          <SidebarContent />
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <>
            <div
              onClick={() => setSidebarOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 40 }}
            />
            <aside style={{
              position: 'fixed', top: 0, left: 0, bottom: 0, width: '260px',
              background: '#0f1623', borderRight: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', flexDirection: 'column', zIndex: 50,
              overflowY: 'auto', animation: 'slideIn 0.2s ease',
            }}>
              <SidebarContent />
            </aside>
          </>
        )}

        {/* Main content */}
        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Top bar */}
          <header style={{
            height: '60px', background: 'rgba(15,22,35,0.95)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', padding: '0 24px',
            gap: '12px', position: 'sticky', top: 0, zIndex: 30,
            backdropFilter: 'blur(12px)',
          }}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="show-mobile"
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '20px', padding: '4px' }}
            >
              ☰
            </button>
            <div style={{ flex: 1, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px', color: '#f0f6ff' }}>
              {title || 'Dashboard'}
            </div>

            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '10px', width: '38px', height: '38px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', position: 'relative', color: '#94a3b8',
                }}
              >
                🔔
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-4px', right: '-4px',
                    background: '#f87171', color: 'white', borderRadius: '50%',
                    width: '16px', height: '16px', fontSize: '10px', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{unreadCount}</span>
                )}
              </button>

              {notifOpen && (
                <NotificationPanel notifications={notifications} onClose={() => setNotifOpen(false)} />
              )}
            </div>

            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #0ea5e9, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: 'white',
              cursor: 'pointer', flexShrink: 0,
            }}>
              {currentUser.name.charAt(0)}
            </div>
          </header>

          <div style={{ flex: 1, overflow: 'auto', animation: 'fadeIn 0.3s ease' }}>
            {children}
          </div>
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </>
  );
}

function NotificationPanel({ notifications, onClose }: { notifications: any[]; onClose: () => void }) {
  const { markNotificationRead } = useApp();
  const typeIcon: Record<string, string> = { info: '💬', success: '✅', warning: '⚠️', error: '🔴' };

  return (
    <div style={{
      position: 'absolute', right: 0, top: '44px', width: '320px',
      background: '#161d2e', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '14px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      zIndex: 100, overflow: 'hidden',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px' }}>Notifications</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px' }}>×</button>
      </div>
      <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
        {notifications.map(n => (
          <div
            key={n.id}
            onClick={() => markNotificationRead(n.id)}
            style={{
              padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)',
              cursor: 'pointer', background: n.read ? 'transparent' : 'rgba(56,189,248,0.04)',
              transition: 'background 0.15s',
            }}
          >
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '16px', marginTop: '1px' }}>{typeIcon[n.type]}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', marginBottom: '2px' }}>{n.title}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{n.message}</div>
              </div>
              {!n.read && (
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#38bdf8', marginTop: '4px', flexShrink: 0 }} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
