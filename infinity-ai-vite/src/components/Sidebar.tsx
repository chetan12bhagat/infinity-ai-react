import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
  chats: any[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onWorkspaceAction?: (action: string) => void;
  user: any;
}

export default function Sidebar({ 
  chats, 
  currentChatId, 
  onSelectChat, 
  onNewChat, 
  onDeleteChat,
  onWorkspaceAction,
  user
}: SidebarProps) {
  const { signOut } = useAuth();

  // Extract clean display name from user object
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';
  const avatarChar = displayName[0]?.toUpperCase() || 'U';
  const profilePic = user?.picture;

  const groupChats = () => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const last7Days = new Date(today); last7Days.setDate(last7Days.getDate() - 7);

    const groups: { [key: string]: any[] } = {
      'Today': [], 'Yesterday': [], 'Last 7 Days': [], 'Older': []
    };

    chats.forEach(chat => {
      const d = new Date(chat.createdAt || Date.now()); d.setHours(0, 0, 0, 0);
      if (d.getTime() === today.getTime()) groups['Today'].push(chat);
      else if (d.getTime() === yesterday.getTime()) groups['Yesterday'].push(chat);
      else if (d.getTime() >= last7Days.getTime()) groups['Last 7 Days'].push(chat);
      else groups['Older'].push(chat);
    });
    return groups;
  };

  const grouped = groupChats();

  const sectionLabel: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '1px',
    color: '#4f4d6a',
    textTransform: 'uppercase',
    padding: '10px 12px 4px',
    userSelect: 'none'
  };

  const navItem = (active = false): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13.5px',
    color: active ? '#e2e0f5' : '#a09bb5',
    background: active ? 'rgba(139,103,233,0.18)' : 'transparent',
    transition: 'background 0.15s, color 0.15s',
    fontWeight: active ? 500 : 400,
  });

  const workspaceItems = [
    { label: 'New Project', action: 'new_project', icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
    )},
    { label: 'Image', action: 'image', icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
    )},
    { label: 'Presentation', action: 'presentation', icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
    )},
    { label: 'Riset', action: 'riset', icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
    )},
    { label: 'Generate Code', action: 'generate_code', icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
    )},
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <svg width="36" height="22" viewBox="0 0 36 22" fill="none">
            <path d="M18 11C18 11 14 4 9 4C5.13 4 2 7.13 2 11C2 14.87 5.13 18 9 18C14 18 18 11 18 11Z" stroke="url(#lg3)" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
            <path d="M18 11C18 11 22 4 27 4C30.87 4 34 7.13 34 11C34 14.87 30.87 18 27 18C22 18 18 11 18 11Z" stroke="url(#lg4)" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
            <defs>
              <linearGradient id="lg3" x1="2" y1="11" x2="18" y2="11" gradientUnits="userSpaceOnUse"><stop stopColor="#a78bfa"/><stop offset="1" stopColor="#60a5fa"/></linearGradient>
              <linearGradient id="lg4" x1="18" y1="11" x2="34" y2="11" gradientUnits="userSpaceOnUse"><stop stopColor="#60a5fa"/><stop offset="1" stopColor="#a78bfa"/></linearGradient>
            </defs>
          </svg>
        </div>
        <span className="logo-name">Infinity AI</span>
      </div>

      <div className="sidebar-inner">
        {/* New Chat Button */}
        <button className="new-chat-btn" onClick={onNewChat}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          New Chat
        </button>

        {/* ── FEATURES section ── */}
        <div style={sectionLabel}>Features</div>

        <div style={navItem(true)} onClick={onNewChat}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Chat
        </div>

        <div style={navItem()} className="sidebar-nav-item-hover">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 8h14M5 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM19 8a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"/><path d="M3 8v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8"/></svg>
          Archived
        </div>

        <div style={navItem()} className="sidebar-nav-item-hover">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          Library
        </div>

        {/* ── WORKSPACES section ── */}
        <div style={{ ...sectionLabel, marginTop: '12px' }}>Workspaces</div>

        {workspaceItems.map(w => (
          <div
            key={w.action}
            style={navItem()}
            className="sidebar-nav-item-hover"
            onClick={() => onWorkspaceAction?.(w.action)}
          >
            {w.icon}
            {w.label}
          </div>
        ))}

        {/* ── Chat history groups ── */}
        {chats.length > 0 && (
          <div style={{ ...sectionLabel, marginTop: '12px' }}>Recent</div>
        )}
        {Object.entries(grouped).map(([label, items]) => items.length > 0 && (
          <div className="nav-group" key={label}>
            <div className="section-label">{label}</div>
            {items.map(chat => (
              <div 
                className={`nav-item${currentChatId === chat.chatId ? ' active' : ''}`} 
                key={chat.chatId}
                onClick={() => onSelectChat(chat.chatId)}
                style={{ position: 'relative' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {chat.title || 'New Chat'}
                </span>
                <button 
                  className="delete-chat-btn"
                  onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.chatId); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* ── Bottom user row ── */}
      <div className="sidebar-bottom">
        <div className="user-row" style={{ cursor: 'default' }}>
          <div className="avatar" style={{ overflow: 'hidden' }}>
            {profilePic ? (
              <img src={profilePic} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              avatarChar
            )}
          </div>
          <div className="user-info">
            <div className="user-name">{displayName}</div>
            <div className="user-plan" style={{ fontSize: '10px', opacity: 0.6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayEmail || 'Free Plan'}
            </div>
          </div>
          <button 
            className="top-btn" 
            onClick={signOut}
            title="Sign out"
            style={{ padding: '6px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
