import React, { useEffect, useState } from 'react';
import apiClient from '../services/api';

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : 'Not recorded';
}

function dateInputValue(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : '';
}

export default function ActivityRecords({ farms, isSystemAdmin = false, onBack }) {
  const today = new Date().toISOString().slice(0, 10);
  const [activities, setActivities] = useState([]);
  const [farmId, setFarmId] = useState(farms[0]?.id || '');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ farmId: farms[0]?.id || '', title: '', description: '', category: 'WEEDING', activityDate: today, scheduledDate: '', status: 'COMPLETED', priority: 'NORMAL', cost: '', notes: '' });

  const load = async () => {
    setLoading(true);
    try {
      if (isSystemAdmin) {
        const result = await apiClient.get('/admin/activities');
        setActivities(result.data || []);
      } else {
        const results = await Promise.all(farms.map((farm) => apiClient.get(`/farms/${farm.id}/activities`)));
        setActivities(results.flatMap((result, index) => (result.data || []).map((activity) => ({ ...activity, farm: farms[index] }))));
      }
    } catch (err) {
      setError(err.message || 'Unable to load activities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [farms, isSystemAdmin]);
  useEffect(() => {
    const nextFarmId = farms[0]?.id || '';
    if (!farmId && nextFarmId) {
      setFarmId(nextFarmId);
      setForm((current) => ({ ...current, farmId: nextFarmId }));
    }
  }, [farms, farmId]);

  const updateForm = (field) => (event) => setForm({ ...form, [field]: event.target.value });
  const save = async (event) => {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      const payload = { ...form, cost: form.cost === '' ? undefined : Number(form.cost), scheduledDate: form.scheduledDate || undefined, notes: form.notes || undefined };
      const result = editingId
        ? await apiClient.patch(`/farms/${form.farmId}/activities/${editingId}`, payload)
        : await apiClient.post(`/farms/${form.farmId}/activities`, payload);
      const nextActivity = { ...result.data, farm: farms.find((farm) => farm.id === form.farmId) };
      setActivities(editingId ? activities.map((item) => item.id === editingId ? nextActivity : item) : [nextActivity, ...activities]);
      setSelected(nextActivity);
      setEditingId(null);
      setForm({ ...form, title: '', description: '', scheduledDate: '', cost: '', notes: '' });
    } catch (err) { setError(err.message || `Unable to ${editingId ? 'update' : 'create'} activity.`); }
    finally { setBusy(false); }
  };

  const updateStatus = async (activity, status) => {
    try {
      const result = isSystemAdmin
        ? await apiClient.patch(`/admin/activities/${activity.id}`, { status })
        : await apiClient.patch(`/farms/${activity.farmId}/activities/${activity.id}`, { ...activity, status });
      setActivities(activities.map((item) => item.id === activity.id ? { ...item, ...result.data } : item));
      setSelected((current) => current?.id === activity.id ? { ...current, ...result.data } : current);
    } catch (err) { setError(err.message || 'Unable to update activity.'); }
  };

  const edit = (activity) => {
    setEditingId(activity.id);
    setForm({ farmId: activity.farmId, title: activity.title || '', description: activity.description || '', category: activity.category || 'OTHER', activityDate: dateInputValue(activity.activityDate), scheduledDate: dateInputValue(activity.scheduledDate), status: activity.status || 'PLANNED', priority: activity.priority || 'NORMAL', cost: activity.cost ?? '', notes: activity.notes || '' });
    setSelected(null);
  };

  const remove = async (activity) => {
    if (!window.confirm(`Delete activity "${activity.title}"?`)) return;
    setBusy(true); setError('');
    try {
      await apiClient.delete(`/farms/${activity.farmId}/activities/${activity.id}`);
      setActivities(activities.filter((item) => item.id !== activity.id));
      setSelected(null);
    } catch (err) { setError(err.message || 'Unable to delete activity.'); }
    finally { setBusy(false); }
  };

  if (selected) return <section className="record-page"><button className="back-button" type="button" onClick={() => setSelected(null)}>← Back to activities</button><div className="section-heading"><div><p className="eyebrow">FULL ACTIVITY RECORD</p><h2>{selected.title}</h2><p className="muted">{selected.farm?.name || 'Farm not available'} · {selected.category}</p></div><span className="live-badge">{selected.status}</span></div><article className="record-content-panel activity-detail"><div className="activity-detail-grid"><p><strong>Description</strong><span>{selected.description || 'Not recorded'}</span></p><p><strong>Activity date</strong><span>{formatDate(selected.activityDate)}</span></p><p><strong>Planned date</strong><span>{formatDate(selected.scheduledDate)}</span></p><p><strong>Status</strong><span>{selected.status} · {selected.priority}</span></p><p><strong>Cost</strong><span>{selected.cost === null || selected.cost === undefined ? 'Not recorded' : `${selected.currency || 'GHS'} ${selected.cost}`}</span></p><p><strong>Field</strong><span>{selected.fieldId || 'Not linked'}</span></p><p><strong>Crop cycle</strong><span>{selected.cropCycleId || 'Not linked'}</span></p><p><strong>Assigned to</strong><span>{selected.assignee ? `${selected.assignee.firstName} ${selected.assignee.lastName}` : 'Not assigned'}</span></p><p><strong>Recorded by</strong><span>{selected.user ? `${selected.user.firstName} ${selected.user.lastName}` : 'Not available'}</span></p><p><strong>Notes</strong><span>{selected.notes || 'No notes recorded'}</span></p></div><div className="button-row"><button className="primary-button" type="button" onClick={() => edit(selected)}>Edit activity</button><button className="text-button" type="button" onClick={() => remove(selected)} disabled={busy}>Delete activity</button></div></article></section>;

  return <section>
    {onBack && <button className="back-button" type="button" onClick={onBack}>← Back to records</button>}
    <div className="section-heading"><div><p className="eyebrow">FARM OPERATIONS</p><h2>Activities</h2><p className="muted">Record and manage work across your farms.</p></div><span className="record-count">{activities.length} recent</span></div>
    {error && <div className="notice error">{error}</div>}
    <form className="create-form activity-form" onSubmit={save}>
      <label>Farm<select value={form.farmId} onChange={updateForm('farmId')} required>{farms.map((farm) => <option value={farm.id} key={farm.id}>{farm.name}</option>)}</select></label>
      <label>Activity<input value={form.title} onChange={updateForm('title')} required placeholder="e.g. Weed maize plot" /></label>
      <label>Category<select value={form.category} onChange={updateForm('category')}><option value="WEEDING">Weeding</option><option value="PLANTING">Planting</option><option value="LAND_PREPARATION">Land preparation</option><option value="OTHER">Other</option></select></label>
      <label>Description<input value={form.description} onChange={updateForm('description')} required placeholder="What was done?" /></label>
      <label>Activity date<input type="date" value={form.activityDate} onChange={updateForm('activityDate')} required /></label>
      <label>Planned date<input type="date" value={form.scheduledDate} onChange={updateForm('scheduledDate')} /></label>
      <label>Cost<input type="number" min="0" step="0.01" value={form.cost} onChange={updateForm('cost')} /></label>
      <label>Status<select value={form.status} onChange={updateForm('status')}><option value="PLANNED">Planned</option><option value="IN_PROGRESS">In progress</option><option value="COMPLETED">Completed</option></select></label>
      <label>Notes<input value={form.notes} onChange={updateForm('notes')} placeholder="Labour and plot details" /></label>
      <button className="primary-button" disabled={busy || !form.farmId}>{busy ? 'Saving...' : editingId ? 'Save changes' : 'Record activity'} <span>{editingId ? '✓' : '+'}</span></button>
      {editingId && <button className="text-button" type="button" onClick={() => { setEditingId(null); setForm({ ...form, title: '', description: '', scheduledDate: '', cost: '', notes: '' }); }}>Cancel edit</button>}
    </form>
    {selected && <article className="record-content-panel activity-detail"><div><p className="eyebrow">FULL ACTIVITY RECORD</p><h3>{selected.title}</h3><p className="muted">{selected.farm?.name || 'Farm not available'} · {selected.category}</p></div><div className="activity-detail-grid"><p><strong>Description</strong><span>{selected.description || 'Not recorded'}</span></p><p><strong>Activity date</strong><span>{formatDate(selected.activityDate)}</span></p><p><strong>Planned date</strong><span>{formatDate(selected.scheduledDate)}</span></p><p><strong>Status</strong><span>{selected.status} · {selected.priority}</span></p><p><strong>Cost</strong><span>{selected.cost === null || selected.cost === undefined ? 'Not recorded' : `${selected.currency || 'GHS'} ${selected.cost}`}</span></p><p><strong>Field</strong><span>{selected.fieldId || 'Not linked'}</span></p><p><strong>Crop cycle</strong><span>{selected.cropCycleId || 'Not linked'}</span></p><p><strong>Assigned to</strong><span>{selected.assignee ? `${selected.assignee.firstName} ${selected.assignee.lastName}` : 'Not assigned'}</span></p><p><strong>Recorded by</strong><span>{selected.user ? `${selected.user.firstName} ${selected.user.lastName}` : 'Not available'}</span></p><p><strong>Notes</strong><span>{selected.notes || 'No notes recorded'}</span></p></div><button className="text-button" type="button" onClick={() => setSelected(null)}>Close details</button></article>}
    {loading ? <div className="loading-line" aria-label="Loading activities" /> : <div className="farm-grid">{activities.map((activity) => <article className="farm-card" key={activity.id}><div className="farm-card-top"><span className="farm-avatar large">{(activity.title || 'A')[0]}</span><select value={activity.status} onChange={(event) => updateStatus(activity, event.target.value)} aria-label={`Status for ${activity.title}`}><option value="PLANNED">PLANNED</option><option value="IN_PROGRESS">IN PROGRESS</option><option value="COMPLETED">COMPLETED</option><option value="CANCELLED">CANCELLED</option><option value="OVERDUE">OVERDUE</option></select></div><h3>{activity.title}</h3><p>{activity.farm?.name || 'Unknown farm'} · {activity.category}</p><p className="muted">{activity.description}</p><button className="text-button" type="button" onClick={() => setSelected(activity)}>View full record</button></article>)}{!activities.length && <div className="panel empty-wide"><h3>No activities found</h3><p className="muted">Farm activities will appear here as work is recorded.</p></div>}</div>}
  </section>;
}
