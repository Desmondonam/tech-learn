import Layout from '../components/Layout';
import { useApp } from '../lib/AppContext';

export default function ChallengesPage() {
  const { challenges } = useApp();

  const solved = challenges.filter(c => c.solved);
  const avgScore = Math.round(solved.reduce((s, c) => s + ((c.score || 0) / c.maxScore) * 100, 0) / solved.length);

  const diffColor: Record<string, string> = { easy: '#34d399', medium: '#fbbf24', hard: '#f87171' };
  const langColor: Record<string, string> = { Python: '#3b82f6', SQL: '#10b981' };

  // Skills analysis from solved challenges
  const allTags = challenges.flatMap(c => c.tags);
  const tagCounts: Record<string, { total: number; solved: number }> = {};
  allTags.forEach(tag => {
    if (!tagCounts[tag]) tagCounts[tag] = { total: 0, solved: 0 };
    tagCounts[tag].total++;
  });
  solved.forEach(c => c.tags.forEach(tag => {
    if (tagCounts[tag]) tagCounts[tag].solved++;
  }));

  const skillStrengths = Object.entries(tagCounts)
    .map(([tag, counts]) => ({ tag, pct: Math.round((counts.solved / counts.total) * 100), total: counts.total }))
    .sort((a, b) => b.pct - a.pct);

  return (
    <Layout title="Code Challenges">
      <div style={{ padding: '28px', maxWidth: '1100px' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 800, color: '#f0f6ff', marginBottom: '4px' }}>Code Challenges</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Track your GitHub coding challenge progress and skill strengths</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '28px' }}>
          {[
            { label: 'Challenges Solved', value: `${solved.length}/${challenges.length}`, icon: '⚡', color: '#38bdf8' },
            { label: 'Average Score', value: `${avgScore}%`, icon: '🏆', color: '#34d399' },
            { label: 'Easy', value: challenges.filter(c => c.difficulty === 'easy' && c.solved).length + '/' + challenges.filter(c => c.difficulty === 'easy').length, icon: '🟢', color: '#34d399' },
            { label: 'Medium', value: challenges.filter(c => c.difficulty === 'medium' && c.solved).length + '/' + challenges.filter(c => c.difficulty === 'medium').length, icon: '🟡', color: '#fbbf24' },
            { label: 'Hard', value: challenges.filter(c => c.difficulty === 'hard' && c.solved).length + '/' + challenges.filter(c => c.difficulty === 'hard').length, icon: '🔴', color: '#f87171' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}>{s.icon}</span>
              </div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          {/* Challenges list */}
          <div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: '#f0f6ff', marginBottom: '14px' }}>
              All Challenges
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {challenges.map(ch => (
                <div
                  key={ch.id}
                  style={{
                    background: ch.solved ? 'rgba(52,211,153,0.05)' : '#161d2e',
                    border: `1px solid ${ch.solved ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: '12px', padding: '14px 18px',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                      background: ch.solved ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.05)',
                      border: `2px solid ${ch.solved ? '#34d399' : 'rgba(255,255,255,0.1)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px',
                    }}>
                      {ch.solved ? '✓' : '○'}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0' }}>{ch.title}</span>
                        <span style={{
                          padding: '2px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: 600,
                          background: `${diffColor[ch.difficulty]}15`, color: diffColor[ch.difficulty],
                        }}>{ch.difficulty}</span>
                        <span style={{
                          padding: '2px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: 600,
                          background: `${langColor[ch.language] || '#64748b'}15`, color: langColor[ch.language] || '#94a3b8',
                        }}>{ch.language}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {ch.tags.map(tag => (
                          <span key={tag} style={{
                            fontSize: '10px', color: '#475569', background: 'rgba(255,255,255,0.04)',
                            borderRadius: '4px', padding: '1px 6px',
                          }}>#{tag}</span>
                        ))}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {ch.solved ? (
                        <div>
                          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 800, color: '#34d399' }}>
                            {ch.score}/{ch.maxScore}
                          </div>
                          {ch.githubUrl && (
                            <a href={ch.githubUrl} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: '#38bdf8', textDecoration: 'none' }}>
                              GitHub →
                            </a>
                          )}
                        </div>
                      ) : (
                        <button className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
                          Attempt
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Strengths */}
          <div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: '#f0f6ff', marginBottom: '14px' }}>
              🎯 Skill Strengths
            </h2>
            <div className="glass-card" style={{ padding: '18px' }}>
              {skillStrengths.map((skill, i) => (
                <div key={i} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, textTransform: 'capitalize' }}>
                      {skill.tag.replace(/-/g, ' ')}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#475569' }}>({skill.total} total)</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: skill.pct >= 80 ? '#34d399' : skill.pct >= 50 ? '#fbbf24' : '#f87171' }}>
                        {skill.pct}%
                      </span>
                    </div>
                  </div>
                  <div className="progress-bar" style={{ height: '5px' }}>
                    <div
                      className="progress-fill"
                      style={{
                        width: `${skill.pct}%`,
                        background: skill.pct >= 80 ? '#34d399' : skill.pct >= 50 ? '#fbbf24' : '#f87171',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* GitHub Stats */}
            <div className="glass-card" style={{ padding: '18px', marginTop: '14px' }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '13px', fontWeight: 700, color: '#f0f6ff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '16px' }}>🐙</span> GitHub Activity
              </h3>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                Connected as <span style={{ color: '#38bdf8', fontWeight: 600 }}>@alexjdev</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { label: 'Repositories', value: '12' },
                  { label: 'Commits this month', value: '47' },
                  { label: 'Stars received', value: '8' },
                  { label: 'PRs merged', value: '6' },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{s.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>{s.value}</span>
                  </div>
                ))}
              </div>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
                style={{ display: 'flex', justifyContent: 'center', marginTop: '14px', textDecoration: 'none', fontSize: '12px' }}
              >
                🐙 View GitHub Profile
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 2fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </Layout>
  );
}
