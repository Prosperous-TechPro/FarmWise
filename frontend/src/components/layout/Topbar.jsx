import React from 'react';

export default function Topbar({ user, onMenu, onNotifications, unreadNotificationCount = 0, darkMode, onToggleTheme }) {
  const firstName = user?.firstName || user?.first_name || 'Farmer';
  const isWorker = user?.roles?.some((role) => ['FARM_WORKER', 'WORKER'].includes(typeof role === 'string' ? role : role?.role?.name || role?.name));
  return <header className="topbar">
    <button className="menu-button" onClick={onMenu} aria-label="Open navigation">☰</button>
    <div className="topbar-copy"><p className="eyebrow">GOOD MORNING</p><h1>{firstName}, here is your farm at a glance.</h1></div>
  <div className="topbar-actions"><button className="theme-toggle" type="button" onClick={onToggleTheme} aria-label={darkMode ? 'Use light mode' : 'Use dark mode'} title={darkMode ? 'Use light mode' : 'Use dark mode'}>{darkMode ? '☀' : '☾'}</button><button className="notification-button" onClick={onNotifications} aria-label={unreadNotificationCount ? `Notifications, ${unreadNotificationCount} unread` : 'Notifications'} title={unreadNotificationCount ? `${unreadNotificationCount} unread notifications` : 'Notifications'}>&#128276;{unreadNotificationCount > 0 && <span className="notification-count">{unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}</span>}</button><div className="profile"><span>{user?.profilePictureUrl ? <img loading="lazy" decoding="async" src={user.profilePictureUrl} alt="" /> : firstName[0].toUpperCase()}</span><div><b>{firstName}</b>{isWorker && <small>Farm Worker</small>}</div></div></div>
  </header>;
}
