import React from 'react';

const items = [['dashboard', 'Overview'], ['farms', 'My farms'], ['workers', 'Workers'], ['records', 'Records'], ['projects', 'Projects'], ['community', 'Community'], ['notifications', 'Notifications'], ['account', 'Account']];
const adminItems = [['users', 'Users'], ['admin-farms', 'All farms']];

export default function Sidebar({ activeView, isOpen, isSystemAdmin, onViewChange, onClose }) {
  return <>
    {isOpen && <button className="sidebar-backdrop" onClick={onClose} aria-label="Close navigation" />}
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="brand"><span className="brand-mark">FW</span><span>FarmWise</span><button className="sidebar-close" onClick={onClose} aria-label="Close navigation">×</button></div>
      <p className="eyebrow">FIELD OPERATIONS</p>
      <nav aria-label="Main navigation">
        {items.map(([key, label]) => <button className={activeView === key ? 'nav-item active' : 'nav-item'} key={key} onClick={() => onViewChange(key)}><span className={`nav-icon ${key}`} aria-hidden="true" />{label}</button>)}
        {isSystemAdmin && <><p className="eyebrow admin-nav-label">SYSTEM ADMIN</p>{adminItems.map(([key, label]) => <button className={activeView === key ? 'nav-item active' : 'nav-item'} key={key} onClick={() => onViewChange(key)}><span className={`nav-icon ${key}`} aria-hidden="true" />{label}</button>)}</>}
      </nav>
      <div className="sidebar-footer"><span className="status-dot" /> API connected</div>
    </aside>
  </>;
}
