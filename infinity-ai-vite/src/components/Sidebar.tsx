interface SidebarProps {
  onNewChat: () => void;
}

const navItems = [
  { icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>, label: 'Chat', group: 'FEATURES' },
  { icon: <><path d="M21 8l-8-5-8 5v8l8 5 8-5z"/><path d="M3 8l9 5 9-5"/><line x1="12" y1="22" x2="12" y2="13"/></>, label: 'Archived', group: 'FEATURES' },
  { icon: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></>, label: 'Library', group: 'FEATURES' },
  { icon: <><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></>, label: 'New Project', group: 'WORKSPACES' },
  { icon: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>, label: 'Image', group: 'WORKSPACES' },
  { icon: <><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>, label: 'Presentation', group: 'WORKSPACES' },
  { icon: <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>, label: 'Riset', group: 'WORKSPACES' },
  { icon: <><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></>, label: 'Generate Code', group: 'WORKSPACES' },
];

export default function Sidebar({ onNewChat }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <svg width="36" height="22" viewBox="0 0 36 22" fill="none">
            <path d="M18 11C18 11 14 4 9 4C5.13 4 2 7.13 2 11C2 14.87 5.13 18 9 18C14 18 18 11 18 11Z" stroke="url(#lg1)" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
            <path d="M18 11C18 11 22 4 27 4C30.87 4 34 7.13 34 11C34 14.87 30.87 18 27 18C22 18 18 11 18 11Z" stroke="url(#lg2)" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
            <defs>
              <linearGradient id="lg1" x1="2" y1="11" x2="18" y2="11" gradientUnits="userSpaceOnUse"><stop stopColor="#a78bfa"/><stop offset="1" stopColor="#60a5fa"/></linearGradient>
              <linearGradient id="lg2" x1="18" y1="11" x2="34" y2="11" gradientUnits="userSpaceOnUse"><stop stopColor="#60a5fa"/><stop offset="1" stopColor="#a78bfa"/></linearGradient>
            </defs>
          </svg>
        </div>
        <span className="logo-name">Infinity AI</span>
      </div>

      <div className="sidebar-inner">
        <button className="new-chat-btn" onClick={onNewChat}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          New Chat
        </button>

        {['FEATURES', 'WORKSPACES'].map(group => (
          <div className="nav-group" key={group}>
            <div className="section-label">{group === 'FEATURES' ? 'Features' : 'Workspaces'}</div>
            {navItems.filter(n => n.group === group).map((item, i) => (
              <div className={`nav-item${i === 0 && group === 'FEATURES' ? ' active' : ''}`} key={item.label}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{item.icon}</svg>
                {item.label}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="sidebar-bottom">
        <div className="user-row">
          <div className="avatar">U</div>
          <div className="user-info">
            <div className="user-name">User</div>
            <div className="user-plan">Free Plan</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
