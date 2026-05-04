import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { useApp } from '../lib/AppContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line,
} from 'recharts';

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

const ChartTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px' }}>
      {label && <div style={{ color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
};

interface StudentRow {
  id: string; name: string; email: string;
  githubUsername: string | null; joinDate: string;
  enrollmentCount: number; submissionCount: number; avgGrade: number | null;
}

interface CourseRow {
  id: string; title: string; icon: string; color: string;
  moduleCount: number; enrollmentCount: number;
}

interface SubmissionStats {
  total: number; pending: number; submitted: number; graded: number;
}

interface RecentSubmission {
  id: string; assignmentId: string; status: string;
  grade: number | null; submittedAt: string | null;
  submissionText: string | null;
  user: { name: string; email: string };
}

interface CourseModuleStat {
  courseId: string; courseTitle: string; courseIcon: string; courseColor: string;
  totalModules: number; approvedCount: number; submittedCount: number; enrolledStudents: number;
}

interface GradeBuckets { a: number; b: number; c: number; d: number }

interface DashData {
  students: StudentRow[];
  courses: CourseRow[];
  submissionStats: SubmissionStats;
  recentSubmissions: RecentSubmission[];
  gradedTotal: number;
  gradeBuckets: GradeBuckets;
  courseModuleStats: CourseModuleStat[];
}

interface ApprovalItem {
  id: string; status: string; submittedAt: string | null; feedback: string | null;
  user: { id: string; name: string; email: string };
  module: { id: string; title: string; course: { id: string; title: string } };
}

// Submissions from the grades tab (pending grade)
interface GradeSubmission extends RecentSubmission {
  feedback: string | null;
}

export default function AdminPage() {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'grades' | 'approvals' | 'analytics'>('overview');

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Dashboard data
  const [dash, setDash] = useState<DashData | null>(null);
  const [dashLoading, setDashLoading] = useState(true);

  // Grades tab: pending submissions fetched separately
  const [pendingSubmissions, setPendingSubmissions] = useState<GradeSubmission[]>([]);
  const [gradedSubmissions, setGradedSubmissions] = useState<GradeSubmission[]>([]);
  const [gradesLoading, setGradesLoading] = useState(false);
  const [gradeInputs, setGradeInputs] = useState<Record<string, { grade: string; feedback: string }>>({});
  const [gradeLoading, setGradeLoading] = useState<string | null>(null);

  // Approvals tab
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [approvalsLoading, setApprovalsLoading] = useState(false);
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchDash = useCallback(async () => {
    setDashLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard');
      if (res.ok) setDash(await res.json());
    } finally {
      setDashLoading(false);
    }
  }, []);

  const fetchGrades = useCallback(async () => {
    setGradesLoading(true);
    try {
      const res = await fetch('/api/admin/submissions');
      if (res.ok) {
        const data = await res.json();
        setPendingSubmissions(data.pending);
        setGradedSubmissions(data.graded);
      }
    } finally {
      setGradesLoading(false);
    }
  }, []);

  const fetchApprovals = useCallback(async () => {
    setApprovalsLoading(true);
    try {
      const res = await fetch('/api/admin/approvals');
      if (res.ok) setApprovals((await res.json()).pending);
    } finally {
      setApprovalsLoading(false);
    }
  }, []);

  useEffect(() => { fetchDash(); }, [fetchDash]);
  useEffect(() => {
    if (activeTab === 'grades') fetchGrades();
    if (activeTab === 'approvals') fetchApprovals();
  }, [activeTab, fetchGrades, fetchApprovals]);

  const handleGrade = async (submissionId: string) => {
    const input = gradeInputs[submissionId];
    if (!input?.grade) return;
    setGradeLoading(submissionId);
    try {
      const res = await fetch('/api/admin/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, grade: input.grade, feedback: input.feedback || '' }),
      });
      if (res.ok) {
        await fetchGrades();
        await fetchDash();
        setGradeInputs(g => { const n = { ...g }; delete n[submissionId]; return n; });
      }
    } finally {
      setGradeLoading(null);
    }
  };

  const handleApprovalAction = async (progressId: string, action: 'approve' | 'reject') => {
    setActionLoading(progressId + action);
    try {
      const res = await fetch('/api/admin/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progressId, action, feedback: feedbackInputs[progressId] || '' }),
      });
      if (res.ok) {
        await fetchApprovals();
        setFeedbackInputs(f => { const n = { ...f }; delete n[progressId]; return n; });
      }
    } finally {
      setActionLoading(null);
    }
  };

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
    { id: 'approvals', label: '✅ Approvals' },
    { id: 'analytics', label: '📊 Analytics' },
  ];

  const ss = dash?.submissionStats;

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

        {dashLoading && activeTab === 'overview' ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>
            <div className="spinner" style={{ margin: '0 auto 12px' }} />
            <div>Loading dashboard...</div>
          </div>
        ) : (
          <>
            {/* ── OVERVIEW ── */}
            {activeTab === 'overview' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                  {[
                    { label: 'Total Students', value: dash?.students.length ?? 0, icon: '👨‍🎓', color: '#38bdf8' },
                    { label: 'Active Courses', value: dash?.courses.length ?? 0, icon: '📚', color: '#34d399' },
                    { label: 'Total Submissions', value: ss?.total ?? 0, icon: '📝', color: '#fbbf24' },
                    { label: 'Pending Grades', value: ss?.submitted ?? 0, icon: '⏳', color: '#a78bfa' },
                    { label: 'Graded', value: ss?.graded ?? 0, icon: '✅', color: '#34d399' },
                  ].map((s, i) => (
                    <div key={i} className="stat-card">
                      <span style={{ fontSize: '24px' }}>{s.icon}</span>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 800, color: s.color, marginTop: '8px' }}>{s.value}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {/* Courses */}
                  <div className="glass-card" style={{ padding: '20px' }}>
                    <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: '#f0f6ff', marginBottom: '16px' }}>Courses</h3>
                    {!dash?.courses.length ? (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#475569', fontSize: '13px' }}>No courses created yet</div>
                    ) : (
                      dash.courses.map(course => (
                        <div key={course.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <span style={{ fontSize: '20px' }}>{course.icon}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.title}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{course.moduleCount} modules · {course.enrollmentCount} students</div>
                          </div>
                          <span style={{ padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 600, background: `${course.color}15`, color: course.color, flexShrink: 0 }}>
                            Active
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Recent submissions */}
                  <div className="glass-card" style={{ padding: '20px' }}>
                    <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: '#f0f6ff', marginBottom: '16px' }}>Recent Submissions</h3>
                    {!dash?.recentSubmissions.length ? (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#475569', fontSize: '13px' }}>No submissions yet</div>
                    ) : (
                      dash.recentSubmissions.map(s => (
                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0' }}>{s.user.name}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                            </div>
                          </div>
                          <span className={`badge ${s.status === 'graded' ? 'badge-success' : 'badge-warning'}`}>{s.status}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── STUDENTS ── */}
            {activeTab === 'students' && (
              <div>
                {dashLoading ? (
                  <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>
                    <div className="spinner" style={{ margin: '0 auto 12px' }} />
                    <div>Loading students...</div>
                  </div>
                ) : !dash?.students.length ? (
                  <div style={{ textAlign: 'center', padding: '60px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>👥</div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>No students yet</div>
                    <div style={{ fontSize: '13px', color: '#475569' }}>Students will appear here once they register.</div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                    {dash.students.map(student => (
                      <div key={student.id} className="glass-card" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                          <div style={{
                            width: '48px', height: '48px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #38bdf8, #0284c7)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '20px', color: 'white',
                          }}>
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: '#f0f6ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{student.name}</div>
                            <div style={{ fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{student.email}</div>
                            {student.githubUsername && (
                              <div style={{ fontSize: '11px', color: '#38bdf8' }}>🐙 @{student.githubUsername}</div>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                          {[
                            { label: 'Courses', value: student.enrollmentCount },
                            { label: 'Submitted', value: student.submissionCount },
                            { label: 'Avg Grade', value: student.avgGrade !== null ? `${student.avgGrade}%` : '—' },
                          ].map((s, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 800, color: '#38bdf8' }}>{s.value}</div>
                              <div style={{ fontSize: '10px', color: '#64748b' }}>{s.label}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ fontSize: '11px', color: '#475569', textAlign: 'right' }}>
                          Joined {new Date(student.joinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── GRADING QUEUE ── */}
            {activeTab === 'grades' && (
              <div>
                {gradesLoading ? (
                  <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>
                    <div className="spinner" style={{ margin: '0 auto 12px' }} />
                    <div>Loading submissions...</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {pendingSubmissions.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
                        <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>All caught up!</div>
                        <div style={{ fontSize: '13px' }}>No assignment submissions are pending a grade.</div>
                      </div>
                    ) : (
                      pendingSubmissions.map(s => (
                        <div key={s.id} className="glass-card" style={{ padding: '18px 20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                            <div>
                              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: '#f0f6ff', marginBottom: '3px' }}>
                                {s.user.name}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>
                                {s.user.email} · Submitted {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                              </div>
                            </div>
                            <span className="badge badge-info">Awaiting Grade</span>
                          </div>
                          {s.submissionText && (
                            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>
                              {s.submissionText}
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <input
                              type="number"
                              placeholder="Grade (0–100)"
                              min={0} max={100}
                              className="field-input"
                              style={{ maxWidth: '140px' }}
                              value={gradeInputs[s.id]?.grade ?? ''}
                              onChange={e => setGradeInputs(g => ({ ...g, [s.id]: { ...g[s.id], grade: e.target.value, feedback: g[s.id]?.feedback ?? '' } }))}
                            />
                            <input
                              type="text"
                              placeholder="Feedback for student..."
                              className="field-input"
                              style={{ flex: 1, minWidth: '180px' }}
                              value={gradeInputs[s.id]?.feedback ?? ''}
                              onChange={e => setGradeInputs(g => ({ ...g, [s.id]: { ...g[s.id], feedback: e.target.value, grade: g[s.id]?.grade ?? '' } }))}
                            />
                            <button
                              className="btn-primary"
                              style={{ fontSize: '13px', flexShrink: 0, opacity: gradeLoading === s.id ? 0.7 : 1 }}
                              disabled={gradeLoading === s.id || !gradeInputs[s.id]?.grade}
                              onClick={() => handleGrade(s.id)}
                            >
                              {gradeLoading === s.id ? <><span className="spinner" /> Saving...</> : 'Submit Grade →'}
                            </button>
                          </div>
                        </div>
                      ))
                    )}

                    {gradedSubmissions.length > 0 && (
                      <>
                        <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 700, color: '#64748b', marginTop: '12px', marginBottom: '10px' }}>
                          Previously Graded ({gradedSubmissions.length})
                        </h3>
                        {gradedSubmissions.map(s => (
                          <div key={s.id} style={{ background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: '12px', padding: '14px 18px', opacity: 0.8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>{s.user.name}</div>
                                <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>{s.feedback || 'No feedback provided'}</div>
                              </div>
                              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 800, color: '#34d399' }}>
                                {s.grade}/100
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── APPROVALS ── */}
            {activeTab === 'approvals' && (
              <div>
                <div style={{ marginBottom: '18px' }}>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: '#f0f6ff', marginBottom: '4px' }}>
                    Module Completion Approvals
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    Review student submissions and approve or reject module completions to unlock the next module.
                  </p>
                </div>

                {approvalsLoading ? (
                  <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>
                    <div className="spinner" style={{ margin: '0 auto 12px' }} />
                    <div>Loading approvals...</div>
                  </div>
                ) : approvals.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>All caught up!</div>
                    <div style={{ fontSize: '13px', color: '#475569' }}>No module submissions are pending review.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {approvals.map(item => (
                      <div key={item.id} className="glass-card" style={{ padding: '20px', border: '1px solid rgba(56,189,248,0.15)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: '#f0f6ff', marginBottom: '4px' }}>
                              {item.module.title}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>📚 {item.module.course.title}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{item.user.name}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{item.user.email}</div>
                            {item.submittedAt && (
                              <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                                {new Date(item.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </div>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                          <input
                            type="text"
                            placeholder="Optional feedback for student..."
                            className="field-input"
                            style={{ flex: 1, minWidth: '180px' }}
                            value={feedbackInputs[item.id] || ''}
                            onChange={e => setFeedbackInputs(f => ({ ...f, [item.id]: e.target.value }))}
                          />
                          <button
                            className="btn-primary"
                            style={{ flexShrink: 0, fontSize: '13px', opacity: actionLoading === item.id + 'approve' ? 0.7 : 1 }}
                            disabled={actionLoading === item.id + 'approve'}
                            onClick={() => handleApprovalAction(item.id, 'approve')}
                          >
                            {actionLoading === item.id + 'approve' ? <><span className="spinner" /> Approving...</> : '✓ Approve'}
                          </button>
                          <button
                            style={{ flexShrink: 0, fontSize: '13px', padding: '8px 16px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '10px', color: '#f87171', cursor: 'pointer', fontWeight: 600, opacity: actionLoading === item.id + 'reject' ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}
                            disabled={actionLoading === item.id + 'reject'}
                            onClick={() => handleApprovalAction(item.id, 'reject')}
                          >
                            {actionLoading === item.id + 'reject' ? <><span className="spinner" /> Rejecting...</> : '✗ Reject'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── ANALYTICS ── */}
            {activeTab === 'analytics' && (() => {
              const pieData = [
                { name: 'Graded', value: ss?.graded ?? 0, color: '#34d399' },
                { name: 'Awaiting Grade', value: ss?.submitted ?? 0, color: '#38bdf8' },
                { name: 'Pending', value: ss?.pending ?? 0, color: '#fbbf24' },
              ].filter(d => d.value > 0);

              const gradeBarData = [
                { grade: 'A (90–100)', count: dash?.gradeBuckets.a ?? 0, fill: '#34d399' },
                { grade: 'B (80–89)', count: dash?.gradeBuckets.b ?? 0, fill: '#38bdf8' },
                { grade: 'C (70–79)', count: dash?.gradeBuckets.c ?? 0, fill: '#fbbf24' },
                { grade: 'D (< 70)', count: dash?.gradeBuckets.d ?? 0, fill: '#f87171' },
              ];

              const enrollmentData = (dash?.courses ?? []).map(c => ({
                name: c.title.length > 14 ? c.title.slice(0, 14) + '…' : c.title,
                Students: c.enrollmentCount,
                fill: c.color,
              }));

              const studentActivityData = (dash?.students ?? [])
                .slice()
                .sort((a, b) => b.submissionCount - a.submissionCount)
                .slice(0, 8)
                .map(s => ({
                  name: s.name.split(' ')[0],
                  Submissions: s.submissionCount,
                  'Avg Grade': s.avgGrade ?? 0,
                }));

              const moduleData = (dash?.courseModuleStats ?? []).map(c => ({
                name: c.courseTitle.length > 12 ? c.courseTitle.slice(0, 12) + '…' : c.courseTitle,
                Approved: c.approvedCount,
                Pending: c.submittedCount,
                Modules: c.totalModules,
              }));

              const axisStyle = { fill: '#64748b', fontSize: 12 };
              const gridStyle = { stroke: 'rgba(255,255,255,0.05)', strokeDasharray: '3 3' };
              const emptyState = (msg: string) => (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', color: '#475569', fontSize: '13px' }}>{msg}</div>
              );

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                  {/* ── Section: Tasks & Assignments ── */}
                  <div>
                    <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '14px' }}>
                      Tasks &amp; Assignments
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                      {/* Submission status donut */}
                      <div className="glass-card" style={{ padding: '20px' }}>
                        <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: '#f0f6ff', marginBottom: '4px' }}>Submission Status</h3>
                        <p style={{ fontSize: '12px', color: '#475569', marginBottom: '12px' }}>Breakdown of all assignment submissions</p>
                        {mounted && pieData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                              <Pie data={pieData} cx="50%" cy="50%" innerRadius={58} outerRadius={88} paddingAngle={3} dataKey="value">
                                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                              </Pie>
                              <Tooltip content={<ChartTooltip />} />
                              <Legend iconType="circle" iconSize={9} formatter={(v) => <span style={{ color: '#94a3b8', fontSize: '12px' }}>{v}</span>} />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : emptyState('No submissions yet')}
                      </div>

                      {/* Grade distribution bar */}
                      <div className="glass-card" style={{ padding: '20px' }}>
                        <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: '#f0f6ff', marginBottom: '4px' }}>Grade Distribution</h3>
                        <p style={{ fontSize: '12px', color: '#475569', marginBottom: '12px' }}>How grades are spread across submissions</p>
                        {mounted && (dash?.gradedTotal ?? 0) > 0 ? (
                          <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={gradeBarData} barSize={36}>
                              <CartesianGrid vertical={false} {...gridStyle} />
                              <XAxis dataKey="grade" tick={axisStyle} axisLine={false} tickLine={false} />
                              <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                              <Bar dataKey="count" name="Students" radius={[6, 6, 0, 0]}>
                                {gradeBarData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        ) : emptyState('No graded submissions yet')}
                      </div>
                    </div>
                  </div>

                  {/* ── Section: Students ── */}
                  <div>
                    <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '14px' }}>
                      Students
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                      {/* Enrollment per course */}
                      <div className="glass-card" style={{ padding: '20px' }}>
                        <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: '#f0f6ff', marginBottom: '4px' }}>Enrollment by Course</h3>
                        <p style={{ fontSize: '12px', color: '#475569', marginBottom: '12px' }}>Number of students enrolled in each course</p>
                        {mounted && enrollmentData.some(d => d.Students > 0) ? (
                          <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={enrollmentData} layout="vertical" barSize={18}>
                              <CartesianGrid horizontal={false} {...gridStyle} />
                              <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                              <YAxis type="category" dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} width={90} />
                              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                              <Bar dataKey="Students" radius={[0, 6, 6, 0]}>
                                {enrollmentData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        ) : emptyState(enrollmentData.length === 0 ? 'No courses yet' : 'No enrollments yet')}
                      </div>

                      {/* Student activity: submissions + avg grade */}
                      <div className="glass-card" style={{ padding: '20px' }}>
                        <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: '#f0f6ff', marginBottom: '4px' }}>Student Activity</h3>
                        <p style={{ fontSize: '12px', color: '#475569', marginBottom: '12px' }}>Submissions and average grade per student</p>
                        {mounted && studentActivityData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={studentActivityData} barGap={4}>
                              <CartesianGrid vertical={false} {...gridStyle} />
                              <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                              <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                              <Legend iconType="circle" iconSize={9} formatter={(v) => <span style={{ color: '#94a3b8', fontSize: '12px' }}>{v}</span>} />
                              <Bar dataKey="Submissions" fill="#38bdf8" radius={[4, 4, 0, 0]} barSize={14} />
                              <Bar dataKey="Avg Grade" fill="#a78bfa" radius={[4, 4, 0, 0]} barSize={14} />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : emptyState('No student activity yet')}
                      </div>
                    </div>
                  </div>

                  {/* ── Section: Module Progress ── */}
                  <div>
                    <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '14px' }}>
                      Module Progress
                    </h2>
                    <div className="glass-card" style={{ padding: '20px' }}>
                      <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: '#f0f6ff', marginBottom: '4px' }}>Completions by Course</h3>
                      <p style={{ fontSize: '12px', color: '#475569', marginBottom: '12px' }}>Approved vs pending module completions across courses</p>
                      {mounted && moduleData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={240}>
                          <BarChart data={moduleData} barGap={6}>
                            <CartesianGrid vertical={false} {...gridStyle} />
                            <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                            <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                            <Legend iconType="circle" iconSize={9} formatter={(v) => <span style={{ color: '#94a3b8', fontSize: '12px' }}>{v}</span>} />
                            <Bar dataKey="Approved" fill="#34d399" radius={[4, 4, 0, 0]} barSize={20} />
                            <Bar dataKey="Pending" fill="#38bdf8" radius={[4, 4, 0, 0]} barSize={20} />
                            <Bar dataKey="Modules" fill="rgba(255,255,255,0.1)" radius={[4, 4, 0, 0]} barSize={20} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : emptyState('No courses or module activity yet')}
                    </div>
                  </div>

                </div>
              );
            })()}
          </>
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
