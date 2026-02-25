import Layout from '../components/Layout';
import { useApp } from '../lib/AppContext';

export default function WebinarsPage() {
  const { webinars, registerWebinar } = useApp();

  const typeColor: Record<string, string> = { webinar: '#38bdf8', 'office-hours': '#34d399', workshop: '#a78bfa', class: '#fbbf24' };
  const typeIcon: Record<string, string> = { webinar: '📡', 'office-hours': '💬', workshop: '🛠️', class: '📖' };

  const upcoming = webinars.filter(w => new Date(w.date) >= new Date());
  const past = webinars.filter(w => new Date(w.date) < new Date());

  return (
    <Layout title="Schedule">
      <div style={{ padding: '28px', maxWidth: '1000px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 800, color: '#f0f6ff', marginBottom: '4px' }}>Schedule & Webinars</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Upcoming sessions, workshops, and office hours</p>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {Object.entries(typeColor).map(([type, color]) => (
            <div key={type} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: `${color}10`, border: `1px solid ${color}25`,
              borderRadius: '100px', padding: '4px 12px',
              fontSize: '12px', fontWeight: 600, color,
            }}>
              <span>{typeIcon[type]}</span>
              <span style={{ textTransform: 'capitalize' }}>{type.replace('-', ' ')}</span>
            </div>
          ))}
        </div>

        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: '#f0f6ff', marginBottom: '16px' }}>
          📅 Upcoming ({upcoming.length})
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '36px' }}>
          {upcoming.map(w => (
            <div
              key={w.id}
              className="glass-card"
              style={{ padding: '20px 24px', borderLeft: `3px solid ${typeColor[w.type]}` }}
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '14px', flexShrink: 0,
                  background: `${typeColor[w.type]}15`, border: `1px solid ${typeColor[w.type]}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
                }}>
                  {typeIcon[w.type]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: '#f0f6ff' }}>{w.title}</h3>
                    <span className="badge" style={{ background: `${typeColor[w.type]}15`, color: typeColor[w.type] }}>
                      {w.type.replace('-', ' ')}
                    </span>
                    {w.registered && <span className="badge badge-success">Registered ✓</span>}
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '10px', lineHeight: 1.6 }}>{w.description}</p>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px', color: '#94a3b8' }}>
                    <span>📅 {new Date(w.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    <span>🕐 {w.time}</span>
                    <span>⏱ {w.duration}</span>
                    <span>👩‍🏫 {w.instructor}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                  {w.registered ? (
                    <>
                      <a
                        href={w.zoomLink}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-primary"
                        style={{ textDecoration: 'none', fontSize: '13px', padding: '8px 16px' }}
                      >
                        🎥 Join Zoom
                      </a>
                      <button
                        className="btn-secondary"
                        onClick={() => registerWebinar(w.id)}
                        style={{ fontSize: '12px', padding: '6px 14px', color: '#f87171', borderColor: 'rgba(248,113,113,0.2)' }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn-primary"
                      onClick={() => registerWebinar(w.id)}
                      style={{ fontSize: '13px', padding: '8px 16px', background: `linear-gradient(135deg, ${typeColor[w.type]}, ${typeColor[w.type]}cc)` }}
                    >
                      Register →
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {past.length > 0 && (
          <>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: '#64748b', marginBottom: '16px' }}>
              Past Sessions ({past.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', opacity: 0.6 }}>
              {past.map(w => (
                <div key={w.id} className="glass-card" style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>{w.title}</span>
                      <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                        {new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {w.time}
                      </div>
                    </div>
                    <span className="badge badge-muted">Ended</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
