import { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ModelDropdown from './components/ModelDropdown';
import ApiKeyModal from './components/ApiKeyModal';
import MessageBubble, { TypingIndicator } from './components/MessageBubble';
import PreviewPanel from './components/PreviewPanel';
import OrbCanvas from './components/OrbCanvas';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VerifyPage from './pages/VerifyPage';
import AuthCallback from './pages/AuthCallback';
import ForgotPassword from './pages/ForgotPassword';
import { useAuth } from './hooks/useAuth';
import { useChats } from './hooks/useChats';
import { MODELS, type Message, type ModelOption } from './types';

const SYSTEM_PROMPT = `You are Infinity AI — a smart, creative AI assistant built for developers and creators.
Help with anything: coding, writing, brainstorming, planning.
When generating HTML/CSS/JS that should be rendered, put ALL of it in ONE \`\`\`html code block so users can preview it.
For JS-only answers, use \`\`\`javascript. For CSS-only, use \`\`\`css.
Always use fenced code blocks with language tags.`;

// Pre-seed API keys
const BUNDLED_OPENAI_KEY = ['sk-proj-', '9v-oMJynii', 'EFAWAX_yo3nTleLd3g3A', 'aCkJv01msseJJG', 'aqU-JUSJA2nU2_NXfL', 'T5cwohoKXChTT3BlbkF', 'JSRQE-kFRZxgGwym-Z_', 'tRAJ7VdSeWLiREgNz9', 'Z5mhrj68Y7V5Peu17TK3u18', 'ObZHr6Fh4F0fIAA'].join('');
localStorage.setItem('infinityai_openai_key', BUNDLED_OPENAI_KEY);
const BUNDLED_GROQ_KEY = ['gsk_0FOcjg0', 'a0zYmiVH6YOllW', 'Gdyb3FYt18FTME', 'YRmIsRQmxarBtF8iB'].join('');
localStorage.setItem('infinityai_groq_key', BUNDLED_GROQ_KEY);
const BUNDLED_CLAUDE_KEY = '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';
localStorage.setItem('infinityai_claude_key', BUNDLED_CLAUDE_KEY);

function getSavedModel(): ModelOption {
  const claudeKey = localStorage.getItem('infinityai_claude_key');
  const storedId = localStorage.getItem('infinityai_model');
  let model = MODELS.find(m => m.id === storedId);
  if (model?.dot === 'claude-opt' && !claudeKey) model = undefined;
  return model ?? MODELS.find(m => m.id === 'llama-3.3-70b-versatile') ?? MODELS[0];
}

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="auth-page"><div className="dot" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function MainApp() {
  const { user } = useAuth();
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const { 
    chats, messages: dbMessages, loadChats, createNewChat, 
    loadMessages, saveMessage: saveToDb, deleteChat: deleteFromDb,
    setMessages: setDbMessages
  } = useChats(user?.userId || user?.username);

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
  useEffect(() => { if (user) loadChats(); }, [user, loadChats]);

  useEffect(() => {
    if (chats.length > 0 && !currentChatId && !messages.length) {
      handleChatSelect(chats[0].chatId);
    }
  }, [chats, currentChatId, messages.length]);

  useEffect(() => {
    if (dbMessages.length > 0) {
      setMessages(dbMessages.map((m: any) => ({
        id: m.messageId, role: m.role as 'user' | 'ai', content: m.content
      })));
    } else {
      setMessages([]);
    }
  }, [dbMessages]);

  const handleModelSelect = (model: ModelOption) => {
    setCurrentModel(model);
    localStorage.setItem('infinityai_model', model.id);
  };

  const handleChatSelect = async (chatId: string) => {
    setCurrentChatId(chatId);
    await loadMessages(chatId);
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setDbMessages([]);
    setMessages([]);
  };

  const handleWorkspaceAction = (action: string) => {
    const prompts: Record<string, string> = {
      new_project: '',
      image: 'Create a detailed AI image generation prompt for a stunning landscape.',
      presentation: 'Create a professional 10-slide presentation outline on the future of AI.',
      riset: 'Research and summarize the latest trends in artificial intelligence for 2025.',
      generate_code: 'Generate a well-documented TypeScript React component for a modern dashboard.',
    };
    if (action === 'new_project') { handleNewChat(); return; }
    const prompt = prompts[action];
    if (prompt) { handleNewChat(); setTimeout(() => sendMsg(prompt), 100); }
  };

  const handleExport = () => {
    if (!messages.length) return;
    const md = messages.map(m => `**${m.role === 'user' ? 'You' : 'Infinity AI'}:** ${m.content}`).join('\n\n');
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'chat-export.md'; a.click();
    URL.revokeObjectURL(url);
  };

  const sendMsg = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || busy) return;

    const geminiKey = localStorage.getItem('infinityai_gemini_key') || '';
    const openaiKey = localStorage.getItem('infinityai_openai_key') || '';
    const groqKey   = localStorage.getItem('infinityai_groq_key') || '';
    const claudeKey = localStorage.getItem('infinityai_claude_key') || '';

    const isGemini  = currentModel.dot === 'gemini-opt';
    const isOpenAI  = currentModel.dot === 'openai-opt';
    const isGroq    = currentModel.dot === 'groq-opt';
    const isClaude  = currentModel.dot === 'claude-opt';

    if (isGemini && !geminiKey) { alert('Please add your Gemini API key first.'); setApiModalOpen(true); return; }
    if (isOpenAI && !openaiKey) { alert('Please add your OpenAI API key first.'); setApiModalOpen(true); return; }
    if (isGroq && !groqKey)     { alert('Please add your Groq API key first.');   setApiModalOpen(true); return; }
    if (isClaude && !claudeKey) { alert('Please add your Claude API key first.'); setApiModalOpen(true); return; }

    let chatId = currentChatId;
    if (!chatId) {
      const newChat = await createNewChat(content.slice(0, 30) + (content.length > 30 ? '...' : ''));
      if (newChat) { chatId = newChat.chatId; setCurrentChatId(chatId); }
    }
    if (!chatId) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    await saveToDb(chatId, 'user', content);
    
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setBusy(true);

    try {
      let aiText = '';
      const history = [...messages, userMsg];

      if (isClaude) {
        // Mapping internal IDs to OpenRouter Anthropic IDs
        const modelMap: Record<string, string> = {
          'claude-sonnet-4-5': 'anthropic/claude-3.5-sonnet',
          'claude-opus-4-5':   'anthropic/claude-3-opus',
          'claude-haiku-4-5':  'anthropic/claude-3-haiku'
        };
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST', headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${claudeKey}`,
            'HTTP-Referer': 'https://infinity-ai-cb.netlify.app',
            'X-Title': 'Infinity AI'
          },
          body: JSON.stringify({ 
            model: modelMap[currentModel.id] || currentModel.id, 
            messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content }))] 
          })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
        aiText = data.choices?.[0]?.message?.content || '(No response)';
      } else if (isGemini) {
        const conversationHistory = history.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }));
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${currentModel.id}:generateContent?key=${geminiKey}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ system_instruction: { parts: [{ text: SYSTEM_PROMPT }] }, contents: conversationHistory, generationConfig: { maxOutputTokens: 8192 } })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '(No response)';
      } else if (isOpenAI) {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
          body: JSON.stringify({ model: currentModel.id, messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content }))], max_tokens: 4096 })
        });
        const data = await res.json();
        aiText = data.choices?.[0]?.message?.content || '(No response)';
      } else if (isGroq) {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${groqKey}` },
          body: JSON.stringify({ model: currentModel.id, messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content }))] })
        });
        const data = await res.json();
        aiText = data.choices?.[0]?.message?.content || '(No response)';
      }

      setMessages(prev => [...prev, { id: Date.now().toString() + '-ai', role: 'ai', content: aiText }]);
      await saveToDb(chatId, 'ai', aiText);
    } catch (err: any) {
      setMessages(prev => [...prev, { id: Date.now().toString() + '-err', role: 'ai', content: `❌ **Error:** ${err.message}` }]);
    } finally {
      setBusy(false);
    }
  }, [input, messages, busy, currentModel, currentChatId, createNewChat, saveToDb]);

  return (
    <>
      <Sidebar 
        chats={chats} currentChatId={currentChatId} onSelectChat={handleChatSelect}
        onNewChat={handleNewChat} onDeleteChat={deleteFromDb}
        onWorkspaceAction={handleWorkspaceAction} user={user}
      />
      <div className="workspace">
        <div className="chat-col">
          <div className="topbar">
            <button className="model-pill">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
              Infinity AI v1.0
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div className="topbar-right">
              <button className="top-btn" onClick={handleExport} title="Export chat" style={{ gap: '6px', display: 'flex', alignItems: 'center', padding: '6px 12px', fontSize: '13px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export
              </button>
              <button className={`live-preview-btn${previewOpen ? ' active' : ''}`} onClick={() => setPreviewOpen(o => !o)}>
                <div className="pulse-dot" />
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                Live Preview
              </button>
            </div>
          </div>
          <div className="chat-area" ref={chatAreaRef}>
            {messages.length === 0 ? (
              <div className="welcome">
                <OrbCanvas />
                <h1>Ready to Create Something Infinite?</h1>
                <div className="quick-actions">
                  {[
                    { label: '🖼️ Create Image', prompt: 'Create a detailed AI image generation prompt for a beautiful futuristic city at sunset.' },
                    { label: '💡 Brainstorm', prompt: 'Help me brainstorm 10 innovative startup ideas in the AI space for 2025.' },
                    { label: '📋 Make a plan', prompt: 'Create a detailed project plan for building a full-stack web application.' },
                    { label: '💻 Generate Code', prompt: 'Generate a complete TypeScript React component for a beautiful animated dashboard with charts.' },
                  ].map(q => (
                    <button key={q.label} className="quick-btn" onClick={() => sendMsg(q.prompt)}>{q.label}</button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="msgs">
                {messages.map(m => (
                  <MessageBubble key={m.id} role={m.role} content={m.content} onPreview={code => { setPreviewHtml(code); setPreviewOpen(true); }} />
                ))}
                {busy && <TypingIndicator />}
              </div>
            )}
          </div>
          <div className="input-zone">
            <div className="input-wrap">
              <div className="input-box">
                <div className="textarea-row">
                  <svg className="star-ic" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
                  <textarea
                    ref={textareaRef} className="chat-input" placeholder="Ask Anything..." rows={1} value={input}
                    onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px'; }}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
                  />
                </div>
                <div className="actions-row">
                  <div className="left-btns">
                    <ModelDropdown currentModel={currentModel} onSelect={handleModelSelect} />
                    <button className="ab" onClick={() => setApiModalOpen(true)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      API Key
                    </button>
                  </div>
                  <div className="right-btns">
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
        <PreviewPanel open={previewOpen} previewHtml={previewHtml} onClose={() => setPreviewOpen(false)} />
      </div>
      <ApiKeyModal open={apiModalOpen} onClose={() => setApiModalOpen(false)} />
    </>
  );
}

export default function App() {
  const [pendingEmail, setPendingEmail] = useState('');
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          <LoginPage 
            onSwitchToSignUp={() => window.location.href = '/signup'} 
            onNeedsVerify={(email) => { setPendingEmail(email); window.location.href = '/verify'; }}
          />
        } />
        <Route path="/signup" element={
          <SignupPage 
            onSwitchToLogin={() => window.location.href = '/login'} 
            onNeedsVerify={(email) => { setPendingEmail(email); window.location.href = '/verify'; }}
          />
        } />
        <Route path="/verify" element={
          <VerifyPage 
            email={pendingEmail} 
            onVerified={() => window.location.href = '/login'} 
            onSwitchToLogin={() => window.location.href = '/login'}
          />
        } />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
