import { useState } from 'react';
import Layout from '../components/Layout';
import { COURSES, MODULES } from '../lib/AppContext';

export default function CoursesPage() {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const enrolledCourses = COURSES.filter(c => c.enrolled);
  const selectedCourseData = enrolledCourses.find(c => c.id === selectedCourse);
  const courseModules = MODULES.filter(m => m.courseId === selectedCourse);

  return (
    <Layout title="My Courses">
      <div style={{ padding: '28px', maxWidth: '1200px' }}>
        {!selectedCourse ? (
          <>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 800, color: '#f0f6ff', marginBottom: '6px' }}>My Courses</h1>
              <p style={{ color: '#64748b', fontSize: '14px' }}>Track your progress across all enrolled courses</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {enrolledCourses.map(course => {
                const pct = Math.round(((course.completedModules || 0) / course.modules) * 100);
                return (
                  <div
                    key={course.id}
                    className="glass-card"
                    style={{ padding: '24px', cursor: 'pointer' }}
                    onClick={() => setSelectedCourse(course.id)}
                  >
                    <div style={{
                      width: '56px', height: '56px', borderRadius: '14px',
                      background: `${course.color}20`, border: `1px solid ${course.color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '28px', marginBottom: '16px',
                    }}>
                      {course.icon}
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: course.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {course.category}
                    </span>
                    <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, color: '#f0f6ff', margin: '6px 0 8px' }}>
                      {course.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px', lineHeight: 1.6 }}>{course.description}</p>

                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Progress</span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: course.color }}>{pct}%</span>
                      </div>
                      <div className="progress-bar" style={{ height: '7px' }}>
                        <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${course.color}, ${course.color}88)` }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{course.completedModules}/{course.modules} modules</span>
                      <button className="btn-primary" style={{ fontSize: '12px', padding: '6px 14px' }}>
                        {pct === 0 ? 'Start →' : pct === 100 ? 'Review →' : 'Continue →'}
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Locked course */}
              {COURSES.filter(c => !c.enrolled).map(course => (
                <div key={course.id} className="glass-card" style={{ padding: '24px', opacity: 0.5 }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '16px' }}>
                    🔒
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{course.category}</span>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, color: '#64748b', margin: '6px 0 8px' }}>{course.title}</h3>
                  <p style={{ fontSize: '13px', color: '#475569', marginBottom: '16px' }}>{course.description}</p>
                  <button className="btn-secondary" style={{ fontSize: '12px', padding: '6px 14px' }}>Coming Soon</button>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Module View */
          <div>
            <button
              onClick={() => setSelectedCourse(null)}
              style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px', padding: 0 }}
            >
              ← Back to Courses
            </button>

            {selectedCourseData && (
              <div style={{
                background: `linear-gradient(135deg, ${selectedCourseData.color}15, transparent)`,
                border: `1px solid ${selectedCourseData.color}30`,
                borderRadius: '16px', padding: '24px', marginBottom: '24px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '16px',
                    background: `${selectedCourseData.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px',
                  }}>{selectedCourseData.icon}</div>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: selectedCourseData.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{selectedCourseData.category}</span>
                    <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 800, color: '#f0f6ff', margin: '4px 0 4px' }}>{selectedCourseData.title}</h2>
                    <p style={{ fontSize: '13px', color: '#94a3b8' }}>by {selectedCourseData.instructor} · {selectedCourseData.modules} modules</p>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '32px', fontWeight: 800, color: selectedCourseData.color }}>
                      {Math.round(((selectedCourseData.completedModules || 0) / selectedCourseData.modules) * 100)}%
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Complete</div>
                  </div>
                </div>
              </div>
            )}

            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: '#f0f6ff', marginBottom: '16px' }}>
              Modules ({courseModules.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {courseModules.map((mod, i) => (
                <div
                  key={mod.id}
                  style={{
                    background: mod.completed ? 'rgba(52,211,153,0.06)' : mod.progress ? 'rgba(56,189,248,0.06)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${mod.completed ? 'rgba(52,211,153,0.2)' : mod.progress ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: '12px', padding: '16px 20px',
                    display: 'flex', alignItems: 'center', gap: '16px',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                    background: mod.completed ? '#34d39920' : mod.progress ? '#38bdf820' : 'rgba(255,255,255,0.06)',
                    border: `2px solid ${mod.completed ? '#34d399' : mod.progress ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', fontWeight: 700,
                    color: mod.completed ? '#34d399' : mod.progress ? '#38bdf8' : '#64748b',
                  }}>
                    {mod.completed ? '✓' : mod.progress ? '▶' : i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>{mod.title}</span>
                      {mod.progress && !mod.completed && (
                        <span className="badge badge-info">{mod.progress}% done</span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{mod.description}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>⏱ {mod.duration}</div>
                    {mod.completed && <div style={{ fontSize: '11px', color: '#34d399', fontWeight: 600 }}>Completed ✓</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
