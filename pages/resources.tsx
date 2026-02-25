import { useState } from 'react';
import Layout from '../components/Layout';
import { useApp, COURSES } from '../lib/AppContext';

export default function ResourcesPage() {
  const { currentUser, sharedFiles, uploadFile } = useApp();
  const isAdmin = currentUser?.role === 'admin';
  const [filterCourse, setFilterCourse] = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ name: '', courseId: 'c1', type: 'pdf' });
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const filtered = filterCourse === 'all' ? sharedFiles : sharedFiles.filter(f => f.courseId === filterCourse);

  const fileIcons: Record<string, string> = {
    pdf: '📕', pptx: '📊', xlsx: '📗', sql: '🗄️', zip: '📦', py: '🐍', docx: '📘', default: '📄',
  };

  const handleUpload = async () => {
    setUploading(true);
    await new Promise(r => setTimeout(r, 1200));
    const course = COURSES.find(c => c.id === uploadForm.courseId);
    uploadFile({
      id: `f${Date.now()}`,
      name: uploadForm.name + '.' + uploadForm.type,
      type: uploadForm.type,
      size: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
      uploadedBy: currentUser?.name || 'Admin',
      uploadedAt: new Date().toISOString().split('T')[0],
      courseId: uploadForm.courseId,
      courseName: course?.title || '',
      url: '#',
    });
    setUploading(false);
    setUploaded(true);
    setTimeout(() => { setUploaded(false); setShowUpload(false); setUploadForm({ name: '', courseId: 'c1', type: 'pdf' }); }, 2000);
  };

  return (
    <Layout title="Resources">
      <div style={{ padding: '28px', maxWidth: '1000px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 800, color: '#f0f6ff', marginBottom: '4px' }}>Resources</h1>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Course materials, slides, and reference documents</p>
          </div>
          {isAdmin && (
            <button className="btn-primary" onClick={() => setShowUpload(!showUpload)}>
              📤 Upload File
            </button>
          )}
        </div>

        {/* Upload panel */}
        {showUpload && isAdmin && (
          <div style={{
            background: '#161d2e', border: '1px solid rgba(56,189,248,0.2)',
            borderRadius: '14px', padding: '20px', marginBottom: '24px',
            animation: 'fadeIn 0.2s ease',
          }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: '#f0f6ff', marginBottom: '16px' }}>Upload New Resource</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>File Name</label>
                <input
                  value={uploadForm.name}
                  onChange={e => setUploadForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Week 9 Lecture Slides"
                  className="field-input"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Course</label>
                <select
                  value={uploadForm.courseId}
                  onChange={e => setUploadForm(f => ({ ...f, courseId: e.target.value }))}
                  className="field-input"
                >
                  {COURSES.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</label>
                <select
                  value={uploadForm.type}
                  onChange={e => setUploadForm(f => ({ ...f, type: e.target.value }))}
                  className="field-input"
                >
                  {['pdf', 'pptx', 'xlsx', 'docx', 'sql', 'py', 'zip'].map(t => <option key={t} value={t}>.{t}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {uploaded ? (
                <span style={{ color: '#34d399', fontWeight: 600, fontSize: '13px' }}>✅ File uploaded successfully!</span>
              ) : (
                <>
                  <button className="btn-primary" onClick={handleUpload} disabled={!uploadForm.name || uploading}>
                    {uploading ? <><span className="spinner" /> Uploading...</> : '📤 Upload →'}
                  </button>
                  <button className="btn-secondary" onClick={() => setShowUpload(false)}>Cancel</button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Filter */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilterCourse('all')}
            style={{
              background: filterCourse === 'all' ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.04)',
              border: filterCourse === 'all' ? '1px solid rgba(56,189,248,0.3)' : '1px solid rgba(255,255,255,0.07)',
              color: filterCourse === 'all' ? '#38bdf8' : '#94a3b8',
              borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
            }}
          >
            All Files ({sharedFiles.length})
          </button>
          {COURSES.filter(c => c.enrolled).map(course => (
            <button
              key={course.id}
              onClick={() => setFilterCourse(course.id)}
              style={{
                background: filterCourse === course.id ? `${course.color}15` : 'rgba(255,255,255,0.04)',
                border: filterCourse === course.id ? `1px solid ${course.color}40` : '1px solid rgba(255,255,255,0.07)',
                color: filterCourse === course.id ? course.color : '#94a3b8',
                borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              }}
            >
              {course.icon} {course.title.split(' ').slice(0, 2).join(' ')}
            </button>
          ))}
        </div>

        {/* File grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
          {filtered.map(file => (
            <div
              key={file.id}
              className="glass-card"
              style={{ padding: '16px', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0,
                  background: 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                }}>
                  {fileIcons[file.type] || fileIcons.default}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', marginBottom: '2px', wordBreak: 'break-word' }}>
                    {file.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569' }}>{file.size}</div>
                </div>
              </div>
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: '11px', color: '#475569', marginBottom: '4px' }}>
                  📚 {file.courseName.split(' ').slice(0, 3).join(' ')}
                </div>
                <div style={{ fontSize: '11px', color: '#475569', marginBottom: '10px' }}>
                  👩‍🏫 {file.uploadedBy} · {new Date(file.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <button
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '12px', padding: '6px' }}
                >
                  ⬇ Download
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📁</div>
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>No files found</div>
            <div style={{ fontSize: '13px' }}>No resources uploaded for this course yet.</div>
          </div>
        )}
      </div>
    </Layout>
  );
}
