import { useCallback, useEffect, useRef, useState } from 'react';
import Sidebar from './components/Sidebar';
import ModelDropdown from './components/ModelDropdown';
import ApiKeyModal from './components/ApiKeyModal';
import MessageBubble, { TypingIndicator } from './components/MessageBubble';
import PreviewPanel from './components/PreviewPanel';
import OrbCanvas from './components/OrbCanvas';
import { MODELS, type Message, type ModelOption } from './types';

const SYSTEM_PROMPT = `You are Infinity AI — a smart, creative AI assistant built for developers and creators.
Help with anything: coding, writing, brainstorming, planning.
When generating HTML/CSS/JS that should be rendered, put ALL of it in ONE \`\`\`html code block so users can preview it.
For JS-only answers, use \`\`\`javascript. For CSS-only, use \`\`\`css.
Always use fenced code blocks with language tags.`;

// Pre-seed the provided OpenAI key if not already saved
const BUNDLED_OPENAI_KEY = '';
// Always store the latest bundled key (overrides any old cached key)
localStorage.setItem('infinityai_openai_key', BUNDLED_OPENAI_KEY);

const BUNDLED_GROQ_KEY = '';
localStorage.setItem('infinityai_groq_key', BUNDLED_GROQ_KEY);

function getSavedModel(): ModelOption {
  const id = localStorage.getItem('infinityai_model');
  return MODELS.find(m => m.id === id) ?? MODELS[0];
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [currentModel, setCurrentModel] = useState<ModelOption>(getSavedModel);
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      chatAreaRef.current?.scrollTo({ top: chatAreaRef.current.scrollHeight, behavior: 'smooth' });
    }, 50);
  };

  useEffect(scrollToBottom, [messages]);

  const handleModelSelect = (model: ModelOption) => {
    setCurrentModel(model);
    localStorage.setItem('infinityai_model', model.id);
    localStorage.setItem('infinityai_model_name', model.name);
    localStorage.setItem('infinityai_model_dot', model.dot);
  };

  const autoGrow = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  };

  const sendMsg = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || busy) return;

    const claudeKey = localStorage.getItem('infinityai_claude_key') || '';
    const geminiKey = localStorage.getItem('infinityai_gemini_key') || '';
    const openaiKey = localStorage.getItem('infinityai_openai_key') || '';
    const groqKey   = localStorage.getItem('infinityai_groq_key') || '';

    const isGemini  = currentModel.dot === 'gemini-opt';
    const isOpenAI  = currentModel.dot === 'openai-opt';
    const isGroq    = currentModel.dot === 'groq-opt';

    if (isGemini && !geminiKey)   { alert('Please add your Gemini API key first.');  setApiModalOpen(true); return; }
    if (isOpenAI && !openaiKey)   { alert('Please add your OpenAI API key first.');  setApiModalOpen(true); return; }
    if (isGroq   && !groqKey)     { alert('Please add your Groq API key first.');    setApiModalOpen(true); return; }
    if (!isGemini && !isOpenAI && !isGroq && !claudeKey) { alert('Please add your Claude API key first.'); setApiModalOpen(true); return; }

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    if (textareaRef.current) { textareaRef.current.style.height = 'auto'; }
    setBusy(true);

    try {
      let aiText = '';

      if (isGemini) {
        // ── Google Gemini ──
        const body = {
          contents: [
            { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
            ...history.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] }))
          ]
        };
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${currentModel.id}:generateContent?key=${geminiKey}`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || 'Gemini error');
        aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '(No response)';

      } else if (isOpenAI) {
        // ── OpenAI ──
        const isO1 = currentModel.id.startsWith('o1') || currentModel.id.startsWith('o3');
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: currentModel.id,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              ...history.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content }))
            ],
            ...(isO1 ? { max_completion_tokens: 4096 } : { max_tokens: 4096 }),
          })
        });
        const data = await res.json();
        if (!res.ok) {
          const errMsg = data.error?.message || 'OpenAI error';
          const errCode = data.error?.code || data.error?.type || '';
          if (errCode === 'insufficient_quota' || errMsg.includes('quota') || errMsg.includes('billing')) {
            throw new Error('OpenAI quota exceeded. Please add billing credits at platform.openai.com/billing, then enter a fresh API key via the API Key button.');
          } else if (res.status === 401) {
            throw new Error('Invalid OpenAI API key. Please update it via the API Key button.');
          } else if (res.status === 429) {
            throw new Error('OpenAI rate limit hit. Please wait a moment and try again.');
          }
          throw new Error(errMsg);
        }
        aiText = data.choices?.[0]?.message?.content || '(No response)';

      } else if (isGroq) {
        // ── Groq ──
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: currentModel.id,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              ...history.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content }))
            ]
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || 'Groq error');
        aiText = data.choices?.[0]?.message?.content || '(No response)';

      } else {
        // ── Anthropic Claude ──
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': claudeKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model: currentModel.id,
            max_tokens: 4096,
            system: SYSTEM_PROMPT,
            messages: history.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content }))
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || 'Claude error');
        aiText = data.content?.[0]?.text || '(No response)';
      }

      setMessages(prev => [...prev, { id: Date.now().toString() + '-ai', role: 'ai', content: aiText }]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setMessages(prev => [...prev, { id: Date.now().toString() + '-err', role: 'ai', content: `❌ **Error:** ${msg}` }]);
    } finally {
      setBusy(false);
    }
  }, [input, messages, busy, currentModel]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); }
  };

  const handlePreview = (code: string) => {
    setPreviewHtml(code);
    setPreviewOpen(true);
  };

  const quickPrompts = [
    { icon: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>, label: 'Create Image', prompt: 'Build a beautiful animated CSS button with hover effects' },
    { icon: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>, label: 'Brainstorm', prompt: 'Brainstorm 5 innovative app ideas that solve real-world problems' },
    { icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>, label: 'Make a plan', prompt: 'Help me make a project plan for building a web application' },
    { icon: <><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></>, label: 'Generate Code', prompt: 'Generate a complete HTML page with a to-do list app using JavaScript' },
  ];

  return (
    <>
      <Sidebar onNewChat={() => setMessages([])} />

      <div className="workspace">
        <div className="chat-col">
          {/* TOPBAR */}
          <div className="topbar">
            <button className="model-pill">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
              Infinity AI v1.0
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div className="topbar-right">
              <button className={`live-preview-btn${previewOpen ? ' active' : ''}`} onClick={() => setPreviewOpen(o => !o)}>
                <div className="pulse-dot" />
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                Live Preview
              </button>
              <button className="top-btn">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Export
              </button>
            </div>
          </div>

          {/* CHAT AREA */}
          <div className="chat-area" ref={chatAreaRef}>
            {messages.length === 0 ? (
              <div className="welcome">
                <OrbCanvas />
                <h1>Ready to Create Something Infinite?</h1>
                <div className="quick-row">
                  {quickPrompts.map(q => (
                    <button key={q.label} className="qbtn" onClick={() => sendMsg(q.prompt)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{q.icon}</svg>
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="msgs">
                {messages.map(m => (
                  <MessageBubble key={m.id} role={m.role} content={m.content} onPreview={handlePreview} />
                ))}
                {busy && <TypingIndicator />}
              </div>
            )}
          </div>

          {/* INPUT ZONE */}
          <div className="input-zone">
            <div className="input-wrap">
              <div className="input-box">
                <div className="textarea-row">
                  <svg className="star-ic" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                  </svg>
                  <textarea
                    ref={textareaRef}
                    className="chat-input"
                    placeholder="Ask Anything..."
                    rows={1}
                    value={input}
                    onChange={e => { setInput(e.target.value); autoGrow(e.target); }}
                    onKeyDown={handleKey}
                  />
                </div>
                <div className="actions-row">
                  <div className="left-btns">
                    <button className="ab">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                      Attach
                    </button>
                    <ModelDropdown currentModel={currentModel} onSelect={handleModelSelect} />
                    <button className="ab" onClick={() => setApiModalOpen(true)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      API Key
                    </button>
                  </div>
                  <div className="right-btns">
                    <button className="mic-btn">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                    </button>
                    <button className="send-btn" disabled={busy || !input.trim()} onClick={() => sendMsg()}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="input-footer">Infinity AI can make mistakes. Always verify important information.</div>
            </div>
          </div>
        </div>

        {/* PREVIEW PANEL */}
        <PreviewPanel
          open={previewOpen}
          previewHtml={previewHtml}
          onClose={() => setPreviewOpen(false)}
        />
      </div>

      {/* API KEY MODAL */}
      <ApiKeyModal open={apiModalOpen} onClose={() => setApiModalOpen(false)} />
    </>
  );
}
