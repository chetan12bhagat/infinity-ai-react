import CodeBlock from './CodeBlock';

interface MessageBubbleProps {
  role: 'user' | 'ai';
  content: string;
  onPreview: (code: string) => void;
}

function parseContent(content: string, onPreview: (code: string) => void) {
  const parts: React.ReactNode[] = [];
  const codeRegex = /```(\w+)?\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeRegex.exec(content)) !== null) {
    const before = content.slice(lastIndex, match.index);
    if (before) parts.push(<span key={`text-${lastIndex}`} dangerouslySetInnerHTML={{ __html: formatText(before) }} />);
    parts.push(
      <CodeBlock key={`code-${match.index}`} lang={match[1] || 'text'} code={match[2].trim()} onPreview={onPreview} />
    );
    lastIndex = match.index + match[0].length;
  }

  const remaining = content.slice(lastIndex);
  if (remaining) parts.push(<span key="text-end" dangerouslySetInnerHTML={{ __html: formatText(remaining) }} />);
  return parts;
}

function formatText(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^---$/gm, '<hr/>')
    .replace(/\n/g, '<br/>');
}

export default function MessageBubble({ role, content, onPreview }: MessageBubbleProps) {
  if (role === 'user') {
    return (
      <div className="msg user">
        <div className="bubble">{content}</div>
      </div>
    );
  }

  return (
    <div className="msg ai">
      <div className="ai-av">
        <svg width="22" height="13" viewBox="0 0 36 22" fill="none">
          <path d="M18 11C18 11 14 4 9 4C5.13 4 2 7.13 2 11C2 14.87 5.13 18 9 18C14 18 18 11 18 11Z" stroke="url(#lg-msg-1)" strokeWidth="2.7" strokeLinecap="round"/>
          <path d="M18 11C18 11 22 4 27 4C30.87 4 34 7.13 34 11C34 14.87 30.87 18 27 18C22 18 18 11 18 11Z" stroke="url(#lg-msg-2)" strokeWidth="2.7" strokeLinecap="round"/>
          <defs>
            <linearGradient id="lg-msg-1" x1="2" y1="11" x2="18" y2="11" gradientUnits="userSpaceOnUse"><stop stopColor="#a78bfa"/><stop offset="1" stopColor="#60a5fa"/></linearGradient>
            <linearGradient id="lg-msg-2" x1="18" y1="11" x2="34" y2="11" gradientUnits="userSpaceOnUse"><stop stopColor="#60a5fa"/><stop offset="1" stopColor="#a78bfa"/></linearGradient>
          </defs>
        </svg>
      </div>
      <div className="ai-body">
        <div className="bubble">
          {parseContent(content, onPreview)}
        </div>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="msg ai">
      <div className="ai-av">
        <svg width="22" height="13" viewBox="0 0 36 22" fill="none">
          <path d="M18 11C18 11 14 4 9 4C5.13 4 2 7.13 2 11C2 14.87 5.13 18 9 18C14 18 18 11 18 11Z" stroke="url(#lg-typ-1)" strokeWidth="2.7" strokeLinecap="round"/>
          <path d="M18 11C18 11 22 4 27 4C30.87 4 34 7.13 34 11C34 14.87 30.87 18 27 18C22 18 18 11 18 11Z" stroke="url(#lg-typ-2)" strokeWidth="2.7" strokeLinecap="round"/>
          <defs>
            <linearGradient id="lg-typ-1" x1="2" y1="11" x2="18" y2="11" gradientUnits="userSpaceOnUse"><stop stopColor="#a78bfa"/><stop offset="1" stopColor="#60a5fa"/></linearGradient>
            <linearGradient id="lg-typ-2" x1="18" y1="11" x2="34" y2="11" gradientUnits="userSpaceOnUse"><stop stopColor="#60a5fa"/><stop offset="1" stopColor="#a78bfa"/></linearGradient>
          </defs>
        </svg>
      </div>
      <div className="ai-body">
        <div className="bubble">
          <div className="typing-anim">
            <div className="dot" /><div className="dot" /><div className="dot" />
          </div>
        </div>
      </div>
    </div>
  );
}
