import React, { useEffect, useRef, useState } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import apiClient from './services/api';
import DashboardLayout from './components/layout/DashboardLayout';
import './App.css';

const TOKEN_KEY = 'farmwise.accessToken';
const WORKSPACE_CACHE_KEY = 'farmwise.workspace';

function getStoredUser() {
  try { return JSON.parse(localStorage.getItem('farmwise.user') || 'null'); } catch { return null; }
}

function getCachedWorkspace() {
  try { return JSON.parse(sessionStorage.getItem(WORKSPACE_CACHE_KEY) || 'null'); } catch { return null; }
}

function hasSystemAdminRole(user) {
  return Array.isArray(user?.roles) && user.roles.some((role) => {
    const roleName = typeof role === 'string' ? role : role?.role?.name || role?.name;
    return ['ADMIN', 'SUPERADMIN'].includes(roleName);
  });
}

function hasSuperAdminRole(user) {
  return Array.isArray(user?.roles) && user.roles.some((role) => {
    const roleName = typeof role === 'string' ? role : role?.role?.name || role?.name;
    return roleName === 'SUPERADMIN';
  });
}

function AppContent() {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(getStoredUser);
  const [view, setView] = useState('dashboard');
  const [overview, setOverview] = useState(null);
  const [farms, setFarms] = useState([]);
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(false);
  const workspaceRequestRef = useRef(0);
  const isSystemAdmin = hasSystemAdminRole(user);
  const isSuperAdmin = hasSuperAdminRole(user);

  const signOut = async () => {
    try { if (token) await apiClient.post('/auth/logout', {}); } catch { /* local sign-out still completes */ }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('farmwise.refreshToken');
    localStorage.removeItem('farmwise.user');
    sessionStorage.removeItem(WORKSPACE_CACHE_KEY);
    apiClient.setAuthToken(null);
    setToken(null); setUser(null); setOverview(null); setFarms([]);
  };

  const loadWorkspace = async () => {
    const requestId = ++workspaceRequestRef.current;
    setLoading(true); setNotice(null);
    try {
      const requests = isSystemAdmin
        ? [apiClient.get('/farms', { timeout: 20000 }), apiClient.get('/admin/dashboard/summary', { timeout: 20000 })]
        : [apiClient.get('/dashboard/overview', { timeout: 20000 }), apiClient.get('/farms', { timeout: 20000 })];
      const [firstResult, farmsResult] = await Promise.allSettled(requests);
      if (firstResult.status === 'rejected' || farmsResult.status === 'rejected') {
        if (requestId !== workspaceRequestRef.current) return;
        const failed = firstResult.status === 'rejected' ? firstResult.reason : farmsResult.reason;
        if (failed.status === 401 || failed.status === 403) return signOut();
        if (!(isSystemAdmin && farmsResult.status === 'rejected')) {
          setNotice(failed.message || 'Some workspace data is taking longer than expected.');
        }
      }
      const firstResponse = firstResult.status === 'fulfilled' ? firstResult.value : null;
      const secondResponse = farmsResult.status === 'fulfilled' ? farmsResult.value : null;
      const overviewResponse = isSystemAdmin ? null : firstResponse;
      const farmsResponse = isSystemAdmin ? firstResponse : secondResponse;
      setOverview(overviewResponse?.data || null);
      setFarms(Array.isArray(farmsResponse?.data) ? farmsResponse.data : []);
      try {
        sessionStorage.setItem(WORKSPACE_CACHE_KEY, JSON.stringify({
          overview: overviewResponse?.data || null,
          farms: Array.isArray(farmsResponse?.data) ? farmsResponse.data : [],
        }));
      } catch { /* cache is optional */ }
      const adminSummaryResponse = isSystemAdmin ? secondResponse : null;
      if (requestId !== workspaceRequestRef.current) return;
      if (isSystemAdmin && adminSummaryResponse?.data?.totalUsers !== undefined) {
        setOverview((current) => ({
          ...(current || {}),
          adminSummary: adminSummaryResponse.data,
        }));
      }
    } catch (error) {
      if (error.status === 401 || error.status === 403) signOut();
      else setNotice(error.message || 'Unable to load workspace data');
    } finally { if (requestId === workspaceRequestRef.current) setLoading(false); }
  };

  useEffect(() => {
    if (token) {
      const cached = getCachedWorkspace();
      if (cached) {
        setOverview(cached.overview || null);
        setFarms(Array.isArray(cached.farms) ? cached.farms : []);
      }
      apiClient.setAuthToken(token);
      if (view === 'dashboard' || view === 'farms') loadWorkspace();
      else { workspaceRequestRef.current += 1; setLoading(false); setNotice(null); }
    }
  }, [token, view]);

  if (!token) return <Login onLogin={(session) => {
    localStorage.setItem(TOKEN_KEY, session.accessToken);
    localStorage.setItem('farmwise.refreshToken', session.refreshToken || '');
    localStorage.setItem('farmwise.user', JSON.stringify(session.user));
    apiClient.setAuthToken(session.accessToken); setUser(session.user); setToken(session.accessToken);
  }} />;

  const firstName = user?.firstName || user?.first_name || 'Farmer';
  return (
    <DashboardLayout view={view} onViewChange={setView} user={user} isSystemAdmin={isSystemAdmin} onSignOut={signOut} onNotifications={() => setView('notifications')} loading={loading} notice={notice} onDismissNotice={() => setNotice(null)}>
        {view === 'dashboard' && <Dashboard overview={overview} farms={farms} loading={loading} onViewFarms={() => setView('farms')} isSystemAdmin={isSystemAdmin} onViewChange={setView} />}
        {view === 'farms' && <Farms farms={farms} onCreated={(farm) => { setFarms([...farms, farm]); setNotice('Farm created successfully.'); }} onUpdated={(farm) => { setFarms(farms.map((item) => item.id === farm.id ? farm : item)); setNotice('Farm updated successfully.'); }} onDeleted={(farmId) => { setFarms(farms.filter((item) => item.id !== farmId)); setNotice('Farm deleted successfully.'); }} />}
        {view === 'records' && <Records farms={farms} />}
        {view === 'community' && <CommunityFeed user={user} />}
        {view === 'notifications' && <Notifications />}
        {view === 'account' && <Account user={user} onUpdated={(updatedUser) => { setUser(updatedUser); localStorage.setItem('farmwise.user', JSON.stringify(updatedUser)); setNotice('Profile updated successfully.'); }} />}
        {view === 'users' && <UserManagement isSuperAdmin={isSuperAdmin} />}
        {view === 'admin-farms' && <AdminFarmManagement />}
        {view === 'activities' && <AdminActivityManagement />}
        {view === 'workers' && <WorkerManagement farms={farms} />}
        {view === 'analytics' && <Analytics overview={overview} />}
    </DashboardLayout>
  );
}

