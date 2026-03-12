import { useState, useEffect } from 'react';

interface ApiKeyModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ApiKeyModal({ open, onClose }: ApiKeyModalProps) {
  const [geminiKey,  setGeminiKey]  = useState('');
  const [claudeKey,  setClaudeKey]  = useState('');
  const [openaiKey,  setOpenaiKey]  = useState('');
  const [groqKey,    setGroqKey]    = useState('');
  const [showGemini, setShowGemini] = useState(false);
  const [showClaude, setShowClaude] = useState(false);
  const [showOpenai, setShowOpenai] = useState(false);
  const [showGroq,   setShowGroq]   = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open) {
      setGeminiKey(localStorage.getItem('infinityai_gemini_key') || '');
      setClaudeKey(localStorage.getItem('infinityai_claude_key') || '');
      setOpenaiKey(localStorage.getItem('infinityai_openai_key') || '');
      setGroqKey(localStorage.getItem('infinityai_groq_key') || '');
      setSaved(false);
    }
  }, [open]);

  const handleSave = () => {
    if (geminiKey.trim()) localStorage.setItem('infinityai_gemini_key', geminiKey.trim());
    else localStorage.removeItem('infinityai_gemini_key');
    if (claudeKey.trim()) localStorage.setItem('infinityai_claude_key', claudeKey.trim());
    else localStorage.removeItem('infinityai_claude_key');
    if (openaiKey.trim()) localStorage.setItem('infinityai_openai_key', openaiKey.trim());
    else localStorage.removeItem('infinityai_openai_key');
    if (groqKey.trim())   localStorage.setItem('infinityai_groq_key', groqKey.trim());
    else localStorage.removeItem('infinityai_groq_key');
    setSaved(true);
    setTimeout(() => { setSaved(false); setTimeout(() => onClose(), 300); }, 1400);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={`modal-overlay${open ? ' open' : ''}`} onClick={handleOverlayClick}>
      <div className="modal-box">
        <div className="modal-header">
          <div className="modal-header-left">
            <svg className="modal-lock-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <div className="modal-title">API Keys</div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* ── Gemini Key — Free tier highlight ── */}
        <div className="modal-field" style={{
          background: 'rgba(74,222,128,0.04)',
          border: '1px solid rgba(74,222,128,0.15)',
          borderRadius: '10px',
          padding: '12px 14px 10px',
          marginBottom: '14px'
        }}>
          <div className="modal-label">
            <span className="key-dot" style={{ background: '#4ade80', boxShadow: '0 0 6px rgba(74,222,128,0.7)' }} />
            Google Gemini API Key
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              fontSize: '10px', fontWeight: 700, color: '#4ade80',
              background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)',
              borderRadius: '4px', padding: '1px 7px', marginLeft: '6px'
            }}>
              ✦ Free tier available
            </span>
          </div>
          <div className="api-input-wrap">
            <input
              className="api-input"
              type={showGemini ? 'text' : 'password'}
              placeholder="AIzaSy..."
              value={geminiKey}
              style={{ borderColor: geminiKey ? 'rgba(74,222,128,0.4)' : undefined }}
              onChange={e => setGeminiKey(e.target.value)}
            />
            <button className="api-show-btn" onClick={() => setShowGemini(s => !s)}>
              {showGemini ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="modal-hint">
            Get your free key at{' '}
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: '#4ade80' }}>
              aistudio.google.com/app/apikey
            </a>
          </div>
        </div>

        {/* ── Claude Key ── */}
        <div className="modal-field">
          <div className="modal-label">
            <span className="key-dot" style={{ background: '#c084fc' }} />
            Claude API Key
          </div>
          <div className="api-input-wrap">
            <input
              className="api-input"
              type={showClaude ? 'text' : 'password'}
              placeholder="sk-ant-..."
              value={claudeKey}
              onChange={e => setClaudeKey(e.target.value)}
            />
            <button className="api-show-btn" onClick={() => setShowClaude(s => !s)}>
              {showClaude ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="modal-hint">Get your key at <a href="https://console.anthropic.com" target="_blank" rel="noreferrer">console.anthropic.com</a></div>
        </div>

        {/* ── OpenAI Key ── */}
        <div className="modal-field">
          <div className="modal-label">
            <span className="key-dot" style={{ background: '#10b981' }} />
            OpenAI API Key
          </div>
          <div className="api-input-wrap">
            <input
              className="api-input"
              type={showOpenai ? 'text' : 'password'}
              placeholder="sk-proj-..."
              value={openaiKey}
              onChange={e => setOpenaiKey(e.target.value)}
            />
            <button className="api-show-btn" onClick={() => setShowOpenai(s => !s)}>
              {showOpenai ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="modal-hint">Get your key at <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer">platform.openai.com/api-keys</a></div>
        </div>

        {/* ── Groq Key ── */}
        <div className="modal-field">
          <div className="modal-label">
            <span className="key-dot" style={{ background: '#f97316' }} />
            Groq API Key
          </div>
          <div className="api-input-wrap">
            <input
              className="api-input"
              type={showGroq ? 'text' : 'password'}
              placeholder="gsk_..."
              value={groqKey}
              onChange={e => setGroqKey(e.target.value)}
            />
            <button className="api-show-btn" onClick={() => setShowGroq(s => !s)}>
              {showGroq ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="modal-hint">Get your key at <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer">console.groq.com/keys</a></div>
        </div>

        <div className={`modal-saved-badge${saved ? ' show' : ''}`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Keys saved!
        </div>

        <div className="modal-footer">
          <button className="modal-cancel" onClick={onClose}>Cancel</button>
          <button className="modal-save" onClick={handleSave}>Save Keys</button>
        </div>
      </div>
    </div>
  );
}
