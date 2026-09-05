import React from 'react';

export default function Topbar({ user, onSignOut, onMenu, onNotifications }) {
  const firstName = user?.firstName || user?.first_name || 'Farmer';
  const isWorker = user?.roles?.some((role) => ['FARM_WORKER', 'WORKER'].includes(typeof role === 'string' ? role : role?.role?.name || role?.name));
  const confirmSignOut = () => {
    if (window.confirm('Do you want to sign out?')) onSignOut();
  };
  return <header className="topbar">
    <button className="menu-button" onClick={onMenu} aria-label="Open navigation">☰</button>
    <div className="topbar-copy"><p className="eyebrow">GOOD MORNING</p><h1>{firstName}, here is your farm at a glance.</h1></div>
  <div className="topbar-actions"><button className="notification-button" onClick={onNotifications} aria-label="Notifications" title="Notifications">&#128276;<span className="notification-dot" /></button><div className="profile"><span>{user?.profilePictureUrl ? <img loading="lazy" decoding="async" src={user.profilePictureUrl} alt="" /> : firstName[0].toUpperCase()}</span><div><b>{firstName}</b>{isWorker && <small>Farm Worker</small>}</div></div><button className="logout-button" onClick={confirmSignOut} title="Sign out">Sign out</button></div>
  </header>;
}