function Login({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (event) => { event.preventDefault(); setBusy(true); setError(''); try {
    const result = await apiClient.post('/auth/login', { email, password }); onLogin(result.data);
  } catch (err) { setError(err.message || 'Sign in failed. Check your details.'); } finally { setBusy(false); } };
  return <div className="auth-shell"><div className="auth-art"><div className="brand"><span className="brand-mark">FW</span><span>FarmWise</span></div><div className="art-copy"><p className="eyebrow">YOUR FARM, IN FOCUS</p><h1>Make every season count.</h1><p>One calm workspace for the decisions that keep your farm moving.</p></div><div className="season-card"><span>SEASON SNAPSHOT</span><strong>Grow with clarity.</strong><small>Track the work. See the signal.</small></div></div>{mode === 'login' ? <form className="auth-form" onSubmit={submit}><p className="eyebrow">WELCOME BACK</p><h2>Sign in to FarmWise</h2><p className="muted">Your operations desk is waiting.</p>{error && <div className="notice error">{error}</div>}<label>Email address<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></label><label>Password<PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></label><button className="primary-button" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'} <span>→</span></button><p className="form-foot">New farm owner? <button type="button" className="text-button" onClick={() => { setMode('register'); setError(''); }}>Create an account</button></p></form> : <Register onBack={() => { setMode('login'); setError(''); }} />}</div>;
}

function Register({ onBack }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', verificationMethod: 'EMAIL' });
  const [pending, setPending] = useState(null); const [code, setCode] = useState('');
  const [error, setError] = useState(''); const [success, setSuccess] = useState(''); const [busy, setBusy] = useState(false);
  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });
  const submit = async (event) => { event.preventDefault(); setBusy(true); setError(''); setSuccess(''); try { const result = await apiClient.post('/auth/register', form); setPending(result.data); setSuccess(result.message || 'Verification code sent.'); } catch (err) { if (err.data?.data?.userId) setPending(err.data.data); setError(err.message || 'Registration failed.'); } finally { setBusy(false); } };
  const verify = async (event) => { event.preventDefault(); setBusy(true); setError(''); try { const result = await apiClient.post('/auth/verify-otp', { userId: pending.userId, code, channel: pending.verificationMethod || pending.channel }); setSuccess(result.message || 'Account verified. You can now sign in.'); setPending(null); setCode(''); } catch (err) { setError(err.message || 'Verification failed.'); } finally { setBusy(false); } };
  const resend = async () => { setBusy(true); setError(''); try { const result = await apiClient.post('/auth/resend-otp', { userId: pending.userId, channel: pending.verificationMethod || pending.channel }); setSuccess(result.message || 'A new verification code was sent.'); } catch (err) { setError(err.message || 'Could not resend the verification code.'); } finally { setBusy(false); } };
  if (pending) return <form className="auth-form register-form" onSubmit={verify}><button type="button" className="back-button" onClick={onBack}>← Back to sign in</button><p className="eyebrow">VERIFY YOUR ACCOUNT</p><h2>Enter your verification code</h2><p className="muted">We sent a code to {pending.email || pending.destination}. Your account will be ready after verification.</p>{error && <div className="notice error">{error}</div>}{success && <div className="notice success">{success}</div>}<label>One-time password<input inputMode="numeric" pattern="[0-9]{6}" maxLength="6" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))} required autoComplete="one-time-code" /></label><button className="primary-button" disabled={busy}>{busy ? 'Verifying...' : 'Verify account'} <span>→</span></button><button type="button" className="text-button" onClick={resend} disabled={busy}>Request a new OTP</button></form>;
  return <form className="auth-form register-form" onSubmit={submit}><button type="button" className="back-button" onClick={onBack}>← Back to sign in</button><p className="eyebrow">NEW FARM OWNER</p><h2>Create your account</h2><p className="muted">A verification code is required before your account is activated.</p>{error && <div className="notice error">{error}</div>}{success && <div className="notice success">{success}</div>}<div className="form-row"><label>First name<input value={form.firstName} onChange={update('firstName')} required autoComplete="given-name" /></label><label>Last name<input value={form.lastName} onChange={update('lastName')} required autoComplete="family-name" /></label></div><label>Email address<input type="email" value={form.email} onChange={update('email')} required autoComplete="email" /></label><label>Phone number<input type="tel" value={form.phone} onChange={update('phone')} required autoComplete="tel" placeholder="+233..." /></label><div className="form-row"><label>Password<PasswordInput value={form.password} onChange={update('password')} autoComplete="new-password" /></label><label>Confirm password<PasswordInput value={form.confirmPassword} onChange={update('confirmPassword')} autoComplete="new-password" /></label></div><label>Verification method<select value={form.verificationMethod} onChange={update('verificationMethod')}><option value="EMAIL">Email code</option><option value="SMS">SMS code</option></select></label><button className="primary-button" disabled={busy}>{busy ? 'Creating account...' : 'Send verification code'} <span>→</span></button></form>;
}

function PasswordInput({ value, onChange, autoComplete }) {
  const [visible, setVisible] = useState(false);
  return <span className="password-field"><input type={visible ? 'text' : 'password'} value={value} onChange={onChange} required autoComplete={autoComplete} /><button type="button" className="password-toggle" onClick={() => setVisible(!visible)} aria-label={visible ? 'Hide password' : 'Show password'} title={visible ? 'Hide password' : 'Show password'}>{visible ? 'Hide' : 'Show'}</button></span>;
}

