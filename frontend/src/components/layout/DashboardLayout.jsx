import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout({ children, view, onViewChange, user, onSignOut, loading, notice, onDismissNotice }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const changeView = (nextView) => {
    onViewChange(nextView);
    setSidebarOpen(false);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar activeView={view} isOpen={sidebarOpen} onViewChange={changeView} onClose={() => setSidebarOpen(false)} />
      <div className="dashboard-main">
        <Topbar user={user} onSignOut={onSignOut} onMenu={() => setSidebarOpen(true)} />
        <main className="main-content">
          {notice && <div className="notice error" role="alert">{notice}<button type="button" onClick={onDismissNotice} aria-label="Dismiss notification">×</button></div>}
          {loading && <div className="loading-line" aria-label="Loading" />}
          {children}
        </main>
      </div>
    </div>
  );
}
