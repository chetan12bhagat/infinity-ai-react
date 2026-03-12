import { useEffect, useRef, useState } from 'react';

interface PreviewPanelProps {
  open: boolean;
  previewHtml: string | null;
  onClose: () => void;
}

export default function PreviewPanel({ open, previewHtml, onClose }: PreviewPanelProps) {
  const [tab, setTab] = useState<'preview' | 'code'>('preview');
  const [fullscreen, setFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    if (previewHtml) {
      iframe.style.display = 'block';
      const doc = iframe.contentDocument;
      if (doc) { doc.open(); doc.write(previewHtml); doc.close(); }
    } else {
      iframe.style.display = 'none';
    }
  }, [previewHtml, tab]);

  const handleRefresh = () => {
    const iframe = iframeRef.current;
    if (!iframe || !previewHtml) return;
    const doc = iframe.contentDocument;
    if (doc) { doc.open(); doc.write(previewHtml); doc.close(); }
  };

  const handleFullscreen = () => {
    const el = panelRef.current;
    if (!el) return;
    if (!fullscreen) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setFullscreen(f => !f);
  };

  return (
    <div className={`preview-panel${open ? ' open' : ''}`} ref={panelRef}>
      <div className="pv-topbar">
        <div className="pv-title">
          <div className="pv-live-dot" />
          Live Preview
        </div>
        <div className="pv-tabs">
          <button className={`pvtab${tab === 'preview' ? ' on' : ''}`} onClick={() => setTab('preview')}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display:'inline',verticalAlign:'middle',marginRight:3 }}><rect x="2" y="3" width="20" height="14" rx="2"/></svg>
            Preview
          </button>
          <button className={`pvtab${tab === 'code' ? ' on' : ''}`} onClick={() => setTab('code')}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display:'inline',verticalAlign:'middle',marginRight:3 }}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            Code
          </button>
        </div>
        <div className="pv-actions">
          <button className="pv-btn" title="Refresh" onClick={handleRefresh}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
          </button>
          <button className="pv-btn" title="Fullscreen" onClick={handleFullscreen}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
          </button>
          <button className="pv-close" title="Close" onClick={onClose}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      <div className="pv-body">
        {!previewHtml ? (
          <div className="pv-empty">
            <div className="pv-empty-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--purple-light)" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            <h3>No Preview Yet</h3>
            <p>Ask Infinity AI to write HTML, CSS, or JavaScript code — then click the <strong style={{ color: 'var(--purple-light)' }}>▶ Preview</strong> button on any code block.</p>
            <span className="hint">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Try: "Build a calculator in HTML"
            </span>
          </div>
        ) : (
          <>
            <iframe
              ref={iframeRef}
              sandbox="allow-scripts allow-same-origin allow-forms"
              style={{ width: '100%', height: '100%', border: 'none', display: tab === 'preview' ? 'block' : 'none' }}
            />
            {tab === 'code' && (
              <div id="pvCode" style={{ display: 'block', width: '100%', height: '100%', overflow: 'auto', padding: 16, fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: '#c9d1d9', background: '#07050f', lineHeight: 1.65, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {previewHtml}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