function Dashboard({ overview, farms, loading, onViewFarms, isSystemAdmin, onViewChange }) {
  const stats = overview?.summary || overview || {};
  const adminSummary = overview?.adminSummary || {};
  const systemSummary = adminSummary.totalUsers ? adminSummary : null;

  return <>
    <section className="hero-band"><div><p className="eyebrow">{isSystemAdmin ? 'SYSTEM-WIDE OVERVIEW' : 'OPERATIONS OVERVIEW'}</p><h2>{isSystemAdmin ? 'Manage the full FarmWise network.' : 'Keep the important things growing.'}</h2><p className="muted">{isSystemAdmin ? 'Monitor user health, farm performance, revenue, and alerts across the platform.' : 'A live view of your farms, people, and production.'}</p></div><button className="outline-button" onClick={onViewFarms}>{isSystemAdmin ? 'Open admin dashboard' : 'Manage farms'} <span>↗</span></button></section>
    {loading && !overview && !farms.length && <div className="dashboard-skeleton" aria-label="Loading dashboard"><span /><span /><span /><span /></div>}
    <section className={`stat-grid${loading && !overview && !farms.length ? ' is-loading' : ''}`}>
      {isSystemAdmin && systemSummary ? (
        <>
          <Stat label="Total users" value={systemSummary.totalUsers || 0} detail="Registered accounts" tone="green" onClick={() => onViewChange?.('users')} />
          <Stat label="Active farms" value={systemSummary.totalFarms || 0} detail="Operational farms" tone="yellow" onClick={onViewFarms} />
          <Stat label="Workers" value={systemSummary.totalWorkers || 0} detail="Assigned workforce" tone="blue" onClick={() => onViewChange?.('workers')} />
          <Stat label="Net profit" value={`GHS ${Number(systemSummary.netProfit || 0).toLocaleString()}`} detail="System-wide result" tone="red" onClick={() => onViewChange?.('analytics')} />
        </>
      ) : (
        <>
          <Stat label="Active farms" value={farms.length || stats.farmCount || 0} detail="Connected to your account" tone="green" onClick={onViewFarms} />
          <Stat label="Livestock" value={stats.livestockCount || stats.totalLivestock || '—'} detail="Across all farms" tone="yellow" onClick={() => onViewChange?.('records')} />
          <Stat label="Production" value={stats.productionCount || stats.totalProduction || '—'} detail="Records this season" tone="blue" onClick={() => onViewChange?.('records')} />
          <Stat label="Open alerts" value={stats.alertCount || stats.activeAlerts || '—'} detail="Needs your attention" tone="red" onClick={() => onViewChange?.('notifications')} />
        </>
      )}
    </section>
    <section className="content-grid"><div className="panel"><div className="panel-heading"><div><p className="eyebrow">{isSystemAdmin ? 'SYSTEM METRICS' : 'YOUR FARMS'}</p><h3>{isSystemAdmin ? 'Admin overview' : 'Farm portfolio'}</h3></div><button className="text-button" onClick={onViewFarms}>{isSystemAdmin ? 'View network ↗' : 'View all ↗'}</button></div>{farms.length ? farms.slice(0, 4).map((farm) => <div className="farm-row" key={farm.id}><span className="farm-avatar">{(farm.name || 'F')[0]}</span><div><strong>{farm.name}</strong><small>{farm.location || farm.address || 'Location not set'}</small></div><span className="row-arrow">→</span></div>) : <Empty text={isSystemAdmin ? 'No farm records available yet.' : 'Create your first farm to start tracking operations.'} onClick={onViewFarms} />}</div><div className="panel pulse"><p className="eyebrow">{isSystemAdmin ? 'ADMIN COMMANDS' : 'QUICK START'}</p><h3>{isSystemAdmin ? 'Operations at a glance' : 'Build your farm picture'}</h3><p className="muted">{isSystemAdmin ? 'Review overall performance, user activity, and system health from one screen.' : 'Add farms and fields first, then layer in crops, livestock, and costs as the season unfolds.'}</p><button className="primary-button compact" onClick={onViewFarms}>{isSystemAdmin ? 'Open admin controls' : 'Open farm manager'} <span>→</span></button></div></section>
  </>;
}

function Stat({ label, value, detail, tone, onClick }) { return <button className={`stat-card ${tone}`} onClick={onClick} style={{border: 'none', background: 'inherit', cursor: onClick ? 'pointer' : 'default', padding: 0, width: '100%', textAlign: 'inherit'}}><span className="stat-icon" /><p>{label}</p><strong>{value}</strong><small>{detail}</small></button>; }
function Empty({ text, onClick }) { return <div className="empty"><p>{text}</p><button className="text-button" onClick={onClick}>Get started →</button></div>; }

