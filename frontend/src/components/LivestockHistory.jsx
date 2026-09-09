import React, { useEffect, useState } from 'react';
import apiClient from '../services/api';

const historyTypes = [
  ['events', 'Events'],
  ['weights', 'Weights'],
  ['health', 'Health'],
  ['treatments', 'Treatments'],
  ['vaccinations', 'Vaccinations'],
  ['feeding', 'Feeding'],
];

function dateValue(value) {
  return value ? new Date(value).toLocaleDateString() : 'Not recorded';
}

export default function LivestockHistory({ farmId, livestockId }) {
  const [records, setRecords] = useState({ events: [], weights: [], health: [], treatments: [], vaccinations: [], feeding: [] });
  const [tab, setTab] = useState('events');
  const [form, setForm] = useState({ weight: '', measurementDate: new Date().toISOString().slice(0, 10), unit: 'KILOGRAM', title: '', eventDate: new Date().toISOString().slice(0, 10), recordType: 'OBSERVATION', description: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const result = await Promise.all(historyTypes.map(([type]) => apiClient.get(`/farms/${farmId}/livestock/${livestockId}/${type}`)));
      setRecords(Object.fromEntries(historyTypes.map(([type], index) => [type, result[index].data || []])));
    } catch (requestError) {
      setError(requestError.message || 'Unable to load animal history.');
    }
  };

  useEffect(() => { load(); }, [farmId, livestockId]);

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const save = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      if (tab === 'weights') {
        await apiClient.post(`/farms/${farmId}/livestock/${livestockId}/weights`, { weight: Number(form.weight), unit: form.unit, measurementDate: form.measurementDate });
      } else if (tab === 'health') {
        await apiClient.post(`/farms/${farmId}/livestock/${livestockId}/health`, { recordType: form.recordType, title: form.title, description: form.description, eventDate: form.eventDate });
      }
      await load();
      setForm((current) => ({ ...current, weight: '', title: '', description: '' }));
    } catch (requestError) {
      setError(requestError.message || 'Unable to save history record.');
    } finally { setBusy(false); }
  };

  const items = records[tab];
  return <section className="panel livestock-history">
    <div className="panel-heading"><div><p className="eyebrow">HISTORICAL RECORD</p><h3>Animal timeline</h3></div><span className="record-count">{items.length} records</span></div>
    <div className="support-tabs livestock-history-tabs">{historyTypes.map(([type, label]) => <button type="button" className={tab === type ? 'active' : ''} key={type} onClick={() => setTab(type)}>{label}</button>)}</div>
    {error && <div className="notice error">{error}</div>}
    {(tab === 'weights' || tab === 'health') && <form className="create-form compact" onSubmit={save}>
      {tab === 'weights' ? <><label>Weight<input type="number" min="0.01" step="0.01" value={form.weight} onChange={update('weight')} required /></label><label>Unit<select value={form.unit} onChange={update('unit')}><option value="KILOGRAM">Kilogram</option><option value="GRAM">Gram</option><option value="POUND">Pound</option><option value="OUNCE">Ounce</option></select></label><label>Date<input type="date" value={form.measurementDate} onChange={update('measurementDate')} required /></label></> : <><label>Record type<select value={form.recordType} onChange={update('recordType')}><option value="OBSERVATION">Observation</option><option value="DIAGNOSIS">Diagnosis</option><option value="SYMPTOM">Symptom</option><option value="TREATMENT">Treatment</option></select></label><label>Title<input value={form.title} onChange={update('title')} required /></label><label>Date<input type="date" value={form.eventDate} onChange={update('eventDate')} required /></label><label>Description<input value={form.description} onChange={update('description')} /></label></>}
      <button className="primary-button" disabled={busy}>{busy ? 'Saving...' : 'Add record'}</button>
    </form>}
    {items.length ? <div className="list-stack">{items.map((item) => <article className="list-row" key={item.id}><div><strong>{item.title || item.feedType || item.vaccineName || item.treatmentName || item.eventType || `${item.weight} ${item.unit || ''}`}</strong><span className="muted">{dateValue(item.eventDate || item.measurementDate || item.dateAdministered || item.startDate || item.feedingDate)}</span></div><span className="record-count">{item.description || item.notes || item.quantity ? `${item.description || item.notes || `${item.quantity} ${item.quantityUnit || ''}`}` : ''}</span></article>)}</div> : <p className="muted">No {tab} recorded yet.</p>}
  </section>;
}
