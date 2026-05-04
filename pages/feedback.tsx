import { useState } from 'react';
import Layout from '../components/Layout';
import { useApp, COURSES } from '../lib/AppContext';

export default function FeedbackPage() {
  const { currentUser, feedbacks, submitFeedback } = useApp();
  const isAdmin = currentUser?.role === 'admin';
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [courseId, setCourseId] = useState('c1');
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'submit' | 'view'>('submit');

  const handleSubmit = () => {
    if (!rating || !content.trim() || !currentUser) return;
    const course = COURSES.find(c => c.id === courseId);
    submitFeedback({
      studentId: currentUser.id,
      studentName: currentUser.name,
      courseId,
      courseName: course?.title || '',
      rating,
      content,
    });
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setRating(0); setContent(''); }, 3000);
  };

  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
    : '0.0';

  return (
    <Layout title="Feedback">
      <div style={{ padding: '28px', maxWidth: '900px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 800, color: '#f0f6ff', marginBottom: '4px' }}>Course Feedback</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Share your thoughts and help improve the learning experience</p>
        </div>

        {/* Tab switcher */}
        {isAdmin && (
          <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '4px', marginBottom: '24px', width: 'fit-content' }}>
            {(['submit', 'view'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab ? 'rgba(56,189,248,0.15)' : 'none',
                  border: activeTab === tab ? '1px solid rgba(56,189,248,0.3)' : '1px solid transparent',
                  color: activeTab === tab ? '#38bdf8' : '#64748b',
                  borderRadius: '7px', padding: '6px 16px',
                  cursor: 'pointer', fontSize: '13px', fontWeight: 600, textTransform: 'capitalize',
                }}
              >
                {tab === 'submit' ? '✏️ Give Feedback' : `📊 All Reviews (${feedbacks.length})`}
              </button>
            ))}
          </div>
        )}

        {(!isAdmin || activeTab === 'submit') && !submitted && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Submit form */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '17px', fontWeight: 700, color: '#f0f6ff', marginBottom: '20px' }}>
                Leave a Review
              </h2>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Course</label>
                <select
                  value={courseId}
                  onChange={e => setCourseId(e.target.value)}
                  className="field-input"
                >
                  {COURSES.filter(c => c.enrolled).map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rating</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{
                        fontSize: '32px', cursor: 'pointer',
                        filter: (hoverRating || rating) >= star ? 'none' : 'grayscale(1) opacity(0.3)',
                        transition: 'all 0.1s',
                        transform: (hoverRating || rating) >= star ? 'scale(1.1)' : 'scale(1)',
                      }}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                {rating > 0 && (
                  <div style={{ fontSize: '13px', color: '#38bdf8', marginTop: '6px', fontWeight: 500 }}>
                    {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][rating]}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Review</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="What did you enjoy? What could be improved? How has this course impacted your learning?"
                  className="field-input"
                  style={{ minHeight: '120px', resize: 'vertical', fontFamily: 'DM Sans, sans-serif' }}
                />
              </div>

              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={!rating || !content.trim()}
                style={{ width: '100%', justifyContent: 'center', opacity: (!rating || !content.trim()) ? 0.5 : 1 }}
              >
                Submit Feedback →
              </button>
            </div>

            {/* Recent feedback */}
            <div>
              <div style={{
                background: '#161d2e', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '14px', padding: '20px', marginBottom: '14px', textAlign: 'center',
              }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '48px', fontWeight: 800, color: '#fbbf24', marginBottom: '4px' }}>{avgRating}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '6px' }}>
                  {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: '18px', filter: parseFloat(avgRating) >= s ? 'none' : 'grayscale(1) opacity(0.3)' }}>⭐</span>)}
                </div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>Average rating · {feedbacks.length} reviews</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {feedbacks.slice(0, 3).map(fb => (
                  <div key={fb.id} style={{
                    background: '#161d2e', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '12px', padding: '14px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>{fb.studentName}</span>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: '12px', filter: fb.rating >= s ? 'none' : 'grayscale(1) opacity(0.3)' }}>⭐</span>)}
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#38bdf8', marginBottom: '6px' }}>{fb.courseName}</div>
                    <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.6 }}>&quot;{fb.content}&quot;</p>
                    <div style={{ fontSize: '10px', color: '#475569', marginTop: '6px' }}>
                      {new Date(fb.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {submitted && (
          <div style={{
            background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)',
            borderRadius: '16px', padding: '40px', textAlign: 'center', animation: 'fadeIn 0.3s ease',
          }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 800, color: '#34d399', marginBottom: '8px' }}>
              Thank you for your feedback!
            </h2>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Your review helps improve the course for everyone.</p>
          </div>
        )}

        {/* Admin: all reviews */}
        {isAdmin && activeTab === 'view' && (
          <div>
            <div style={{ display: 'flex', gap: '14px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <div className="stat-card" style={{ flex: '1', minWidth: '140px' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Avg Rating</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '36px', fontWeight: 800, color: '#fbbf24' }}>{avgRating} ⭐</div>
              </div>
              {[1,2,3,4,5].reverse().map(star => {
                const count = feedbacks.filter(f => f.rating === star).length;
                const pct = feedbacks.length ? Math.round((count / feedbacks.length) * 100) : 0;
                return (
                  <div key={star} style={{ flex: '2', minWidth: '200px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', whiteSpace: 'nowrap' }}>{star} ⭐</span>
                    <div className="progress-bar" style={{ flex: 1, height: '7px' }}>
                      <div className="progress-fill" style={{ width: `${pct}%`, background: '#fbbf24' }} />
                    </div>
                    <span style={{ fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{count}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {feedbacks.map(fb => (
                <div key={fb.id} className="glass-card" style={{ padding: '18px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#f0f6ff', marginRight: '10px' }}>{fb.studentName}</span>
                      <span style={{ fontSize: '12px', color: '#38bdf8' }}>{fb.courseName}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: '14px', filter: fb.rating >= s ? 'none' : 'grayscale(1) opacity(0.3)' }}>⭐</span>)}
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '8px' }}>&quot;{fb.content}&quot;</p>
                  <div style={{ fontSize: '11px', color: '#475569' }}>
                    {new Date(fb.submittedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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