function Farms({ farms, onCreated, onUpdated, onDeleted }) {
  farms = Array.isArray(farms) ? farms : [];
  const [open, setOpen] = useState(false); const [editingFarm, setEditingFarm] = useState(null); const [name, setName] = useState(''); const [location, setLocation] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const create = async (event) => { event.preventDefault(); setBusy(true); setError(''); try { const result = await apiClient.post('/farms', { name, location }); onCreated(result.data); setName(''); setLocation(''); setOpen(false); } catch (err) { setError(err.message || 'Could not create farm.'); } finally { setBusy(false); } };
  const update = async (event) => { event.preventDefault(); setBusy(true); setError(''); try { const result = await apiClient.put(`/farms/${editingFarm.id}`, { name, region: location }); onUpdated(result.data); setEditingFarm(null); } catch (err) { setError(err.message || 'Could not update farm.'); } finally { setBusy(false); } };
  const remove = async (farm) => { if (!window.confirm(`Delete ${farm.name}? This removes its farm records.`)) return; setBusy(true); setError(''); try { await apiClient.delete(`/farms/${farm.id}`); onDeleted(farm.id); } catch (err) { setError(err.message || 'Could not delete farm.'); } finally { setBusy(false); } };
  return <section><div className="section-heading"><div><p className="eyebrow">PORTFOLIO</p><h2>My farms</h2><p className="muted">Keep each operation organized in one place.</p></div><button className="primary-button" onClick={() => { setEditingFarm(null); setOpen(!open); }}>+ Add farm</button></div>{(open || editingFarm) && <form className="create-form" onSubmit={editingFarm ? update : create}>{error && <div className="notice error">{error}</div>}<label>Farm name<input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Green Valley Farm" /></label><label>Location<input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Town or region" /></label><button className="primary-button" disabled={busy}>{busy ? 'Saving...' : editingFarm ? 'Update farm' : 'Create farm'}</button></form>}<div className="farm-grid">{farms.map((farm) => <article className="farm-card" key={farm.id}><div className="farm-card-top"><span className="farm-avatar large">{(farm.name || 'F')[0]}</span><span className="live-badge">{farm.status || 'ACTIVE'}</span></div><h3>{farm.name}</h3><p>{farm.region || farm.location || farm.address || 'Location not set'}</p><div className="farm-card-foot"><button className="text-button" type="button" onClick={() => { setEditingFarm(farm); setOpen(false); setName(farm.name); setLocation(farm.region || ''); setError(''); }}>Edit</button><button className="text-button" type="button" onClick={() => remove(farm)} disabled={busy}>Delete</button></div></article>)}{!farms.length && <div className="panel empty-wide"><h3>No farms yet</h3><p className="muted">Create a farm to unlock fields, livestock, crop cycles, and financial records.</p></div>}</div></section>;
}

function Records({ farms }) {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const items = [
    ['Fields', 'Map boundaries, acreage, and field activity', 'farm', 'Organize field boundaries, acreage, soil notes, and recent field work.'],
    ['Livestock', 'Track animals, health, and breeding records', 'livestock', 'Keep animal groups, health checks, treatments, and breeding records together.'],
    ['Crops', 'Monitor cycles, inputs, and growth', 'crops', 'Follow crop cycles from planting through growth observations and harvest.'],
    ['Finance', 'Follow expenses, sales, and profitability', 'finance', 'Track the costs and sales that shape profitability across your farms.'],
    ['Inventory', 'Know what is in storage and where', 'inventory', 'Manage stock levels, storage locations, receipts, issues, and transfers.'],
    ['Activities', 'Log work, observations, and harvests', 'activity', 'Record field work, observations, tasks, and harvest activity as it happens.'],
  ];
  const selected = items.find(([title]) => title === selectedRecord);

  if (selectedRecord === 'Fields') return <FieldManagement farms={farms} onBack={() => setSelectedRecord(null)} />;

  if (selected) {
    return <section className="record-page">
      <button className="back-button" type="button" onClick={() => setSelectedRecord(null)}>← Back to records</button>
      <div className="record-page-heading"><span className={`record-icon ${selected[2]}`} /><div><p className="eyebrow">{selected[0].toUpperCase()}</p><h2>{selected[0]}</h2><p className="muted">{selected[3]}</p></div></div>
      <div className="record-content-panel"><div><h3>{selected[0]} records</h3><p className="muted">Choose a farm to start viewing and managing {selected[0].toLowerCase()} records.</p></div><div className="record-detail-actions"><select aria-label={`Select farm for ${selected[0]}`} defaultValue=""><option value="" disabled>Select a farm</option>{farms.map((farm) => <option value={farm.id} key={farm.id}>{farm.name}</option>)}</select><button className="primary-button" type="button">Add record <span>+</span></button></div></div>
    </section>;
  }

  return <section><div className="section-heading"><div><p className="eyebrow">OPERATIONS</p><h2>Records</h2><p className="muted">The working layers behind every farm decision.</p></div><span className="record-count">{farms.length} farm{farms.length === 1 ? '' : 's'} connected</span></div><div className="record-grid">{items.map(([title, text, icon]) => <button className="record-card" type="button" key={title} onClick={() => setSelectedRecord(title)}><span className={`record-icon ${icon}`} /><h3>{title}</h3><p>{text}</p><span className="record-open">Open records <span aria-hidden="true">→</span></span></button>)}</div></section>;
}

