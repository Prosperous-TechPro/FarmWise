import React, { useEffect, useState } from 'react';
import apiClient from '../services/api';

const categories = ['FEED', 'SEEDS', 'PLANTING_MATERIAL', 'FERTILIZER', 'HERBICIDE', 'PESTICIDE', 'MEDICATION', 'FUEL', 'EQUIPMENT', 'TOOLS', 'OTHER'];
const units = ['KG', 'GRAM', 'LITRE', 'BAG', 'SACK', 'BOTTLE', 'PACK', 'BOX', 'PIECE', 'UNIT', 'TON', 'DOSE', 'OTHER'];
const emptyForm = { name: '', category: 'OTHER', description: '', code: '', unitOfMeasure: 'UNIT', minimumStockLevel: '', maximumStockLevel: '', reorderLevel: '', defaultLocationId: '' };

export default function InventoryRecords({ farms, onBack }) {
  const [farmId, setFarmId] = useState(farms[0]?.id || '');
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [overview, setOverview] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    if (!farmId) return;
    setLoading(true); setError('');
    try {
      const [itemResult, locationResult, overviewResult] = await Promise.all([
        apiClient.get(`/farms/${farmId}/inventory/items`),
        apiClient.get(`/farms/${farmId}/inventory/locations`),
        apiClient.get(`/farms/${farmId}/inventory/summary`),
      ]);
      setItems(itemResult.data || []); setLocations(locationResult.data || []); setOverview(overviewResult.data || null);
    } catch (err) { setError(err.message || 'Unable to load inventory records.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [farmId]);
  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });
  const save = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const payload = { ...form, description: form.description || undefined, code: form.code || undefined, defaultLocationId: form.defaultLocationId || undefined, minimumStockLevel: form.minimumStockLevel === '' ? undefined : Number(form.minimumStockLevel), maximumStockLevel: form.maximumStockLevel === '' ? undefined : Number(form.maximumStockLevel), reorderLevel: form.reorderLevel === '' ? undefined : Number(form.reorderLevel) };
      const result = editing ? await apiClient.put(`/farms/${farmId}/inventory/items/${editing.id}`, payload) : await apiClient.post(`/farms/${farmId}/inventory/items`, payload);
      setItems(editing ? items.map((item) => item.id === editing.id ? result.data : item) : [result.data, ...items]); setEditing(null); setForm(emptyForm); await load();
    } catch (err) { setError(err.message || 'Unable to save inventory item.'); }
    finally { setBusy(false); }
  };
  const edit = (item) => { setEditing(item); setForm({ name: item.name || '', category: item.category || 'OTHER', description: item.description || '', code: item.code || '', unitOfMeasure: item.unitOfMeasure || 'UNIT', minimumStockLevel: item.minimumStockLevel ?? '', maximumStockLevel: item.maximumStockLevel ?? '', reorderLevel: item.reorderLevel ?? '', defaultLocationId: item.defaultLocationId || '' }); };
  const remove = async (item) => { if (!window.confirm(`Delete ${item.name}?`)) return; setBusy(true); setError(''); try { await apiClient.delete(`/farms/${farmId}/inventory/items/${item.id}`); setItems(items.filter((entry) => entry.id !== item.id)); } catch (err) { setError(err.message || 'Unable to delete inventory item.'); } finally { setBusy(false); } };
  const addLocation = async (event) => { event.preventDefault(); if (!locationName.trim()) return; setBusy(true); setError(''); try { const result = await apiClient.post(`/farms/${farmId}/inventory/locations`, { name: locationName }); setLocations([...locations, result.data]); setLocationName(''); setShowLocationForm(false); } catch (err) { setError(err.message || 'Unable to add storage location.'); } finally { setBusy(false); } };

  if (!farms.length) return <section className="record-page"><button className="back-button" type="button" onClick={onBack}>← Back to records</button><h2>Inventory</h2><div className="panel empty-wide"><h3>Create a farm first</h3></div></section>;
  return <section className="record-page"><button className="back-button" type="button" onClick={onBack}>← Back to records</button><div className="section-heading"><div><p className="eyebrow">INVENTORY RECORDS</p><h2>Inventory</h2><p className="muted">Know what is in storage and where.</p></div><span className="record-count">{items.length} items</span></div><label>Select farm<select value={farmId} onChange={(event) => setFarmId(event.target.value)}>{farms.map((farm) => <option value={farm.id} key={farm.id}>{farm.name}</option>)}</select></label>{error && <div className="notice error">{error}</div>}{overview && <div className="stat-grid records-summary"><Stat label="Items" value={overview.totalItems || 0} detail="Catalog items" tone="blue" /><Stat label="Stock on hand" value={Number(overview.totalStockOnHand || 0).toLocaleString()} detail={`${overview.stockBalanceRecords || 0} balances`} tone="green" /><Stat label="Receipts" value={overview.totalReceipts || 0} detail={`${Number(overview.totalReceiptQuantity || 0).toLocaleString()} units received`} tone="yellow" /></div>}<div className="record-content-panel"><div><strong>Storage locations</strong>{locations.length ? <p className="muted">{locations.map((location) => location.name).join(' · ')}</p> : <p className="muted">No storage locations yet.</p>}</div><button className="text-button" type="button" onClick={() => setShowLocationForm(!showLocationForm)}>Add location</button></div>{showLocationForm && <form className="create-form" onSubmit={addLocation}><label>Location name<input value={locationName} onChange={(event) => setLocationName(event.target.value)} required placeholder="e.g. Main store" /></label><button className="primary-button" disabled={busy}>Save location</button></form>}<form className="create-form" onSubmit={save}><label>Item name<input value={form.name} onChange={update('name')} required /></label><label>Category<select value={form.category} onChange={update('category')}>{categories.map((category) => <option value={category} key={category}>{category}</option>)}</select></label><label>Unit<select value={form.unitOfMeasure} onChange={update('unitOfMeasure')}>{units.map((unit) => <option value={unit} key={unit}>{unit}</option>)}</select></label><label>Code<input value={form.code} onChange={update('code')} /></label><label>Default location<select value={form.defaultLocationId} onChange={update('defaultLocationId')}><option value="">Select location</option>{locations.map((location) => <option value={location.id} key={location.id}>{location.name}</option>)}</select></label><label>Minimum stock<input type="number" min="0" step="0.01" value={form.minimumStockLevel} onChange={update('minimumStockLevel')} /></label><label>Reorder level<input type="number" min="0" step="0.01" value={form.reorderLevel} onChange={update('reorderLevel')} /></label><label>Description<input value={form.description} onChange={update('description')} /></label><button className="primary-button" disabled={busy}>{busy ? 'Saving...' : editing ? 'Update item' : 'Add item'}</button>{editing && <button className="text-button" type="button" onClick={() => { setEditing(null); setForm(emptyForm); }}>Cancel</button>}</form>{loading ? <div className="loading-line" aria-label="Loading inventory" /> : <div className="farm-grid">{items.map((item) => <article className="farm-card" key={item.id}><div className="farm-card-top"><span className="farm-avatar large">{(item.name || 'I')[0]}</span><span className="live-badge">{item.isActive ? 'ACTIVE' : 'INACTIVE'}</span></div><h3>{item.name}</h3><p>{item.category} · {item.unitOfMeasure}</p><p className="muted">{item.code || 'No code'} · Reorder at {item.reorderLevel ?? 'not set'}</p><div className="farm-card-foot"><button className="text-button" type="button" onClick={() => edit(item)}>Edit</button><button className="text-button" type="button" onClick={() => remove(item)} disabled={busy}>Delete</button></div></article>)}{!items.length && <div className="panel empty-wide"><h3>No inventory items yet</h3><p className="muted">Add an item to start tracking stock and storage.</p></div>}</div>}</section>;
}

function Stat({ label, value, detail, tone }) { return <div className={`stat-card ${tone}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>; }
