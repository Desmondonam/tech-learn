import { useState } from 'react';
import Layout from '../components/Layout';
import { useApp, ADMIN_STUDENTS, COURSES, MODULES } from '../lib/AppContext';

export default function AdminPage() {
  const { currentUser, assignments, feedbacks } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'grades' | 'analytics'>('overview');

  if (currentUser?.role !== 'admin') {
    return (
      <Layout title="Access Denied">
        <div style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🚫</div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', color: '#f87171' }}>Access Denied</h2>
          <p style={{ color: '#64748b', marginTop: '8px' }}>This area is for tutors/admins only.</p>
        </div>
      </Layout>
    );
  }

  const tabs = [
    { id: 'overview', label: '🏠 Overview' },
    { id: 'students', label: '👨‍🎓 Students' },
    { id: 'grades', label: '📝 Grading Queue' },
    { id: 'analytics', label: '📊 Analytics' },
  ];

  return (
    <Layout title="Admin Panel">
      <div style={{ padding: '28px', maxWidth: '1200px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 800, color: '#f0f6ff', marginBottom: '4px' }}>
            Admin Panel ⚙️
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Manage students, grade submissions, and monitor course performance</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '4px', width: 'fit-content', flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              style={{
                background: activeTab === tab.id ? 'rgba(56,189,248,0.15)' : 'none',
                border: activeTab === tab.id ? '1px solid rgba(56,189,248,0.3)' : '1px solid transparent',
                color: activeTab === tab.id ? '#38bdf8' : '#64748b',
                borderRadius: '7px', padding: '7px 14px',
                cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
              {[
                { label: 'Total Students', value: ADMIN_STUDENTS.length, icon: '👨‍🎓', color: '#38bdf8' },
                { label: 'Active Courses', value: COURSES.filter(c => c.enrolled).length, icon: '📚', color: '#34d399' },
                { label: 'Total Assignments', value: assignments.length, icon: '📝', color: '#fbbf24' },
                { label: 'Pending Reviews', value: assignments.filter(a => a.status === 'submitted').length, icon: '⏳', color: '#a78bfa' },
                { label: 'Avg Course Rating', value: feedbacks.length ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1) + ' ⭐' : 'N/A', icon: '⭐', color: '#fbbf24' },
              ].map((s, i) => (
                <div key={i} className="stat-card">
                  <span style={{ fontSize: '24px' }}>{s.icon}</span>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 800, color: s.color, marginTop: '8px' }}>{s.value}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Courses overview */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: '#f0f6ff', marginBottom: '16px' }}>Course Status</h3>
                {COURSES.filter(c => c.enrolled).map(course => {
                  const courseAssignments = assignments.filter(a => a.courseId === course.id);
                  const graded = courseAssignments.filter(a => a.status === 'graded').length;
                  return (
                    <div key={course.id} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}>
                      <span style={{ fontSize: '20px' }}>{course.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{course.title}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{graded}/{courseAssignments.length} graded</div>
                      </div>
                      <span style={{
                        padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 600,
                        background: `${course.color}15`, color: course.color,
                      }}>Active</span>
                    </div>
                  );
                })}
              </div>

              {/* Recent submissions */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: '#f0f6ff', marginBottom: '16px' }}>Recent Submissions</h3>
                {assignments.filter(a => a.submittedAt).slice(0, 5).map(a => (
                  <div key={a.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0' }}>{a.title}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                      </div>
                    </div>
                    <span className={`badge ${a.status === 'graded' ? 'badge-success' : 'badge-warning'}`}>{a.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Students */}
        {activeTab === 'students' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {ADMIN_STUDENTS.map(student => {
                const studentAssignments = assignments;
                const graded = studentAssignments.filter(a => a.status === 'graded');
                const avgGrade = graded.length
                  ? Math.round(graded.reduce((s, a) => s + (a.grade! / a.maxGrade) * 100, 0) / graded.length)
                  : null;
                const enrolled = COURSES.filter(c => c.enrolled).length;
                return (
                  <div key={student.id} className="glass-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #38bdf8, #0284c7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '20px', color: 'white',
                      }}>
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: '#f0f6ff' }}>{student.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{student.email}</div>
                        {student.githubUsername && (
                          <div style={{ fontSize: '11px', color: '#38bdf8' }}>🐙 @{student.githubUsername}</div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                      {[
                        { label: 'Courses', value: enrolled },
                        { label: 'Submitted', value: studentAssignments.filter(a => a.submittedAt).length },
                        { label: 'Avg Grade', value: avgGrade ? `${avgGrade}%` : 'N/A' },
                      ].map((s, i) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 800, color: '#38bdf8' }}>{s.value}</div>
                          <div style={{ fontSize: '10px', color: '#64748b' }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '12px', padding: '7px' }}>View Profile</button>
                      <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: '12px', padding: '7px' }}>Message</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Grading Queue */}
        {activeTab === 'grades' && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {assignments.filter(a => a.status === 'submitted').length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
                  <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>All caught up!</div>
                  <div style={{ fontSize: '13px' }}>No submissions pending review.</div>
                </div>
              ) : (
                assignments.filter(a => a.status === 'submitted').map(a => (
                  <div key={a.id} className="glass-card" style={{ padding: '18px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: '#f0f6ff', marginBottom: '4px' }}>{a.title}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          Submitted {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''} · Max {a.maxGrade} pts
                        </div>
                      </div>
                      <span className="badge badge-info">Awaiting Grade</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>{a.description}</p>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <input type="number" placeholder={`Grade (0–${a.maxGrade})`} min={0} max={a.maxGrade} className="field-input" style={{ maxWidth: '160px' }} />
                      <input type="text" placeholder="Brief feedback..." className="field-input" style={{ flex: 1, minWidth: '180px' }} />
                      <button className="btn-primary" style={{ fontSize: '13px', flexShrink: 0 }}>Submit Grade →</button>
                    </div>
                  </div>
                ))
              )}

              {/* Already graded */}
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 700, color: '#64748b', marginTop: '12px', marginBottom: '10px' }}>
                Previously Graded ({assignments.filter(a => a.status === 'graded').length})
              </h3>
              {assignments.filter(a => a.status === 'graded').map(a => (
                <div key={a.id} style={{
                  background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.15)',
                  borderRadius: '12px', padding: '14px 18px', opacity: 0.75,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>{a.title}</div>
                      <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>{a.feedback}</div>
                    </div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 800, color: '#34d399' }}>
                      {a.grade}/{a.maxGrade}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics */}
        {activeTab === 'analytics' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Assignment completion rates */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: '#f0f6ff', marginBottom: '16px' }}>Submission Status</h3>
                {[
                  { label: 'Graded', count: assignments.filter(a => a.status === 'graded').length, color: '#34d399' },
                  { label: 'Submitted', count: assignments.filter(a => a.status === 'submitted').length, color: '#38bdf8' },
                  { label: 'Pending', count: assignments.filter(a => a.status === 'pending').length, color: '#fbbf24' },
                ].map((s, i) => (
                  <div key={i} style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '13px', color: '#94a3b8' }}>{s.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: s.color }}>{s.count}</span>
                    </div>
                    <div className="progress-bar" style={{ height: '6px' }}>
                      <div className="progress-fill" style={{ width: `${(s.count / assignments.length) * 100}%`, background: s.color }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Grade distribution */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: '#f0f6ff', marginBottom: '16px' }}>Grade Distribution</h3>
                {[
                  { label: 'A (90–100)', min: 90, max: 100, color: '#34d399' },
                  { label: 'B (80–89)', min: 80, max: 89, color: '#38bdf8' },
                  { label: 'C (70–79)', min: 70, max: 79, color: '#fbbf24' },
                  { label: 'D (<70)', min: 0, max: 69, color: '#f87171' },
                ].map((g, i) => {
                  const graded = assignments.filter(a => a.grade !== undefined);
                  const count = graded.filter(a => {
                    const pct = (a.grade! / a.maxGrade) * 100;
                    return pct >= g.min && pct <= g.max;
                  }).length;
                  return (
                    <div key={i} style={{ marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>{g.label}</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: g.color }}>{count}</span>
                      </div>
                      <div className="progress-bar" style={{ height: '6px' }}>
                        <div className="progress-fill" style={{ width: graded.length ? `${(count / graded.length) * 100}%` : '0%', background: g.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Module completion */}
              <div className="glass-card" style={{ padding: '20px', gridColumn: '1 / -1' }}>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: '#f0f6ff', marginBottom: '16px' }}>Module Completion by Course</h3>
                {COURSES.filter(c => c.enrolled).map(course => {
                  const pct = Math.round(((course.completedModules || 0) / course.modules) * 100);
                  return (
                    <div key={course.id} style={{ marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{course.icon}</span>
                          <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>{course.title}</span>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: course.color }}>{pct}% ({course.completedModules}/{course.modules})</span>
                      </div>
                      <div className="progress-bar" style={{ height: '7px' }}>
                        <div className="progress-fill" style={{ width: `${pct}%`, background: course.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
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