function FieldManagement({ farms, onBack }) {
  const [farmId, setFarmId] = useState(farms[0]?.id || ''); const [fields, setFields] = useState([]); const [form, setForm] = useState({ name: '', area: '', areaUnit: 'HECTARE' }); const [editing, setEditing] = useState(null); const [loading, setLoading] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  useEffect(() => { if (!farmId) return; setLoading(true); setError(''); apiClient.get(`/farms/${farmId}/fields`).then((result) => setFields(result.data || [])).catch((err) => setError(err.message || 'Unable to load fields.')).finally(() => setLoading(false)); }, [farmId]);
  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });
  const save = async (event) => { event.preventDefault(); setBusy(true); setError(''); try { const result = editing ? await apiClient.put(`/farms/${farmId}/fields/${editing.id}`, form) : await apiClient.post(`/farms/${farmId}/fields`, form); setFields(editing ? fields.map((item) => item.id === editing.id ? result.data : item) : [result.data, ...fields]); setForm({ name: '', area: '', areaUnit: 'HECTARE' }); setEditing(null); } catch (err) { setError(err.message || 'Unable to save field.'); } finally { setBusy(false); } };
  const remove = async (field) => { if (!window.confirm(`Delete ${field.name}?`)) return; setBusy(true); setError(''); try { await apiClient.delete(`/farms/${farmId}/fields/${field.id}`); setFields(fields.filter((item) => item.id !== field.id)); } catch (err) { setError(err.message || 'Unable to delete field.'); } finally { setBusy(false); } };
  return <section className="record-page"><button className="back-button" type="button" onClick={onBack}>← Back to records</button><div className="section-heading"><div><p className="eyebrow">FIELD RECORDS</p><h2>Fields</h2><p className="muted">Create, update, and remove field records for each farm.</p></div></div>{!farms.length ? <div className="panel empty-wide"><h3>Create a farm first</h3></div> : <><label>Select farm<select value={farmId} onChange={(event) => setFarmId(event.target.value)}>{farms.map((farm) => <option value={farm.id} key={farm.id}>{farm.name}</option>)}</select></label>{error && <div className="notice error">{error}</div>}<form className="create-form" onSubmit={save}><label>Field name<input value={form.name} onChange={update('name')} required /></label><label>Area<input type="number" min="0.01" step="0.01" value={form.area} onChange={update('area')} required /></label><label>Unit<select value={form.areaUnit} onChange={update('areaUnit')}><option value="HECTARE">Hectare</option><option value="ACRE">Acre</option><option value="SQUARE_METER">Square meter</option></select></label><button className="primary-button" disabled={busy}>{busy ? 'Saving...' : editing ? 'Update field' : 'Add field'}</button>{editing && <button className="text-button" type="button" onClick={() => { setEditing(null); setForm({ name: '', area: '', areaUnit: 'HECTARE' }); }}>Cancel</button>}</form>{loading ? <div className="loading-line" aria-label="Loading fields" /> : <div className="farm-grid">{fields.map((field) => <article className="farm-card" key={field.id}><div className="farm-card-top"><span className="farm-avatar large">{(field.name || 'F')[0]}</span><span className="live-badge">{field.status}</span></div><h3>{field.name}</h3><p>{field.area} {field.areaUnit}</p><div className="farm-card-foot"><button className="text-button" type="button" onClick={() => { setEditing(field); setForm({ name: field.name, area: field.area, areaUnit: field.areaUnit }); }}>Edit</button><button className="text-button" type="button" onClick={() => remove(field)} disabled={busy}>Delete</button></div></article>)}{!fields.length && <div className="panel empty-wide"><h3>No fields yet</h3><p className="muted">Add a field record to start organizing this farm.</p></div>}</div>}</>}</section>;
}

function CommunityFeed({ user }) {
  const [posts, setPosts] = useState([]);
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('General Agriculture');
  const [media, setMedia] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingBody, setEditingBody] = useState('');
  const [editingCategory, setEditingCategory] = useState('General Agriculture');

  const load = async (nextCursor) => {
    try {
      const result = await apiClient.get(`/community/posts${nextCursor ? `?cursor=${nextCursor}` : ''}`, { timeout: 20000 });
      setPosts(nextCursor ? [...posts, ...result.data.posts] : result.data.posts);
      setCursor(result.data.nextCursor);
    } catch (err) {
      setError(err.message || 'Unable to load community feed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const publish = async (event) => {
    event.preventDefault();
    if (!body.trim() && !media.length) return;
    setBusy(true);
    setError('');
    try {
      const result = await apiClient.post('/community/posts', { body, category, media });
      setPosts([result.data, ...posts]);
      setBody('');
      setMedia([]);
    } catch (err) {
      setError(err.message || 'Could not publish post.');
    } finally {
      setBusy(false);
    }
  };

  const chooseMedia = (event) => {
    const files = Array.from(event.target.files || []).slice(0, 4);
    Promise.all(files.map((file) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ mediaType: file.type.startsWith('video/') ? 'video' : 'image', dataUrl: reader.result });
      reader.readAsDataURL(file);
    }))).then(setMedia);
  };

  const react = async (post, liked) => {
    try {
      await apiClient.request(`/community/posts/${post.id}/likes`, { method: liked ? 'DELETE' : 'POST' });
      setPosts(posts.map((item) => item.id === post.id ? { ...item, _count: { ...item._count, likes: item._count.likes + (liked ? -1 : 1) }, viewerLiked: !liked } : item));
    } catch (err) {
      setError(err.message || 'Could not update like.');
    }
  };

  const startEdit = (post) => {
    setEditingPostId(post.id);
    setEditingBody(post.body);
    setEditingCategory(post.category);
  };

  const saveEdit = async (postId) => {
    if (!editingBody.trim()) return;
    setBusy(true);
    setError('');
    try {
      const result = await apiClient.put(`/community/posts/${postId}`, { body: editingBody, category: editingCategory });
      setPosts(posts.map((p) => p.id === postId ? result.data : p));
      setEditingPostId(null);
      setEditingBody('');
      setEditingCategory('General Agriculture');
    } catch (err) {
      setError(err.message || 'Could not edit post.');
    } finally {
      setBusy(false);
    }
  };

  const deletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    setBusy(true);
    setError('');
    try {
      await apiClient.delete(`/community/posts/${postId}`);
      setPosts(posts.filter((p) => p.id !== postId));
    } catch (err) {
      setError(err.message || 'Could not delete post.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="community-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">FARMWISE COMMUNITY</p>
          <h2>Share what is growing.</h2>
          <p className="muted">Practical ideas, farm experiences, and questions from the community.</p>
        </div>
      </div>
      <form className="community-composer" onSubmit={publish}>
        {error && <div className="notice error">{error}</div>}
        <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="What's happening on your farm?" maxLength="5000" />
        <div className="composer-actions">
          <label className="media-button">
            Add photo or video
            <input type="file" accept="image/png,image/jpeg,image/webp,video/mp4,video/webm" multiple onChange={chooseMedia} />
          </label>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option>General Agriculture</option>
            <option>Farming Tips</option>
            <option>Livestock</option>
            <option>Crops</option>
            <option>Harvest</option>
            <option>Question</option>
          </select>
          <button className="primary-button" disabled={busy}>{busy ? 'Publishing...' : 'Publish post'} <span>→</span></button>
        </div>
        {media.length > 0 && <small className="muted">{media.length} media item{media.length === 1 ? '' : 's'} ready to publish</small>}
      </form>
      <div className="community-list">
        {loading && <div className="loading-line" aria-label="Loading community posts" />}
        {posts.map((post) => (
          <CommunityPost
            key={post.id}
            post={post}
            onLike={react}
            currentUserId={user?.id}
            onEdit={startEdit}
            onDelete={deletePost}
            onSaveEdit={saveEdit}
            editingPostId={editingPostId}
            editingBody={editingBody}
            setEditingBody={setEditingBody}
            editingCategory={editingCategory}
            setEditingCategory={setEditingCategory}
          />
        ))}
        {!loading && !posts.length && <div className="panel empty-wide"><h3>No community posts yet</h3><p className="muted">Start the conversation with a farm update or useful tip.</p></div>}
        {cursor && <button className="outline-button load-more" onClick={() => load(cursor)}>Load more posts</button>}
      </div>
    </section>
  );
}

