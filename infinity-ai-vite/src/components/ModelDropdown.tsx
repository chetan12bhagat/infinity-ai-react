import { type ModelOption } from '../types';

interface ModelDropdownProps {
  currentModel: ModelOption;
  onSelect: (model: ModelOption) => void;
}

export default function ModelDropdown({ currentModel }: ModelDropdownProps) {
  return (
    <div className="model-dropdown-wrap">
      <div className="ab" style={{ cursor: 'default', gap: '8px' }}>
        <svg className="logo-glow" width="16" height="10" viewBox="0 0 36 22" fill="none" style={{ opacity: 1 }}>
          <path d="M18 11C18 11 14 4 9 4C5.13 4 2 7.13 2 11C2 14.87 5.13 18 9 18C14 18 18 11 18 11Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
          <path d="M18 11C18 11 22 4 27 4C30.87 4 34 7.13 34 11C34 14.87 30.87 18 27 18C22 18 18 11 18 11Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
        </svg>
        <span>{currentModel.name}</span>
      </div>
    </div>
  );
}
