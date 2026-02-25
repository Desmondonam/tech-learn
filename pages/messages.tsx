import { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import { useApp } from '../lib/AppContext';

export default function MessagesPage() {
  const { currentUser, conversations, sendMessage } = useApp();
  const [activeConvId, setActiveConvId] = useState<string | null>(conversations[0]?.id || null);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find(c => c.id === activeConvId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  const handleSend = () => {
    if (!activeConvId || !input.trim()) return;
    sendMessage(activeConvId, input.trim());
    setInput('');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Layout title="Messages">
      <div style={{ height: 'calc(100vh - 60px)', display: 'flex', overflow: 'hidden' }}>
        {/* Conversation list */}
        <div style={{
          width: '280px', flexShrink: 0,
          background: '#0f1623',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: '#f0f6ff', marginBottom: '12px' }}>Messages</h2>
            <input type="text" placeholder="Search conversations..." className="field-input" style={{ fontSize: '13px' }} />
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                style={{
                  padding: '14px 16px', cursor: 'pointer', transition: 'background 0.15s',
                  background: activeConvId === conv.id ? 'rgba(56,189,248,0.08)' : 'transparent',
                  borderLeft: activeConvId === conv.id ? '2px solid #38bdf8' : '2px solid transparent',
                }}
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                    background: conv.participantRole === 'admin'
                      ? 'linear-gradient(135deg, #a78bfa, #7c3aed)'
                      : 'linear-gradient(135deg, #38bdf8, #0284c7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px', color: 'white',
                  }}>
                    {conv.participantName.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {conv.participantName}
                      </span>
                      <span style={{ fontSize: '10px', color: '#475569', flexShrink: 0, marginLeft: '6px' }}>{conv.lastTime}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {conv.lastMessage}
                      </span>
                      {conv.unread > 0 && (
                        <span style={{
                          background: '#38bdf8', color: 'white', borderRadius: '100px',
                          padding: '1px 6px', fontSize: '10px', fontWeight: 700, flexShrink: 0, marginLeft: '6px',
                        }}>{conv.unread}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* No conversations hint */}
            {conversations.length === 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#475569' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
                <div style={{ fontSize: '13px' }}>No conversations yet</div>
              </div>
            )}
          </div>
        </div>

        {/* Chat panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {activeConv ? (
            <>
              {/* Chat header */}
              <div style={{
                padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', gap: '12px',
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: activeConv.participantRole === 'admin'
                    ? 'linear-gradient(135deg, #a78bfa, #7c3aed)'
                    : 'linear-gradient(135deg, #38bdf8, #0284c7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px', color: 'white',
                }}>
                  {activeConv.participantName.charAt(0)}
                </div>
                <div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: '#f0f6ff' }}>
                    {activeConv.participantName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
                    {activeConv.participantRole === 'admin' ? 'Course Tutor' : 'Student'}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div style={{
                flex: 1, overflowY: 'auto', padding: '20px 24px',
                display: 'flex', flexDirection: 'column', gap: '14px',
              }}>
                {activeConv.messages.map((msg, i) => {
                  const isMine = msg.senderId === currentUser?.id;
                  const showDate = i === 0 || new Date(msg.timestamp).toDateString() !== new Date(activeConv.messages[i-1]?.timestamp).toDateString();
                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div style={{ textAlign: 'center', margin: '8px 0' }}>
                          <span style={{ fontSize: '11px', color: '#475569', background: 'rgba(255,255,255,0.04)', borderRadius: '100px', padding: '3px 12px' }}>
                            {new Date(msg.timestamp).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start', gap: '4px', animation: 'fadeIn 0.2s ease' }}>
                        {!isMine && (
                          <span style={{ fontSize: '11px', color: '#64748b', paddingLeft: '4px', fontWeight: 600 }}>{msg.senderName}</span>
                        )}
                        <div className={isMine ? 'chat-bubble-sent' : 'chat-bubble-received'}>
                          <p style={{ fontSize: '14px', lineHeight: 1.5, margin: 0 }}>{msg.content}</p>
                        </div>
                        <span style={{ fontSize: '10px', color: '#475569', paddingLeft: '4px', paddingRight: '4px' }}>{formatTime(msg.timestamp)}</span>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{
                padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', gap: '10px', alignItems: 'flex-end',
              }}>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Type a message... (Enter to send)"
                  className="field-input"
                  style={{ flex: 1, resize: 'none', minHeight: '44px', maxHeight: '120px', fontFamily: 'DM Sans, sans-serif' }}
                  rows={1}
                />
                <button
                  className="btn-primary"
                  onClick={handleSend}
                  disabled={!input.trim()}
                  style={{ height: '44px', opacity: input.trim() ? 1 : 0.5 }}
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px', color: '#475569' }}>
              <div style={{ fontSize: '64px' }}>💬</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, color: '#64748b' }}>Select a conversation</div>
              <div style={{ fontSize: '13px' }}>Choose a chat from the left to start messaging</div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
