import React, { useEffect, useState } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import apiClient from './services/api';
import DashboardLayout from './components/layout/DashboardLayout';
import './App.css';

const TOKEN_KEY = 'farmwise.accessToken';

function getStoredUser() {
  try { return JSON.parse(localStorage.getItem('farmwise.user') || 'null'); } catch { return null; }
}

function AppContent() {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(getStoredUser);
  const [view, setView] = useState('dashboard');
  const [overview, setOverview] = useState(null);
  const [farms, setFarms] = useState([]);
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(false);

  const signOut = async () => {
    try { if (token) await apiClient.post('/auth/logout', {}); } catch { /* local sign-out still completes */ }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('farmwise.refreshToken');
    localStorage.removeItem('farmwise.user');
    apiClient.setAuthToken(null);
    setToken(null); setUser(null); setOverview(null); setFarms([]);
  };

  const loadWorkspace = async () => {
    setLoading(true); setNotice(null);
    try {
      const [overviewResponse, farmsResponse] = await Promise.all([
        apiClient.get('/dashboard/overview'), apiClient.get('/farms'),
      ]);
      setOverview(overviewResponse.data); setFarms(farmsResponse.data || []);
    } catch (error) {
      if (error.status === 401 || error.status === 403) signOut();
      else setNotice(error.message || 'Unable to load workspace data');
    } finally { setLoading(false); }
  };

  useEffect(() => { if (token) { apiClient.setAuthToken(token); loadWorkspace(); } }, [token]);

  if (!token) return <Login onLogin={(session) => {
    localStorage.setItem(TOKEN_KEY, session.accessToken);
    localStorage.setItem('farmwise.refreshToken', session.refreshToken || '');
    localStorage.setItem('farmwise.user', JSON.stringify(session.user));
    apiClient.setAuthToken(session.accessToken); setUser(session.user); setToken(session.accessToken);
  }} />;

  const firstName = user?.firstName || user?.first_name || 'Farmer';
  return (
    <DashboardLayout view={view} onViewChange={setView} user={user} onSignOut={signOut} loading={loading} notice={notice} onDismissNotice={() => setNotice(null)}>
        {view === 'dashboard' && <Dashboard overview={overview} farms={farms} onViewFarms={() => setView('farms')} />}
        {view === 'farms' && <Farms farms={farms} onCreated={(farm) => { setFarms([...farms, farm]); setNotice('Farm created successfully.'); }} />}
        {view === 'records' && <Records farms={farms} />}
    </DashboardLayout>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (event) => { event.preventDefault(); setBusy(true); setError(''); try {
    const result = await apiClient.post('/auth/login', { email, password }); onLogin(result.data);
  } catch (err) { setError(err.message || 'Sign in failed. Check your details.'); } finally { setBusy(false); } };
  return <div className="auth-shell"><div className="auth-art"><div className="brand"><span className="brand-mark">FW</span><span>FarmWise</span></div><div className="art-copy"><p className="eyebrow">YOUR FARM, IN FOCUS</p><h1>Make every season count.</h1><p>One calm workspace for the decisions that keep your farm moving.</p></div><div className="season-card"><span>SEASON SNAPSHOT</span><strong>Grow with clarity.</strong><small>Track the work. See the signal.</small></div></div><form className="auth-form" onSubmit={submit}><p className="eyebrow">WELCOME BACK</p><h2>Sign in to FarmWise</h2><p className="muted">Your operations desk is waiting.</p>{error && <div className="notice error">{error}</div>}<label>Email address<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></label><label>Password<PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></label><button className="primary-button" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'} <span>→</span></button><p className="form-foot">New to FarmWise? <span>Ask your farm administrator for an invite.</span></p></form></div>;
}

function PasswordInput({ value, onChange, autoComplete }) {
  const [visible, setVisible] = useState(false);
  return <span className="password-field"><input type={visible ? 'text' : 'password'} value={value} onChange={onChange} required autoComplete={autoComplete} /><button type="button" className="password-toggle" onClick={() => setVisible(!visible)} aria-label={visible ? 'Hide password' : 'Show password'} title={visible ? 'Hide password' : 'Show password'}>{visible ? 'Hide' : 'Show'}</button></span>;
}

function Dashboard({ overview, farms, onViewFarms }) {
  const stats = overview?.summary || overview || {};
  return <>
    <section className="hero-band"><div><p className="eyebrow">OPERATIONS OVERVIEW</p><h2>Keep the important things growing.</h2><p className="muted">A live view of your farms, people, and production.</p></div><button className="outline-button" onClick={onViewFarms}>Manage farms <span>↗</span></button></section>
    <section className="stat-grid"><Stat label="Active farms" value={farms.length || stats.farmCount || 0} detail="Connected to your account" tone="green" /><Stat label="Livestock" value={stats.livestockCount || stats.totalLivestock || '—'} detail="Across all farms" tone="yellow" /><Stat label="Production" value={stats.productionCount || stats.totalProduction || '—'} detail="Records this season" tone="blue" /><Stat label="Open alerts" value={stats.alertCount || stats.activeAlerts || '—'} detail="Needs your attention" tone="red" /></section>
    <section className="content-grid"><div className="panel"><div className="panel-heading"><div><p className="eyebrow">YOUR FARMS</p><h3>Farm portfolio</h3></div><button className="text-button" onClick={onViewFarms}>View all ↗</button></div>{farms.length ? farms.slice(0, 4).map((farm) => <div className="farm-row" key={farm.id}><span className="farm-avatar">{(farm.name || 'F')[0]}</span><div><strong>{farm.name}</strong><small>{farm.location || farm.address || 'Location not set'}</small></div><span className="row-arrow">→</span></div>) : <Empty text="Create your first farm to start tracking operations." onClick={onViewFarms} />}</div><div className="panel pulse"><p className="eyebrow">QUICK START</p><h3>Build your farm picture</h3><p className="muted">Add farms and fields first, then layer in crops, livestock, and costs as the season unfolds.</p><button className="primary-button compact" onClick={onViewFarms}>Open farm manager <span>→</span></button></div></section>
  </>;
}

function Stat({ label, value, detail, tone }) { return <div className={`stat-card ${tone}`}><span className="stat-icon" /><p>{label}</p><strong>{value}</strong><small>{detail}</small></div>; }
function Empty({ text, onClick }) { return <div className="empty"><p>{text}</p><button className="text-button" onClick={onClick}>Get started →</button></div>; }

function Farms({ farms, onCreated }) {
  const [open, setOpen] = useState(false); const [name, setName] = useState(''); const [location, setLocation] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const create = async (event) => { event.preventDefault(); setBusy(true); setError(''); try { const result = await apiClient.post('/farms', { name, location }); onCreated(result.data); setName(''); setLocation(''); setOpen(false); } catch (err) { setError(err.message || 'Could not create farm.'); } finally { setBusy(false); } };
  return <section><div className="section-heading"><div><p className="eyebrow">PORTFOLIO</p><h2>My farms</h2><p className="muted">Keep each operation organized in one place.</p></div><button className="primary-button" onClick={() => setOpen(!open)}>+ Add farm</button></div>{open && <form className="create-form" onSubmit={create}>{error && <div className="notice error">{error}</div>}<label>Farm name<input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Green Valley Farm" /></label><label>Location<input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Town or region" /></label><button className="primary-button" disabled={busy}>{busy ? 'Creating...' : 'Create farm'}</button></form>}<div className="farm-grid">{farms.map((farm) => <article className="farm-card" key={farm.id}><div className="farm-card-top"><span className="farm-avatar large">{(farm.name || 'F')[0]}</span><span className="live-badge">ACTIVE</span></div><h3>{farm.name}</h3><p>{farm.location || farm.address || 'Location not set'}</p><div className="farm-card-foot"><span>Farm workspace</span><span>→</span></div></article>)}{!farms.length && <div className="panel empty-wide"><h3>No farms yet</h3><p className="muted">Create a farm to unlock fields, livestock, crop cycles, and financial records.</p></div>}</div></section>;
}

function Records({ farms }) { const items = [['Fields', 'Map boundaries, acreage, and field activity', 'farm'], ['Livestock', 'Track animals, health, and breeding records', 'livestock'], ['Crops', 'Monitor cycles, inputs, and growth', 'crops'], ['Finance', 'Follow expenses, sales, and profitability', 'finance'], ['Inventory', 'Know what is in storage and where', 'inventory'], ['Activities', 'Log work, observations, and harvests', 'activity']]; return <section><div className="section-heading"><div><p className="eyebrow">OPERATIONS</p><h2>Records</h2><p className="muted">The working layers behind every farm decision.</p></div><span className="record-count">{farms.length} farm{farms.length === 1 ? '' : 's'} connected</span></div><div className="record-grid">{items.map(([title, text, icon]) => <article className="record-card" key={title}><span className={`record-icon ${icon}`} /><h3>{title}</h3><p>{text}</p><span className="coming">API ready · UI next</span></article>)}</div></section>; }

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
