import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useApp, COURSES, ASSIGNMENTS, CODING_CHALLENGES } from '../lib/AppContext';
import Link from 'next/link';

interface Enrollment { courseId: string; completedModules: number; }
interface Submission { assignmentId: string; status: string; grade?: number; feedback?: string; submittedAt?: string; }
interface ChallengeEntry { challengeId: string; solved: boolean; score?: number; }
interface DashboardData { enrollments: Enrollment[]; submissions: Submission[]; challengeSubmissions: ChallengeEntry[]; }

const TAG_META: { tag: string; label: string; color: string }[] = [
  { tag: 'arrays',              label: 'Arrays & Hash Maps',    color: '#38bdf8' },
  { tag: 'recursion',           label: 'Recursion',             color: '#a78bfa' },
  { tag: 'dynamic-programming', label: 'Dynamic Programming',   color: '#fbbf24' },
  { tag: 'window-functions',    label: 'SQL / Window Functions', color: '#34d399' },
  { tag: 'graphs',              label: 'Graph Algorithms',      color: '#f87171' },
];

export default function DashboardPage() {
  const { currentUser, webinars } = useApp();
  const isAdmin = currentUser?.role === 'admin';
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/dashboard')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Merge real enrollment data with mock course catalog
  const enrolledCourses = data
    ? COURSES.filter(c => data.enrollments.some(e => e.courseId === c.id)).map(c => {
        const enr = data.enrollments.find(e => e.courseId === c.id)!;
        return { ...c, completedModules: enr.completedModules };
      })
    : [];

  // Build user-specific assignment list from real submissions
  const userAssignments = data
    ? ASSIGNMENTS.map(a => {
        const sub = data.submissions.find(s => s.assignmentId === a.id);
        if (!sub) return null;
        return { ...a, status: sub.status as typeof a.status, grade: sub.grade ?? undefined, submittedAt: sub.submittedAt ?? undefined };
      }).filter((a): a is NonNullable<typeof a> => a !== null)
    : [];

  // Build user-specific challenge list
  const userChallenges = CODING_CHALLENGES.map(c => {
    const sub = data?.challengeSubmissions.find(s => s.challengeId === c.id);
    return { ...c, solved: sub?.solved ?? false, score: sub?.score ?? undefined };
  });

  const pendingAssignments = userAssignments.filter(a => a.status === 'pending');
  const solvedChallenges = userChallenges.filter(c => c.solved);
  const gradedSubmissions = userAssignments.filter(a => a.grade !== undefined);
  const avgGrade = gradedSubmissions.length > 0
    ? Math.round(gradedSubmissions.reduce((s, a) => s + (a.grade! / a.maxGrade) * 100, 0) / gradedSubmissions.length)
    : null;

  const codingStrengths = TAG_META.map(({ tag, label, color }) => {
    const tagged = userChallenges.filter(c => c.tags?.includes(tag));
    const score = tagged.length > 0
      ? Math.round(tagged.filter(c => c.solved).reduce((sum, c) => sum + ((c.score ?? 0) / c.maxScore) * 100, 0) / tagged.length)
      : 0;
    return { label, score, color };
  });

  const upcomingWebinars = webinars.slice(0, 3);

  const STATS = isAdmin
    ? [
        { label: 'Active Courses', value: '4', icon: '📚', color: '#38bdf8', sub: 'in catalog' },
        { label: 'Total Challenges', value: CODING_CHALLENGES.length.toString(), icon: '⚡', color: '#34d399', sub: 'available' },
        { label: 'Upcoming Sessions', value: upcomingWebinars.length.toString(), icon: '📅', color: '#a78bfa', sub: 'this month' },
        { label: 'Total Assignments', value: ASSIGNMENTS.length.toString(), icon: '📝', color: '#fbbf24', sub: 'in catalog' },
      ]
    : [
        { label: 'Courses Enrolled', value: loading ? '…' : enrolledCourses.length.toString(), icon: '📚', color: '#38bdf8', sub: 'active' },
        { label: 'Avg. Grade', value: loading ? '…' : avgGrade !== null ? `${avgGrade}%` : '—', icon: '🏆', color: '#34d399', sub: avgGrade !== null ? 'across graded work' : 'no grades yet' },
        { label: 'Due This Week', value: loading ? '…' : pendingAssignments.length.toString(), icon: '⏰', color: '#fbbf24', sub: 'assignments' },
        { label: 'Challenges Solved', value: loading ? '…' : `${solvedChallenges.length}/${userChallenges.length}`, icon: '⚡', color: '#a78bfa', sub: 'coding problems' },
      ];

  const emptyState = (icon: string, message: string, linkHref: string, linkLabel: string) => (
    <div style={{ textAlign: 'center', padding: '32px 16px', color: '#475569' }}>
      <div style={{ fontSize: '36px', marginBottom: '10px' }}>{icon}</div>
      <div style={{ fontSize: '13px', marginBottom: '14px' }}>{message}</div>
      <Link href={linkHref}>
        <button className="btn-primary" style={{ fontSize: '12px', padding: '8px 16px' }}>{linkLabel}</button>
      </Link>
    </div>
  );

  return (
    <Layout title="Dashboard">
      <div style={{ padding: '28px', maxWidth: '1200px' }}>

        {/* Welcome */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(167,139,250,0.12))',
          border: '1px solid rgba(56,189,248,0.2)',
          borderRadius: '20px', padding: '28px', marginBottom: '28px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: '-20px', top: '-20px', fontSize: '100px', opacity: 0.08, pointerEvents: 'none' }}>🚀</div>
          <div style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '26px', fontWeight: 800, color: '#f0f6ff', marginBottom: '6px' }}>
            Welcome back, {currentUser?.name.split(' ')[0]}! {isAdmin ? '👩‍🏫' : '👋'}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '15px', marginBottom: isAdmin ? '0' : '16px' }}>
            {isAdmin
              ? `Managing ${COURSES.length} courses and ${ASSIGNMENTS.length} assignments.`
              : enrolledCourses.length === 0
                ? "You haven't enrolled in any courses yet. Start your learning journey!"
                : `You have ${pendingAssignments.length} pending assignment${pendingAssignments.length !== 1 ? 's' : ''}. Keep up the great work!`
            }
          </p>
          {!isAdmin && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link href="/courses">
                <button className="btn-primary" style={{ fontSize: '13px', padding: '8px 16px' }}>
                  {enrolledCourses.length === 0 ? 'Browse Courses →' : 'Continue Learning →'}
                </button>
              </Link>
              <Link href="/playground">
                <button className="btn-secondary" style={{ fontSize: '13px', padding: '8px 16px' }}>Open Playground</button>
              </Link>
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          {STATS.map((stat, i) => (
            <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.05}s` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '24px' }}>{stat.icon}</span>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: stat.color, boxShadow: `0 0 8px ${stat.color}` }} />
              </div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 800, color: stat.color, marginBottom: '2px' }}>{stat.value}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', marginBottom: '2px' }}>{stat.label}</div>
              <div style={{ fontSize: '11px', color: '#475569' }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          {/* Course Progress */}
          <div className="glass-card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: '#f0f6ff' }}>Course Progress</h2>
              <Link href="/courses"><span style={{ fontSize: '12px', color: '#38bdf8', cursor: 'pointer' }}>Browse all →</span></Link>
            </div>
            {loading ? (
              <div style={{ color: '#475569', fontSize: '13px', textAlign: 'center', padding: '24px' }}>Loading…</div>
            ) : enrolledCourses.length === 0 ? (
              emptyState('📚', 'No courses enrolled yet.', '/courses', 'Browse Courses →')
            ) : (
              enrolledCourses.map(course => {
                const pct = Math.round(((course.completedModules || 0) / course.modules) * 100);
                return (
                  <div key={course.id} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>{course.icon}</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{course.title}</span>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: course.color }}>{pct}%</span>
                    </div>
                    <div className="progress-bar" style={{ height: '6px' }}>
                      <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${course.color}, ${course.color}99)` }} />
                    </div>
                    <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>{course.completedModules}/{course.modules} modules</div>
                  </div>
                );
              })
            )}
          </div>

          {/* Upcoming Sessions */}
          <div className="glass-card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: '#f0f6ff' }}>Upcoming Sessions</h2>
              <Link href="/webinars"><span style={{ fontSize: '12px', color: '#38bdf8', cursor: 'pointer' }}>View all →</span></Link>
            </div>
            {upcomingWebinars.map(w => {
              const typeColor: Record<string, string> = { webinar: '#38bdf8', 'office-hours': '#34d399', workshop: '#a78bfa', class: '#fbbf24' };
              return (
                <div key={w.id} style={{
                  padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', marginBottom: '10px',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{w.title}</span>
                    <span className="badge" style={{ background: `${typeColor[w.type]}15`, color: typeColor[w.type] }}>{w.type}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    📅 {new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {w.time}
                  </div>
                  {w.registered && (
                    <a href={w.zoomLink} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '11px', color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>
                      🎥 Join Zoom
                    </a>
                  )}
                </div>
              );
            })}
          </div>

          {/* Recent Assignments */}
          <div className="glass-card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: '#f0f6ff' }}>My Assignments</h2>
              <Link href="/assignments"><span style={{ fontSize: '12px', color: '#38bdf8', cursor: 'pointer' }}>View all →</span></Link>
            </div>
            {loading ? (
              <div style={{ color: '#475569', fontSize: '13px', textAlign: 'center', padding: '24px' }}>Loading…</div>
            ) : userAssignments.length === 0 ? (
              emptyState('📝', 'No assignments yet. Enroll in a course to get started.', '/courses', 'Browse Courses →')
            ) : (
              userAssignments.slice(0, 4).map(a => {
                const statusStyle: Record<string, string> = { graded: 'badge-success', submitted: 'badge-info', pending: 'badge-warning', late: 'badge-danger' };
                return (
                  <div key={a.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{a.title}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Due {new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {a.grade !== undefined && (
                        <span style={{ fontSize: '13px', fontWeight: 700, color: a.grade >= 90 ? '#34d399' : a.grade >= 75 ? '#fbbf24' : '#f87171' }}>
                          {a.grade}%
                        </span>
                      )}
                      <span className={`badge ${statusStyle[a.status]}`}>{a.status}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Coding Strengths */}
          <div className="glass-card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: '#f0f6ff' }}>Coding Strengths</h2>
              <Link href="/challenges"><span style={{ fontSize: '12px', color: '#38bdf8', cursor: 'pointer' }}>View all →</span></Link>
            </div>
            {loading ? (
              <div style={{ color: '#475569', fontSize: '13px', textAlign: 'center', padding: '24px' }}>Loading…</div>
            ) : solvedChallenges.length === 0 ? (
              emptyState('⚡', 'Solve coding challenges to build your strength profile.', '/challenges', 'Start Challenges →')
            ) : (
              codingStrengths.map((skill, i) => (
                <div key={i} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>{skill.label}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: skill.score > 0 ? skill.color : '#475569' }}>
                      {skill.score > 0 ? `${skill.score}%` : '—'}
                    </span>
                  </div>
                  <div className="progress-bar" style={{ height: '5px' }}>
                    <div className="progress-fill" style={{ width: `${skill.score}%`, background: skill.color }} />
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </Layout>
  );
}
