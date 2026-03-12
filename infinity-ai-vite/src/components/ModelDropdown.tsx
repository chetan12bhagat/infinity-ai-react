import { useEffect, useRef, useState } from 'react';
import { MODELS, type ModelOption } from '../types';

interface ModelDropdownProps {
  currentModel: ModelOption;
  onSelect: (model: ModelOption) => void;
}

export default function ModelDropdown({ currentModel, onSelect }: ModelDropdownProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const claudeModels = MODELS.filter(m => m.dot === 'claude-opt');
  const geminiModels = MODELS.filter(m => m.dot === 'gemini-opt');
  const openaiModels = MODELS.filter(m => m.dot === 'openai-opt');
  const groqModels   = MODELS.filter(m => m.dot === 'groq-opt');

  const renderGroup = (models: ModelOption[], sectionDotClass: string, label: string) => (
    <>
      <div className="model-section-label">
        <span className={`model-section-dot ${sectionDotClass}`} />
        {label}
      </div>
      {models.map(m => (
        <div
          key={m.id}
          className={`model-option${currentModel.id === m.id ? ' selected' : ''}`}
          onClick={() => { onSelect(m); setOpen(false); }}
        >
          <div className={`model-opt-dot ${m.dot}`} />
          <div className="model-opt-info">
            <div className="model-opt-name">{m.name}</div>
            <div className="model-opt-sub">{m.sub}</div>
          </div>
          <svg className="model-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      ))}
    </>
  );

  return (
    <div className="model-dropdown-wrap" ref={wrapRef}>
      <button className="ab" onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}>
        <div className={`model-opt-dot ${currentModel.dot}`} style={{ width: 8, height: 8 }} />
        <span>{currentModel.name}</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      <div className={`model-dropdown${open ? ' open' : ''}`}>
        <div className="model-dd-header">CHOOSE MODEL</div>

        {renderGroup(claudeModels, 'claude-dot', 'Claude')}
        <div className="model-divider" />
        {renderGroup(geminiModels, 'gemini-dot', 'Google Gemini')}
        <div className="model-divider" />
        {renderGroup(openaiModels, 'openai-dot', 'OpenAI')}
        <div className="model-divider" />
        {renderGroup(groqModels, 'groq-dot', 'Groq · Lightning Fast')}
      </div>
    </div>
  );
}
