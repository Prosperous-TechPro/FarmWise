import React, { useEffect, useState } from 'react';
import apiClient from '../services/api';

const initialForm = { speciesId: '', breedId: '', tagNumber: '', name: '', sex: 'UNKNOWN', status: 'ACTIVE', acquisitionType: 'BORN_ON_FARM', acquisitionDate: '', dateOfBirth: '', currentWeight: '', weightUnit: 'KILOGRAM', notes: '' };

function dateValue(value) { return value ? new Date(value).toISOString().slice(0, 10) : ''; }

export default function LivestockRecords({ farms, onBack }) {
  const [farmId, setFarmId] = useState(farms[0]?.id || '');
  const [animals, setAnimals] = useState([]);
  const [species, setSpecies] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const loadAnimals = async () => {
    if (!farmId) return;
    setLoading(true); setError('');
    try { const result = await apiClient.get(`/farms/${farmId}/livestock`); setAnimals(result.data || []); }
    catch (err) { setError(err.message || 'Unable to load livestock.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { apiClient.get('/livestock/species').then((result) => setSpecies(result.data || [])).catch((err) => setError(err.message || 'Unable to load livestock species.')); }, []);
  useEffect(() => { loadAnimals(); }, [farmId]);
  useEffect(() => {
    if (!form.speciesId) { setBreeds([]); return; }
    apiClient.get(`/livestock/breeds?speciesId=${form.speciesId}`).then((result) => setBreeds(result.data || [])).catch((err) => setError(err.message || 'Unable to load breeds.'));
  }, [form.speciesId]);

  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });
  const save = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const payload = { ...form, breedId: form.breedId || undefined, name: form.name || undefined, acquisitionDate: form.acquisitionDate || undefined, dateOfBirth: form.dateOfBirth || undefined, currentWeight: form.currentWeight === '' ? undefined : Number(form.currentWeight), notes: form.notes || undefined };
      const result = editing ? await apiClient.put(`/farms/${farmId}/livestock/${editing.id}`, payload) : await apiClient.post(`/farms/${farmId}/livestock`, payload);
      setAnimals(editing ? animals.map((animal) => animal.id === editing.id ? result.data : animal) : [result.data, ...animals]);
      setSelected(result.data); setEditing(null); setForm(initialForm);
    } catch (err) { setError(err.message || 'Unable to save livestock record.'); }
    finally { setBusy(false); }
  };

  const edit = (animal) => {
    setEditing(animal);
    setForm({ speciesId: animal.speciesId, breedId: animal.breedId || '', tagNumber: animal.tagNumber || '', name: animal.name || '', sex: animal.sex || 'UNKNOWN', status: animal.status || 'ACTIVE', acquisitionType: animal.acquisitionType || 'BORN_ON_FARM', acquisitionDate: dateValue(animal.acquisitionDate), dateOfBirth: dateValue(animal.dateOfBirth), currentWeight: animal.currentWeight ?? '', weightUnit: animal.weightUnit || 'KILOGRAM', notes: animal.notes || '' });
    setSelected(null);
  };

  const remove = async (animal) => {
    if (!window.confirm(`Delete ${animal.name || animal.tagNumber}?`)) return;
    setBusy(true); setError('');
    try { await apiClient.delete(`/farms/${farmId}/livestock/${animal.id}`); setAnimals(animals.filter((item) => item.id !== animal.id)); setSelected(null); }
    catch (err) { setError(err.message || 'Unable to delete livestock record.'); }
    finally { setBusy(false); }
  };

  if (!farms.length) return <section className="record-page"><button className="back-button" type="button" onClick={onBack}>← Back to records</button><h2>Livestock</h2><div className="panel empty-wide"><h3>Create a farm first</h3></div></section>;
  if (selected) return <section className="record-page"><button className="back-button" type="button" onClick={() => setSelected(null)}>← Back to livestock</button><div className="section-heading"><div><p className="eyebrow">ANIMAL RECORD</p><h2>{selected.name || selected.tagNumber}</h2><p className="muted">{selected.species?.name || 'Livestock'} · {selected.farm?.name || 'Farm'}</p></div><span className="live-badge">{selected.status}</span></div><article className="record-content-panel activity-detail"><div className="activity-detail-grid"><p><strong>Tag number</strong><span>{selected.tagNumber}</span></p><p><strong>Species</strong><span>{selected.species?.name || 'Not recorded'}</span></p><p><strong>Breed</strong><span>{selected.breed?.name || 'Not recorded'}</span></p><p><strong>Sex</strong><span>{selected.sex || 'Unknown'}</span></p><p><strong>Date of birth</strong><span>{dateValue(selected.dateOfBirth) || 'Not recorded'}</span></p><p><strong>Current weight</strong><span>{selected.currentWeight ? `${selected.currentWeight} ${selected.weightUnit}` : 'Not recorded'}</span></p><p><strong>Notes</strong><span>{selected.notes || 'No notes recorded'}</span></p></div><div className="button-row"><button className="primary-button" type="button" onClick={() => edit(selected)}>Edit animal</button><button className="text-button" type="button" onClick={() => remove(selected)} disabled={busy}>Delete animal</button></div></article></section>;

  return <section className="record-page"><button className="back-button" type="button" onClick={onBack}>← Back to records</button><div className="section-heading"><div><p className="eyebrow">LIVESTOCK RECORDS</p><h2>Livestock</h2><p className="muted">Track animals, health, and breeding records.</p></div><span className="record-count">{animals.length} animals</span></div><label>Select farm<select value={farmId} onChange={(event) => setFarmId(event.target.value)}>{farms.map((farm) => <option value={farm.id} key={farm.id}>{farm.name}</option>)}</select></label>{error && <div className="notice error">{error}</div>}<form className="create-form" onSubmit={save}><label>Species<select value={form.speciesId} onChange={update('speciesId')} required><option value="">Select species</option>{species.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label>Breed<select value={form.breedId} onChange={update('breedId')}><option value="">Select breed</option>{breeds.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label>Tag number<input value={form.tagNumber} onChange={update('tagNumber')} required /></label><label>Name<input value={form.name} onChange={update('name')} /></label><label>Sex<select value={form.sex} onChange={update('sex')}><option value="UNKNOWN">Unknown</option><option value="MALE">Male</option><option value="FEMALE">Female</option></select></label><label>Status<select value={form.status} onChange={update('status')}>{['ACTIVE', 'INACTIVE', 'SOLD', 'DECEASED', 'QUARANTINED'].map((status) => <option value={status} key={status}>{status}</option>)}</select></label><label>Date of birth<input type="date" value={form.dateOfBirth} onChange={update('dateOfBirth')} /></label><label>Current weight<input type="number" min="0" step="0.01" value={form.currentWeight} onChange={update('currentWeight')} /></label><label>Notes<input value={form.notes} onChange={update('notes')} /></label><button className="primary-button" disabled={busy || !form.speciesId}>{busy ? 'Saving...' : editing ? 'Update animal' : 'Add animal'}</button>{editing && <button className="text-button" type="button" onClick={() => { setEditing(null); setForm(initialForm); }}>Cancel</button>}</form>{loading ? <div className="loading-line" aria-label="Loading livestock" /> : <div className="farm-grid">{animals.map((animal) => <article className="farm-card" key={animal.id}><div className="farm-card-top"><span className="farm-avatar large">{(animal.name || animal.tagNumber || 'A')[0]}</span><span className="live-badge">{animal.status}</span></div><h3>{animal.name || animal.tagNumber}</h3><p>{animal.species?.name || 'Animal'}{animal.breed?.name ? ` · ${animal.breed.name}` : ''}</p><p>{animal.tagNumber} · {animal.sex || 'UNKNOWN'}</p><div className="farm-card-foot"><button className="text-button" type="button" onClick={() => setSelected(animal)}>Details</button><button className="text-button" type="button" onClick={() => edit(animal)}>Edit</button><button className="text-button" type="button" onClick={() => remove(animal)} disabled={busy}>Delete</button></div></article>)}{!animals.length && <div className="panel empty-wide"><h3>No livestock yet</h3><p className="muted">Add an animal to start tracking this farm.</p></div>}</div>}</section>;
}
