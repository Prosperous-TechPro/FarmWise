import React from 'react';

export default function Topbar({ user, onSignOut, onMenu }) {
  const firstName = user?.firstName || user?.first_name || 'Farmer';
  return <header className="topbar">
    <button className="menu-button" onClick={onMenu} aria-label="Open navigation">☰</button>
    <div className="topbar-copy"><p className="eyebrow">GOOD MORNING</p><h1>{firstName}, here is your farm at a glance.</h1></div>
    <div className="topbar-actions"><button className="notification-button" aria-label="Notifications" title="Notifications">♢<span className="notification-dot" /></button><button className="profile" onClick={onSignOut} title="Sign out"><span>{firstName[0].toUpperCase()}</span><b>{firstName}</b><small>Sign out</small></button></div>
  </header>;
}
