import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { useApp } from '../lib/AppContext';

const CATEGORIES = ['Data Science', 'GenAI', 'Database Management', 'Web Development', 'Cybersecurity', 'Other'];
const ICONS = ['📊', '🤖', '🗄️', '🌐', '🔐', '🐍', '⚡', '🔬', '🧠', '📈', '💻', '🚀'];
const COLORS = ['#38bdf8', '#a78bfa', '#34d399', '#fbbf24', '#f87171', '#fb923c', '#e879f9', '#22d3ee'];

interface CourseData {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: string;
  color: string;
  instructor: string;
  moduleCount: number;
  enrollmentCount: number;
  enrolled: boolean;
}

interface ModuleData {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  topics: string[];
  order: number;
  duration: string | null;
  progress?: {
    id: string;
    status: string;
    submittedAt?: string | null;
    approvedAt?: string | null;
    feedback?: string | null;
  } | null;
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: '#94a3b8',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const statusMeta = (status: string) => {
  switch (status) {
    case 'approved': return { color: '#34d399', label: 'Completed ✓', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.25)' };
    case 'submitted': return { color: '#38bdf8', label: 'Pending Review ⏳', bg: 'rgba(56,189,248,0.08)', border: 'rgba(56,189,248,0.2)' };
    case 'unlocked': return { color: '#fbbf24', label: 'Available', bg: 'rgba(251,191,36,0.07)', border: 'rgba(251,191,36,0.2)' };
    case 'rejected': return { color: '#f87171', label: 'Needs Revision', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' };
    default: return { color: '#475569', label: 'Locked 🔒', bg: 'rgba(255,255,255,0.02)', border: 'rgba(255,255,255,0.05)' };
  }
};

export default function CoursesPage() {
  const { currentUser } = useApp();
  const isAdmin = currentUser?.role === 'admin';

  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'modules'>('list');
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [modulesLoading, setModulesLoading] = useState(false);

  // Admin: course form
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseData | null>(null);
  const [courseForm, setCourseForm] = useState({
    title: '', category: 'Data Science', description: '', icon: '📊', color: '#38bdf8', instructor: '',
  });
  const [courseFormError, setCourseFormError] = useState('');
  const [courseFormLoading, setCourseFormLoading] = useState(false);

  // Admin: module form
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleData | null>(null);
  const [moduleForm, setModuleForm] = useState({ title: '', description: '', duration: '', topicInput: '' });
  const [moduleTopics, setModuleTopics] = useState<string[]>([]);
  const [moduleFormLoading, setModuleFormLoading] = useState(false);

  // Student actions
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/courses');
      if (res.ok) setCourses((await res.json()).courses);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const fetchModules = useCallback(async (course: CourseData) => {
    setModulesLoading(true);
    try {
      const url = isAdmin ? `/api/courses/${course.id}` : `/api/courses/${course.id}/progress`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setModules(isAdmin ? data.course.modules : data.modules);
      }
    } finally {
      setModulesLoading(false);
    }
  }, [isAdmin]);

  const openCourse = (course: CourseData) => {
    setSelectedCourse(course);
    setView('modules');
    setShowModuleForm(false);
    setEditingModule(null);
    fetchModules(course);
  };

  const goBack = () => {
    setView('list');
    setSelectedCourse(null);
    setModules([]);
    setShowModuleForm(false);
    setEditingModule(null);
  };

  // --- Course CRUD ---
  const openCreateCourse = () => {
    setEditingCourse(null);
    setCourseForm({ title: '', category: 'Data Science', description: '', icon: '📊', color: '#38bdf8', instructor: '' });
    setCourseFormError('');
    setShowCourseForm(true);
  };

  const openEditCourse = (course: CourseData) => {
    setEditingCourse(course);
    setCourseForm({ title: course.title, category: course.category, description: course.description, icon: course.icon, color: course.color, instructor: course.instructor });
    setCourseFormError('');
    setShowCourseForm(true);
  };

  const handleSaveCourse = async () => {
    if (!courseForm.title.trim() || !courseForm.instructor.trim()) {
      setCourseFormError('Title and instructor are required');
      return;
    }
    setCourseFormLoading(true);
    try {
      const url = editingCourse ? `/api/courses/${editingCourse.id}` : '/api/courses';
      const method = editingCourse ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm),
      });
      if (res.ok) {
        await fetchCourses();
        setShowCourseForm(false);
        setCourseFormError('');
        if (editingCourse && selectedCourse?.id === editingCourse.id) {
          const updated = (await fetch('/api/courses').then(r => r.json())).courses.find((c: CourseData) => c.id === editingCourse.id);
          if (updated) setSelectedCourse(updated);
        }
      } else {
        const data = await res.json();
        setCourseFormError(data.error || 'Failed to save course');
      }
    } finally {
      setCourseFormLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Delete this course and all its modules? This cannot be undone.')) return;
    await fetch(`/api/courses/${courseId}`, { method: 'DELETE' });
    await fetchCourses();
    if (selectedCourse?.id === courseId) goBack();
  };

  // --- Module CRUD ---
  const openAddModule = () => {
    setEditingModule(null);
    setModuleForm({ title: '', description: '', duration: '', topicInput: '' });
    setModuleTopics([]);
    setShowModuleForm(true);
  };

  const openEditModule = (mod: ModuleData) => {
    setEditingModule(mod);
    setModuleForm({ title: mod.title, description: mod.description || '', duration: mod.duration || '', topicInput: '' });
    setModuleTopics([...mod.topics]);
    setShowModuleForm(true);
  };

  const handleSaveModule = async () => {
    if (!moduleForm.title.trim() || !selectedCourse) return;
    setModuleFormLoading(true);
    try {
      const url = editingModule ? `/api/modules/${editingModule.id}` : `/api/courses/${selectedCourse.id}/modules`;
      const method = editingModule ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: moduleForm.title, description: moduleForm.description, topics: moduleTopics, duration: moduleForm.duration }),
      });
      if (res.ok) {
        await fetchModules(selectedCourse);
        setShowModuleForm(false);
        setEditingModule(null);
      }
    } finally {
      setModuleFormLoading(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Delete this module?')) return;
    await fetch(`/api/modules/${moduleId}`, { method: 'DELETE' });
    if (selectedCourse) await fetchModules(selectedCourse);
  };

  const addTopic = () => {
    const t = moduleForm.topicInput.trim();
    if (t) {
      setModuleTopics(prev => [...prev, t]);
      setModuleForm(f => ({ ...f, topicInput: '' }));
    }
  };

  // --- Student actions ---
  const handleEnroll = async (course: CourseData) => {
    setEnrolling(course.id);
    try {
      const res = await fetch(`/api/courses/${course.id}/enroll`, { method: 'POST' });
      if (res.ok) {
        await fetchCourses();
        openCourse({ ...course, enrolled: true });
      }
    } finally {
      setEnrolling(null);
    }
  };

  const handleSubmitModule = async (moduleId: string) => {
    setSubmitting(moduleId);
    try {
      const res = await fetch(`/api/modules/${moduleId}/submit`, { method: 'POST' });
      if (res.ok && selectedCourse) await fetchModules(selectedCourse);
    } finally {
      setSubmitting(null);
    }
  };

  // --- Computed ---
  const enrolledCourses = courses.filter(c => c.enrolled);
  const availableCourses = courses.filter(c => !c.enrolled);
  const approvedModules = modules.filter(m => m.progress?.status === 'approved').length;
  const progressPct = modules.length ? Math.round((approvedModules / modules.length) * 100) : 0;

  return (
    <Layout title={isAdmin ? 'Manage Courses' : 'My Courses'}>
      <div style={{ padding: '28px', maxWidth: '1200px' }}>

        {/* ===== COURSE LIST VIEW ===== */}
        {view === 'list' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 800, color: '#f0f6ff', marginBottom: '4px' }}>
                  {isAdmin ? 'Course Management' : 'My Courses'}
                </h1>
                <p style={{ color: '#64748b', fontSize: '14px' }}>
                  {isAdmin ? 'Create and manage course content for your students' : 'Enroll in courses and track your module progress'}
                </p>
              </div>
              {isAdmin && (
                <button className="btn-primary" onClick={openCreateCourse} style={{ flexShrink: 0 }}>
                  + Create Course
                </button>
              )}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>
                <div className="spinner" style={{ margin: '0 auto 12px' }} />
                <div>Loading courses...</div>
              </div>
            ) : (
              <>
                {/* Admin: all courses */}
                {isAdmin && (
                  <>
                    {courses.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '60px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>📚</div>
                        <div style={{ fontSize: '16px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>No courses yet</div>
                        <div style={{ fontSize: '13px', color: '#475569', marginBottom: '20px' }}>Create your first course to get started</div>
                        <button className="btn-primary" onClick={openCreateCourse}>+ Create Course</button>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                        {courses.map(course => (
                          <div key={course.id} className="glass-card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                              <div style={{
                                width: '52px', height: '52px', borderRadius: '14px',
                                background: `${course.color}20`, border: `1px solid ${course.color}30`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px',
                              }}>
                                {course.icon}
                              </div>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  onClick={() => openEditCourse(course)}
                                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', fontSize: '12px', color: '#94a3b8' }}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteCourse(course.id)}
                                  style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', fontSize: '12px', color: '#f87171' }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: course.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              {course.category}
                            </span>
                            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '17px', fontWeight: 700, color: '#f0f6ff', margin: '5px 0 6px' }}>
                              {course.title}
                            </h3>
                            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px', lineHeight: 1.6 }}>{course.description}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                              <span style={{ fontSize: '12px', color: '#64748b' }}>👤 {course.instructor}</span>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>📦 {course.moduleCount} modules</span>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>👥 {course.enrollmentCount} students</span>
                              </div>
                            </div>
                            <button
                              className="btn-primary"
                              onClick={() => openCourse(course)}
                              style={{ width: '100%', justifyContent: 'center', fontSize: '13px' }}
                            >
                              Manage Modules →
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Student: enrolled + available */}
                {!isAdmin && (
                  <>
                    {enrolledCourses.length > 0 && (
                      <>
                        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: '#f0f6ff', marginBottom: '14px' }}>
                          My Enrolled Courses ({enrolledCourses.length})
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '18px', marginBottom: '36px' }}>
                          {enrolledCourses.map(course => (
                            <div
                              key={course.id}
                              className="glass-card"
                              style={{ padding: '22px', cursor: 'pointer', borderColor: `${course.color}30` }}
                              onClick={() => openCourse(course)}
                            >
                              <div style={{
                                width: '50px', height: '50px', borderRadius: '14px',
                                background: `${course.color}20`, border: `1px solid ${course.color}30`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '14px',
                              }}>
                                {course.icon}
                              </div>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: course.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                {course.category}
                              </span>
                              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: '#f0f6ff', margin: '5px 0 6px' }}>
                                {course.title}
                              </h3>
                              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>{course.description}</p>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                                <span>{course.moduleCount} modules</span>
                                <span style={{ color: course.color, fontWeight: 600 }}>View Modules →</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: '#f0f6ff', marginBottom: '14px' }}>
                      {enrolledCourses.length === 0 ? 'Available Courses' : `All Courses (${availableCourses.length} available)`}
                    </h2>
                    {availableCourses.length === 0 && enrolledCourses.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
                        <div style={{ fontSize: '16px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>No courses available yet</div>
                        <div style={{ fontSize: '13px' }}>Check back soon — your tutor will add courses shortly.</div>
                      </div>
                    ) : availableCourses.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#475569' }}>
                        <div style={{ fontSize: '14px' }}>You are enrolled in all available courses 🎉</div>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '18px' }}>
                        {availableCourses.map(course => (
                          <div key={course.id} className="glass-card" style={{ padding: '22px' }}>
                            <div style={{
                              width: '50px', height: '50px', borderRadius: '14px',
                              background: `${course.color}15`, border: `1px solid ${course.color}25`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '14px',
                            }}>
                              {course.icon}
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: course.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              {course.category}
                            </span>
                            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: '#f0f6ff', margin: '5px 0 6px' }}>
                              {course.title}
                            </h3>
                            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>{course.description}</p>
                            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
                              👤 {course.instructor} &nbsp;·&nbsp; 📦 {course.moduleCount} modules
                            </div>
                            <button
                              className="btn-primary"
                              style={{ width: '100%', justifyContent: 'center', fontSize: '13px', opacity: enrolling === course.id ? 0.7 : 1 }}
                              disabled={enrolling === course.id}
                              onClick={() => handleEnroll(course)}
                            >
                              {enrolling === course.id ? <><span className="spinner" /> Enrolling...</> : 'Enroll Now →'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}

        {/* ===== MODULE VIEW ===== */}
        {view === 'modules' && selectedCourse && (
          <div>
            <button
              onClick={goBack}
              style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px', padding: 0 }}
            >
              ← Back to Courses
            </button>

            {/* Course header */}
            <div style={{
              background: `linear-gradient(135deg, ${selectedCourse.color}12, transparent)`,
              border: `1px solid ${selectedCourse.color}25`,
              borderRadius: '16px', padding: '22px', marginBottom: '24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '60px', height: '60px', borderRadius: '16px',
                  background: `${selectedCourse.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px',
                }}>
                  {selectedCourse.icon}
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: selectedCourse.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {selectedCourse.category}
                  </span>
                  <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 800, color: '#f0f6ff', margin: '3px 0 3px' }}>
                    {selectedCourse.title}
                  </h2>
                  <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                    {isAdmin
                      ? `${modules.length} modules · ${selectedCourse.enrollmentCount} students enrolled`
                      : `by ${selectedCourse.instructor} · ${modules.length} modules`}
                  </p>
                </div>
              </div>
              {!isAdmin && modules.length > 0 && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '30px', fontWeight: 800, color: selectedCourse.color }}>
                    {progressPct}%
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{approvedModules}/{modules.length} complete</div>
                </div>
              )}
              {isAdmin && (
                <button className="btn-primary" onClick={openAddModule} style={{ flexShrink: 0, fontSize: '13px' }}>
                  + Add Module
                </button>
              )}
            </div>

            {/* Module form (admin) */}
            {isAdmin && showModuleForm && (
              <div className="glass-card" style={{ padding: '24px', marginBottom: '20px', border: `1px solid ${selectedCourse.color}30` }}>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: '#f0f6ff', marginBottom: '18px' }}>
                  {editingModule ? 'Edit Module' : 'Add New Module'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={labelStyle}>Module Title *</label>
                    <input
                      className="field-input"
                      placeholder="e.g. Introduction to Pandas"
                      value={moduleForm.title}
                      onChange={e => setModuleForm(f => ({ ...f, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Duration</label>
                    <input
                      className="field-input"
                      placeholder="e.g. 3 hours"
                      value={moduleForm.duration}
                      onChange={e => setModuleForm(f => ({ ...f, duration: e.target.value }))}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>Description</label>
                  <textarea
                    className="field-input"
                    placeholder="Brief overview of what this module covers..."
                    value={moduleForm.description}
                    onChange={e => setModuleForm(f => ({ ...f, description: e.target.value }))}
                    rows={2}
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Topics Covered</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      className="field-input"
                      placeholder="Add a topic and press Enter or +"
                      value={moduleForm.topicInput}
                      onChange={e => setModuleForm(f => ({ ...f, topicInput: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTopic(); } }}
                      style={{ flex: 1 }}
                    />
                    <button
                      onClick={addTopic}
                      style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '10px', padding: '0 14px', cursor: 'pointer', color: '#38bdf8', fontWeight: 700, fontSize: '18px' }}
                    >
                      +
                    </button>
                  </div>
                  {moduleTopics.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {moduleTopics.map((topic, i) => (
                        <span
                          key={i}
                          style={{
                            background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)',
                            borderRadius: '20px', padding: '4px 12px', fontSize: '12px', color: '#38bdf8',
                            display: 'flex', alignItems: 'center', gap: '6px',
                          }}
                        >
                          {topic}
                          <button
                            onClick={() => setModuleTopics(prev => prev.filter((_, idx) => idx !== i))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '14px', lineHeight: 1, padding: 0 }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className="btn-primary"
                    onClick={handleSaveModule}
                    disabled={moduleFormLoading || !moduleForm.title.trim()}
                    style={{ opacity: moduleFormLoading ? 0.7 : 1 }}
                  >
                    {moduleFormLoading ? <><span className="spinner" /> Saving...</> : editingModule ? 'Save Changes' : 'Add Module'}
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => { setShowModuleForm(false); setEditingModule(null); }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Module list */}
            {modulesLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#475569' }}>
                <div className="spinner" style={{ margin: '0 auto 10px' }} />
                <div>Loading modules...</div>
              </div>
            ) : modules.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>No modules yet</div>
                {isAdmin && <div style={{ fontSize: '13px' }}>Add your first module using the button above.</div>}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {modules.map((mod, i) => {
                  const status = mod.progress?.status || 'locked';
                  const meta = statusMeta(status);
                  const isLocked = status === 'locked';
                  const isUnlocked = status === 'unlocked';
                  const isSubmitted = status === 'submitted';
                  const isRejected = status === 'rejected';

                  return (
                    <div
                      key={mod.id}
                      style={{
                        background: meta.bg,
                        border: `1px solid ${meta.border}`,
                        borderRadius: '14px',
                        padding: '18px 20px',
                        opacity: isLocked ? 0.55 : 1,
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                        {/* Order badge */}
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, marginTop: '2px',
                          background: isLocked ? 'rgba(255,255,255,0.05)' : `${meta.color}18`,
                          border: `2px solid ${meta.color}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '13px', fontWeight: 700, color: meta.color,
                        }}>
                          {status === 'approved' ? '✓' : isLocked ? '🔒' : i + 1}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: isLocked ? '#64748b' : '#e2e8f0' }}>
                              Module {i + 1}: {mod.title}
                            </span>
                            <span style={{
                              fontSize: '11px', fontWeight: 600, color: meta.color,
                              background: `${meta.color}15`, border: `1px solid ${meta.color}30`,
                              borderRadius: '20px', padding: '2px 8px',
                            }}>
                              {meta.label}
                            </span>
                          </div>
                          {mod.description && (
                            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', lineHeight: 1.5 }}>
                              {mod.description}
                            </p>
                          )}
                          {mod.topics.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '8px' }}>
                              {mod.topics.map((t, ti) => (
                                <span
                                  key={ti}
                                  style={{
                                    fontSize: '11px', color: '#94a3b8',
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '20px', padding: '2px 8px',
                                  }}
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                          {mod.duration && (
                            <span style={{ fontSize: '11px', color: '#475569' }}>⏱ {mod.duration}</span>
                          )}
                          {/* Student: feedback from admin */}
                          {!isAdmin && mod.progress?.feedback && (
                            <div style={{
                              marginTop: '8px', padding: '8px 12px',
                              background: isRejected ? 'rgba(248,113,113,0.08)' : 'rgba(52,211,153,0.07)',
                              border: `1px solid ${isRejected ? 'rgba(248,113,113,0.2)' : 'rgba(52,211,153,0.15)'}`,
                              borderRadius: '8px', fontSize: '12px',
                              color: isRejected ? '#f87171' : '#34d399',
                            }}>
                              💬 Tutor: {mod.progress.feedback}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                          {isAdmin && (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                onClick={() => openEditModule(mod)}
                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', fontSize: '12px', color: '#94a3b8' }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteModule(mod.id)}
                                style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', fontSize: '12px', color: '#f87171' }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                          {!isAdmin && isUnlocked && (
                            <button
                              className="btn-primary"
                              style={{ fontSize: '12px', padding: '7px 14px', opacity: submitting === mod.id ? 0.7 : 1 }}
                              disabled={submitting === mod.id}
                              onClick={() => handleSubmitModule(mod.id)}
                            >
                              {submitting === mod.id ? <><span className="spinner" /> Submitting...</> : 'Submit for Review →'}
                            </button>
                          )}
                          {!isAdmin && isSubmitted && (
                            <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 600 }}>Waiting for approval...</span>
                          )}
                          {!isAdmin && isRejected && (
                            <button
                              className="btn-primary"
                              style={{ fontSize: '12px', padding: '7px 14px', background: 'linear-gradient(135deg, #f87171, #ef4444)', opacity: submitting === mod.id ? 0.7 : 1 }}
                              disabled={submitting === mod.id}
                              onClick={() => handleSubmitModule(mod.id)}
                            >
                              {submitting === mod.id ? <><span className="spinner" /> Resubmitting...</> : 'Resubmit →'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== COURSE FORM MODAL ===== */}
      {isAdmin && showCourseForm && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
          }}
          onClick={e => { if (e.target === e.currentTarget) setShowCourseForm(false); }}
        >
          <div style={{
            background: '#161d2e', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '520px',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, color: '#f0f6ff', marginBottom: '22px' }}>
              {editingCourse ? 'Edit Course' : 'Create New Course'}
            </h2>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Course Title *</label>
              <input
                className="field-input"
                placeholder="e.g. Introduction to Data Science"
                value={courseForm.title}
                onChange={e => setCourseForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={labelStyle}>Category *</label>
                <select
                  className="field-input"
                  value={courseForm.category}
                  onChange={e => setCourseForm(f => ({ ...f, category: e.target.value }))}
                  style={{ cursor: 'pointer' }}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Instructor *</label>
                <input
                  className="field-input"
                  placeholder="Instructor name"
                  value={courseForm.instructor}
                  onChange={e => setCourseForm(f => ({ ...f, instructor: e.target.value }))}
                />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Description *</label>
              <textarea
                className="field-input"
                placeholder="What will students learn in this course?"
                value={courseForm.description}
                onChange={e => setCourseForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Course Icon</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {ICONS.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setCourseForm(f => ({ ...f, icon }))}
                    style={{
                      width: '42px', height: '42px', borderRadius: '10px', fontSize: '22px',
                      background: courseForm.icon === icon ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${courseForm.icon === icon ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`,
                      cursor: 'pointer',
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '22px' }}>
              <label style={labelStyle}>Accent Color</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setCourseForm(f => ({ ...f, color }))}
                    style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: color, cursor: 'pointer',
                      border: courseForm.color === color ? '2px solid white' : '2px solid transparent',
                      boxShadow: courseForm.color === color ? `0 0 10px ${color}80` : 'none',
                    }}
                  />
                ))}
              </div>
            </div>

            {courseFormError && (
              <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#f87171' }}>
                {courseFormError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn-primary"
                onClick={handleSaveCourse}
                disabled={courseFormLoading}
                style={{ flex: 1, justifyContent: 'center', opacity: courseFormLoading ? 0.7 : 1 }}
              >
                {courseFormLoading ? <><span className="spinner" /> Saving...</> : editingCourse ? 'Save Changes' : 'Create Course'}
              </button>
              <button className="btn-secondary" onClick={() => setShowCourseForm(false)} style={{ flex: 1, justifyContent: 'center' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
