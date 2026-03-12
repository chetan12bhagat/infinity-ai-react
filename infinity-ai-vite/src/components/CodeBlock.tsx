import { useState } from 'react';

interface CodeBlockProps {
  lang: string;
  code: string;
  onPreview: (code: string) => void;
}

export default function CodeBlock({ lang, code, onPreview }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isPreviewable = ['html', 'css', 'javascript', 'js'].includes(lang.toLowerCase());

  return (
    <div className="code-wrap">
      <div className="code-head">
        <div className="code-head-left">
          <span className="lang-badge">{lang}</span>
        </div>
        <div className="code-head-btns">
          {isPreviewable && (
            <button className="cb-preview-btn" onClick={() => onPreview(code)}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Preview
            </button>
          )}
          <button className="copy-btn" onClick={handleCopy}>
            {copied
              ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>Copied!</>
              : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy</>
            }
          </button>
        </div>
      </div>
      <pre><code>{code}</code></pre>
    </div>
  );
}