function CommunityPost({ post, onLike, currentUserId, onEdit, onDelete, onSaveEdit, editingPostId, editingBody, setEditingBody, editingCategory, setEditingCategory }) {
  const author = post.author || {};
  const isAuthor = currentUserId === post.authorId;
  const isEditing = editingPostId === post.id;

  return (
    <article className="community-post">
      <div className="community-author">
        <span className="community-avatar">
          {author.profilePictureUrl ? <img loading="lazy" decoding="async" src={author.profilePictureUrl} alt="" /> : (author.firstName || 'F')[0].toUpperCase()}
        </span>
        <div>
          <strong>{author.firstName} {author.lastName}</strong>
          <small>{post.category || 'Agriculture'} · {new Date(post.createdAt).toLocaleDateString()}</small>
        </div>
        <div className="post-actions">
          {isAuthor && (
            <>
              <button className="text-button" title="Edit post" onClick={() => onEdit(post)}>✎</button>
              <button className="text-button delete-button" title="Delete post" onClick={() => onDelete(post.id)}>✕</button>
            </>
          )}
          <button className="text-button report-button" title="Report post">Report</button>
        </div>
      </div>
      {isEditing ? (
        <div className="edit-post-form">
          <textarea value={editingBody} onChange={(e) => setEditingBody(e.target.value)} maxLength="5000" />
          <select value={editingCategory} onChange={(e) => setEditingCategory(e.target.value)}>
            <option>General Agriculture</option>
            <option>Farming Tips</option>
            <option>Livestock</option>
            <option>Crops</option>
            <option>Harvest</option>
            <option>Question</option>
          </select>
          <div className="edit-actions">
            <button className="primary-button" onClick={() => onSaveEdit(post.id)}>Save changes</button>
            <button className="outline-button" onClick={() => { setEditingBody(''); setEditingCategory('General Agriculture'); }}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          {post.body && <p className="community-body">{post.body}</p>}
          {post.media?.length > 0 && <div className="community-media">{post.media.map((item) => item.mediaType === 'video' ? <video controls preload="metadata" src={item.dataUrl} key={item.id} /> : <img loading="lazy" decoding="async" src={item.dataUrl} alt="Community post" key={item.id} />)}</div>}
        </>
      )}
      <div className="community-actions">
        <button className={post.viewerLiked ? 'text-button liked' : 'text-button'} onClick={() => onLike(post, post.viewerLiked)}>{post.viewerLiked ? 'Liked' : 'Like'} · {post._count?.likes || 0}</button>
        <span>{post._count?.comments || 0} comments</span>
      </div>
    </article>
  );
}

function Notifications() {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => { apiClient.get('/notifications').then((result) => setItems(result.data || [])).catch((err) => setError(err.message || 'Unable to load notifications.')).finally(() => setLoading(false)); }, []);
  const markRead = async (item) => { if (item.status !== 'UNREAD') return; try { await apiClient.patch(`/notifications/${item.id}/read`, {}); setItems(items.map((entry) => entry.id === item.id ? { ...entry, status: 'READ' } : entry)); } catch (err) { setError(err.message || 'Unable to mark notification as read.'); } };
  return <section><div className="section-heading"><div><p className="eyebrow">INBOX</p><h2>Notifications</h2><p className="muted">Updates and activity connected to your FarmWise account.</p></div></div>{error && <div className="notice error">{error}</div>}{loading ? <div className="loading-line" aria-label="Loading notifications" /> : <div className="notification-list">{items.map((item) => <button className={`notification-item ${item.status === 'UNREAD' ? 'unread' : ''}`} key={item.id} onClick={() => markRead(item)}><span className="notification-item-icon">&#128276;</span><span><strong>{item.title}</strong><small>{item.message}</small><em>{new Date(item.createdAt).toLocaleString()}</em></span></button>)}{!items.length && <div className="panel empty-wide"><h3>No notifications</h3><p className="muted">You are all caught up.</p></div>}</div>}</section>;
}

function Account({ user, onUpdated }) {
  const [form, setForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '', profilePictureUrl: user?.profilePictureUrl || null });
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const submit = async (event) => { event.preventDefault(); setBusy(true); setError(''); try { const result = await apiClient.patch('/auth/me', form); onUpdated(result.data.user); } catch (err) { setError(err.message || 'Could not update your profile.'); } finally { setBusy(false); } };
  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });
  const selectPicture = (event) => { const file = event.target.files?.[0]; if (!file) return; if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 4 * 1024 * 1024) { setError('Choose a PNG, JPG, or WEBP image smaller than 4 MB.'); return; } const reader = new FileReader(); reader.onload = () => setForm({ ...form, profilePictureUrl: reader.result }); reader.readAsDataURL(file); };
  return <section><div className="section-heading"><div><p className="eyebrow">ACCOUNT</p><h2>Personal details</h2><p className="muted">Keep your FarmWise contact details current.</p></div></div><form className="account-form" onSubmit={submit}>{error && <div className="notice error">{error}</div>}<div className="profile-picture-row"><div className="profile-picture">{form.profilePictureUrl ? <img src={form.profilePictureUrl} alt="Profile" /> : (user?.firstName || 'F')[0].toUpperCase()}</div><label className="picture-picker">Profile picture<input type="file" accept="image/png,image/jpeg,image/webp" onChange={selectPicture} /></label></div><div className="form-row"><label>First name<input value={form.firstName} onChange={update('firstName')} required autoComplete="given-name" /></label><label>Last name<input value={form.lastName} onChange={update('lastName')} required autoComplete="family-name" /></label></div><label>Phone number<input value={form.phone} onChange={update('phone')} required autoComplete="tel" /></label><label>Email address<input value={user?.email || ''} disabled /></label><button className="primary-button" disabled={busy}>{busy ? 'Saving...' : 'Save changes'} <span>→</span></button></form></section>;
}

