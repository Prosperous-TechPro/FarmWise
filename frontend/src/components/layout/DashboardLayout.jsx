import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import GlobalFAQButton from '../support/GlobalFAQButton';

export default function DashboardLayout({ children, view, onViewChange, user, isSystemAdmin, isWorker, onSignOut, onNotifications, loading, notice, onDismissNotice, darkMode, onToggleTheme }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const changeView = (nextView) => {
    onViewChange(nextView);
    setSidebarOpen(false);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar activeView={view} isOpen={sidebarOpen} isSystemAdmin={isSystemAdmin} isWorker={isWorker} onViewChange={changeView} onClose={() => setSidebarOpen(false)} />
      <div className="dashboard-main">
        <Topbar user={user} onSignOut={onSignOut} onNotifications={onNotifications} onMenu={() => setSidebarOpen(true)} darkMode={darkMode} onToggleTheme={onToggleTheme} />
        <main className="main-content">
          {notice && <div className={`notice ${notice.type || 'error'}`} role="alert">{notice.message || notice}<button type="button" onClick={onDismissNotice} aria-label="Dismiss notification">×</button></div>}
          {loading && <div className="loading-line" aria-label="Loading" />}
          {children}
        </main>
        <GlobalFAQButton />
      </div>
    </div>
  );
}
