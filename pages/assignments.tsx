import { useState } from 'react';
import Layout from '../components/Layout';
import { useApp, COURSES } from '../lib/AppContext';

export default function AssignmentsPage() {
  const { currentUser, assignments, submitAssignment } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const isAdmin = currentUser?.role === 'admin';
  const filtered = filter === 'all' ? assignments : assignments.filter(a => a.status === filter);
  const selected = assignments.find(a => a.id === selectedAssignment);

  const handleSubmit = () => {
    if (!selectedAssignment || !submissionText.trim()) return;
    submitAssignment(selectedAssignment, submissionText);
    setSubmitSuccess(true);
    setTimeout(() => { setSubmitSuccess(false); setSelectedAssignment(null); setSubmissionText(''); }, 2000);
  };

  const getStatusStyle = (status: string) => {
    const map: Record<string, string> = { graded: 'badge-success', submitted: 'badge-info', pending: 'badge-warning', late: 'badge-danger' };
    return map[status] || 'badge-muted';
  };

  const getGradeColor = (grade: number, max: number) => {
    const pct = (grade / max) * 100;
    if (pct >= 90) return '#34d399';
    if (pct >= 75) return '#fbbf24';
    return '#f87171';
  };

  return (
    <Layout title="Assignments">
      <div style={{ padding: '28px', maxWidth: '1100px' }}>
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 800, color: '#f0f6ff', marginBottom: '4px' }}>Assignments</h1>
            <p style={{ color: '#64748b', fontSize: '14px' }}>{isAdmin ? 'Review and grade student submissions' : 'Submit and track your assignments'}</p>
          </div>
          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '4px' }}>
            {(['all', 'pending', 'submitted', 'graded'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  background: filter === f ? 'rgba(56,189,248,0.15)' : 'none',
                  border: filter === f ? '1px solid rgba(56,189,248,0.3)' : '1px solid transparent',
                  color: filter === f ? '#38bdf8' : '#64748b',
                  borderRadius: '7px', padding: '6px 14px',
                  cursor: 'pointer', fontSize: '13px', fontWeight: 600, textTransform: 'capitalize',
                  transition: 'all 0.15s',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Summary row */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {[
            { label: 'Total', value: assignments.length, color: '#94a3b8' },
            { label: 'Pending', value: assignments.filter(a => a.status === 'pending').length, color: '#fbbf24' },
            { label: 'Submitted', value: assignments.filter(a => a.status === 'submitted').length, color: '#38bdf8' },
            { label: 'Graded', value: assignments.filter(a => a.status === 'graded').length, color: '#34d399' },
          ].map(s => (
            <div key={s.label} style={{
              background: '#161d2e', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '10px', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 800, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>{s.label}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          {/* List */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map(a => {
              const course = COURSES.find(c => c.id === a.courseId);
              const isOverdue = a.status === 'pending' && new Date(a.dueDate) < new Date();
              return (
                <div
                  key={a.id}
                  className="glass-card"
                  style={{
                    padding: '18px 20px', cursor: 'pointer',
                    borderColor: selectedAssignment === a.id ? 'rgba(56,189,248,0.4)' : undefined,
                    background: selectedAssignment === a.id ? 'rgba(56,189,248,0.06)' : undefined,
                  }}
                  onClick={() => { setSelectedAssignment(a.id === selectedAssignment ? null : a.id); setSubmitSuccess(false); }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#f0f6ff' }}>{a.title}</span>
                        <span className={`badge ${getStatusStyle(isOverdue ? 'late' : a.status)}`}>
                          {isOverdue ? 'overdue' : a.status}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>📚 {course?.title}</span>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>📦 {a.moduleName}</span>
                        <span style={{ fontSize: '12px', color: isOverdue ? '#f87171' : '#64748b' }}>
                          📅 Due {new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {a.grade !== undefined ? (
                        <div>
                          <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 800, color: getGradeColor(a.grade, a.maxGrade) }}>
                            {a.grade}
                          </span>
                          <span style={{ fontSize: '13px', color: '#64748b' }}>/{a.maxGrade}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#475569' }}>/{a.maxGrade} pts</span>
                      )}
                    </div>
                  </div>

                  {/* Expanded */}
                  {selectedAssignment === a.id && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', animation: 'fadeIn 0.2s ease' }}>
                      <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px', lineHeight: 1.6 }}>{a.description}</p>

                      {a.feedback && (
                        <div style={{
                          background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)',
                          borderRadius: '10px', padding: '12px 14px', marginBottom: '16px',
                        }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#34d399', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tutor Feedback</div>
                          <div style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: 1.6 }}>{a.feedback}</div>
                        </div>
                      )}

                      {a.submittedAt && (
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                          ✅ Submitted {new Date(a.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      )}

                      {a.status === 'pending' && !isAdmin && (
                        <div>
                          <textarea
                            value={submissionText}
                            onChange={e => setSubmissionText(e.target.value)}
                            placeholder="Describe your solution, paste your GitHub link, or add notes here..."
                            className="field-input"
                            style={{ minHeight: '100px', resize: 'vertical', fontFamily: 'DM Sans, sans-serif', marginBottom: '10px' }}
                          />
                          {submitSuccess ? (
                            <div style={{ color: '#34d399', fontSize: '13px', fontWeight: 600 }}>✅ Assignment submitted successfully!</div>
                          ) : (
                            <button
                              className="btn-primary"
                              onClick={handleSubmit}
                              disabled={!submissionText.trim()}
                              style={{ opacity: submissionText.trim() ? 1 : 0.5 }}
                            >
                              Submit Assignment →
                            </button>
                          )}
                        </div>
                      )}

                      {isAdmin && a.status === 'submitted' && (
                        <div>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <input type="number" placeholder="Grade (0-100)" min={0} max={100} className="field-input" style={{ maxWidth: '160px' }} />
                            <textarea placeholder="Feedback for student..." className="field-input" style={{ flex: 1, minHeight: '60px', minWidth: '200px' }} />
                            <button className="btn-primary" style={{ fontSize: '13px' }}>Grade →</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📝</div>
                <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>No assignments found</div>
                <div style={{ fontSize: '13px' }}>Nothing in "{filter}" category</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