function UserManagement({ isSuperAdmin }) {
  const [users, setUsers] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => { apiClient.get('/admin/users').then((result) => setUsers(result.data || [])).catch((err) => setError(err.message || 'Unable to load users.')).finally(() => setLoading(false)); }, []);
  const changeStatus = async (user, status) => { setError(''); try { const result = await apiClient.patch(`/admin/users/${user.id}/status`, { status }); setUsers(users.map((item) => item.id === user.id ? result.data : item)); } catch (err) { setError(err.message || 'Unable to update user.'); } };
  const changeAdmin = async (user, isAdmin) => { setError(''); try { await apiClient[isAdmin ? 'delete' : 'post'](`/admin/users/${user.id}/admin`, isAdmin ? undefined : {}); const result = await apiClient.get('/admin/users'); setUsers(result.data || []); } catch (err) { setError(err.message || 'Unable to update admin access.'); } };
  return <section><div className="section-heading"><div><p className="eyebrow">SYSTEM MANAGEMENT</p><h2>Registered users</h2><p className="muted">Review accounts and control access to the platform.</p></div><span className="record-count">{users.length} user{users.length === 1 ? '' : 's'}</span></div>{error && <div className="notice error">{error}</div>}{loading ? <div className="loading-line" aria-label="Loading users" /> : <div className="farm-grid">{users.map((u) => { const isAdmin = u.roles?.some((r) => (r.role?.name || r.name) === 'ADMIN'); return <div className="farm-card" key={u.id}><div className="farm-card-top"><span className="farm-avatar large">{u.profilePictureUrl ? <img src={u.profilePictureUrl} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}} /> : (u.firstName || 'U')[0]}</span><select value={u.status} onChange={(event) => changeStatus(u, event.target.value)} aria-label={`Status for ${u.email}`}><option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option><option value="SUSPENDED">SUSPENDED</option><option value="PENDING_VERIFICATION">PENDING</option></select></div><h3>{u.firstName} {u.lastName}</h3><p>{u.email}</p><div className="farm-card-foot"><span>{u.roles?.map(r => r.role?.name || r.name).join(', ') || 'User'}</span>{isSuperAdmin && <button className="text-button" type="button" onClick={() => changeAdmin(u, isAdmin)}>{isAdmin ? 'Remove admin' : 'Make admin'}</button>}</div></div>; })}{!users.length && <div className="panel empty-wide"><h3>No users found</h3><p className="muted">Users will appear here as they register.</p></div>}</div>}</section>;
}

function AdminFarmManagement() {
  const [farms, setFarms] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => { apiClient.get('/admin/farms').then((result) => setFarms(result.data || [])).catch((err) => setError(err.message || 'Unable to load farms.')).finally(() => setLoading(false)); }, []);
  const update = async (farm, data) => { setError(''); try { const result = await apiClient.patch(`/admin/farms/${farm.id}`, data); setFarms(farms.map((item) => item.id === farm.id ? { ...item, ...result.data } : item)); } catch (err) { setError(err.message || 'Unable to update farm.'); } };
  return <section><div className="section-heading"><div><p className="eyebrow">SYSTEM MANAGEMENT</p><h2>All farms</h2><p className="muted">Monitor farm ownership, membership, and operating status.</p></div><span className="record-count">{farms.length} farm{farms.length === 1 ? '' : 's'}</span></div>{error && <div className="notice error">{error}</div>}{loading ? <div className="loading-line" aria-label="Loading farms" /> : <div className="farm-grid">{farms.map((farm) => <div className="farm-card" key={farm.id}><div className="farm-card-top"><span className="farm-avatar large">{(farm.name || 'F')[0]}</span><select value={farm.status} onChange={(event) => update(farm, { status: event.target.value })} aria-label={`Status for ${farm.name}`}><option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option><option value="ARCHIVED">ARCHIVED</option></select></div><h3>{farm.name}</h3><p>Owner: {farm.owner?.email || 'Unknown'}</p><div className="farm-card-foot"><span>{farm._count?.farmMembers || 0} members</span><span>{farm._count?.farmActivities || 0} activities</span></div></div>)}{!farms.length && <div className="panel empty-wide"><h3>No farms found</h3><p className="muted">Farms will appear here as owners create them.</p></div>}</div>}</section>;
}

function AdminActivityManagement() {
  const [activities, setActivities] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => { apiClient.get('/admin/activities').then((result) => setActivities(result.data || [])).catch((err) => setError(err.message || 'Unable to load activities.')).finally(() => setLoading(false)); }, []);
  const update = async (activity, data) => { setError(''); try { const result = await apiClient.patch(`/admin/activities/${activity.id}`, data); setActivities(activities.map((item) => item.id === activity.id ? { ...item, ...result.data } : item)); } catch (err) { setError(err.message || 'Unable to update activity.'); } };
  return <section><div className="section-heading"><div><p className="eyebrow">SYSTEM MANAGEMENT</p><h2>Activities</h2><p className="muted">Review and update work recorded across every farm.</p></div><span className="record-count">{activities.length} recent</span></div>{error && <div className="notice error">{error}</div>}{loading ? <div className="loading-line" aria-label="Loading activities" /> : <div className="farm-grid">{activities.map((activity) => <div className="farm-card" key={activity.id}><div className="farm-card-top"><span className="farm-avatar large">{(activity.title || 'A')[0]}</span><select value={activity.status} onChange={(event) => update(activity, { status: event.target.value })} aria-label={`Status for ${activity.title}`}><option value="PLANNED">PLANNED</option><option value="IN_PROGRESS">IN PROGRESS</option><option value="COMPLETED">COMPLETED</option><option value="CANCELLED">CANCELLED</option><option value="OVERDUE">OVERDUE</option></select></div><h3>{activity.title}</h3><p>{activity.farm?.name || 'Unknown farm'} · {activity.category}</p><div className="farm-card-foot"><span>{activity.user?.firstName} {activity.user?.lastName}</span><select value={activity.priority} onChange={(event) => update(activity, { priority: event.target.value })} aria-label={`Priority for ${activity.title}`}><option value="LOW">LOW</option><option value="NORMAL">NORMAL</option><option value="HIGH">HIGH</option><option value="URGENT">URGENT</option></select></div></div>)}{!activities.length && <div className="panel empty-wide"><h3>No activities found</h3><p className="muted">Farm activities will appear here as work is recorded.</p></div>}</div>}</section>;
}

function WorkerManagement({ farms }) {
  const [selectedFarmId, setSelectedFarmId] = useState(farms[0]?.id || ''); const [workers, setWorkers] = useState([]); const [email, setEmail] = useState(''); const [role, setRole] = useState('WORKER'); const [loading, setLoading] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  useEffect(() => { if (!selectedFarmId) { setWorkers([]); return; } setLoading(true); setError(''); apiClient.get(`/farms/${selectedFarmId}/workers`).then((result) => setWorkers(result.data || [])).catch((err) => setError(err.message || 'Unable to load workers.')).finally(() => setLoading(false)); }, [selectedFarmId]);
  const add = async (event) => { event.preventDefault(); setBusy(true); setError(''); try { const result = await apiClient.post(`/farms/${selectedFarmId}/workers`, { email, role }); setWorkers([result.data, ...workers]); setEmail(''); } catch (err) { setError(err.message || 'Unable to add worker.'); } finally { setBusy(false); } };
  const changeRole = async (member, nextRole) => { setError(''); try { const result = await apiClient.patch(`/farms/${selectedFarmId}/workers/${member.id}`, { role: nextRole }); setWorkers(workers.map((item) => item.id === member.id ? result.data : item)); } catch (err) { setError(err.message || 'Unable to update worker.'); } };
  const remove = async (member) => { setError(''); try { await apiClient.delete(`/farms/${selectedFarmId}/workers/${member.id}`); setWorkers(workers.filter((item) => item.id !== member.id)); } catch (err) { setError(err.message || 'Unable to remove worker.'); } };
  return <section><div className="section-heading"><div><p className="eyebrow">WORKFORCE</p><h2>Farm workers & staff</h2><p className="muted">Add and manage the people working on each farm.</p></div><span className="record-count">{workers.length} worker{workers.length === 1 ? '' : 's'}</span></div>{error && <div className="notice error">{error}</div>}{!farms.length ? <div className="panel empty-wide"><h3>Create a farm first</h3><p className="muted">Workers can be assigned after you create a farm.</p></div> : <><label>Select farm<select value={selectedFarmId} onChange={(event) => setSelectedFarmId(event.target.value)}>{farms.map((farm) => <option value={farm.id} key={farm.id}>{farm.name}</option>)}</select></label><form className="create-form" onSubmit={add}><label>Worker email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Registered user email" required /></label><label>Role<select value={role} onChange={(event) => setRole(event.target.value)}><option value="WORKER">Worker</option><option value="MANAGER">Manager</option></select></label><button className="primary-button" disabled={busy}>{busy ? 'Adding...' : 'Add worker'} <span>+</span></button></form>{loading ? <div className="loading-line" aria-label="Loading workers" /> : <div className="farm-grid">{workers.map((member) => <div className="farm-card" key={member.id}><div className="farm-card-top"><span className="farm-avatar large">{(member.user?.firstName || 'W')[0]}</span><select value={member.role} onChange={(event) => changeRole(member, event.target.value)} aria-label={`Role for ${member.user?.email || 'worker'}`}><option value="WORKER">WORKER</option><option value="MANAGER">MANAGER</option></select></div><h3>{member.user?.firstName} {member.user?.lastName}</h3><p>{member.user?.email}</p><div className="farm-card-foot"><span>{member.status}</span><button className="text-button" type="button" onClick={() => remove(member)}>Remove</button></div></div>)}{!workers.length && <div className="panel empty-wide"><h3>No workers assigned</h3><p className="muted">Add a registered FarmWise user to this farm.</p></div>}</div>}</>}</section>;
}

function Analytics({ overview }) {
  const adminSummary = overview?.adminSummary || {};
  return <section><div className="section-heading"><div><p className="eyebrow">FINANCIAL ANALYTICS</p><h2>Network performance</h2><p className="muted">System-wide financial metrics and revenue trends.</p></div></div><div className="content-grid"><div className="panel"><p className="eyebrow">PROFIT & LOSS</p><h3>Net profit</h3><p style={{fontSize:'32px', fontWeight:'700', color:'var(--green)', margin:'20px 0'}}>GHS {Number(adminSummary.netProfit || 0).toLocaleString()}</p><small>System-wide net result across all active farms</small></div><div className="panel"><p className="eyebrow">SUMMARY</p><h3>Key metrics</h3><div style={{display:'grid', gap:'14px', marginTop:'20px'}}><div><strong>Total revenue</strong><p style={{margin:'6px 0 0', color:'var(--green)'}}>GHS {Number(adminSummary.totalRevenue || 0).toLocaleString()}</p></div><div><strong>Total expenses</strong><p style={{margin:'6px 0 0', color:'var(--red)'}}>GHS {Number(adminSummary.totalExpenses || 0).toLocaleString()}</p></div><div><strong>Active farms</strong><p style={{margin:'6px 0 0', color:'var(--blue)'}}>{adminSummary.totalFarms || 0}</p></div></div></div></div><div className="panel empty-wide" style={{marginTop:'20px'}}><p className="eyebrow">UPCOMING</p><h3>Advanced analytics</h3><p className="muted">Detailed revenue forecasts, seasonal trends, and farm-by-farm breakdowns coming soon.</p></div></section>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
