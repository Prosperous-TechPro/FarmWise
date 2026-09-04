import React, { useEffect, useState } from 'react';
import apiClient from '../services/api';

const today = new Date().toISOString().slice(0, 10);
const expenseDefaults = { category: 'OTHER', description: '', amount: '', expenseDate: today, paymentMethod: 'CASH', status: 'CONFIRMED', notes: '' };
const saleDefaults = { saleNumber: '', totalAmount: '', saleDate: today, buyer: '', paymentMethod: 'CASH', status: 'CONFIRMED', notes: '' };

export default function FinanceRecords({ farms, onBack }) {
  const [farmId, setFarmId] = useState(farms[0]?.id || '');
  const [tab, setTab] = useState('expenses');
  const [expenses, setExpenses] = useState([]);
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState(null);
  const [form, setForm] = useState(expenseDefaults);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    if (!farmId) return;
    setLoading(true); setError('');
    try {
      const [expenseResult, saleResult, summaryResult] = await Promise.all([
        apiClient.get(`/farms/${farmId}/expenses`),
        apiClient.get(`/farms/${farmId}/sales`),
        apiClient.get(`/farms/${farmId}/profitability`),
      ]);
      setExpenses(expenseResult.data || []); setSales(saleResult.data || []); setSummary(summaryResult.data || null);
    } catch (err) { setError(err.message || 'Unable to load financial records.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [farmId]);
  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });
  const changeTab = (nextTab) => { setTab(nextTab); setForm(nextTab === 'expenses' ? expenseDefaults : saleDefaults); setError(''); };

  const save = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const payload = tab === 'expenses'
        ? { ...form, amount: Number(form.amount), notes: form.notes || undefined }
        : { ...form, totalAmount: Number(form.totalAmount), saleNumber: form.saleNumber || `SALE-${Date.now()}`, buyer: form.buyer || undefined, notes: form.notes || undefined };
      const result = tab === 'expenses' ? await apiClient.post(`/farms/${farmId}/expenses`, payload) : await apiClient.post(`/farms/${farmId}/sales`, payload);
      if (tab === 'expenses') setExpenses([result.data, ...expenses]); else setSales([result.data, ...sales]);
      setForm(tab === 'expenses' ? expenseDefaults : saleDefaults); await load();
    } catch (err) { setError(err.message || `Unable to save ${tab === 'expenses' ? 'expense' : 'sale'}.`); }
    finally { setBusy(false); }
  };

  const money = (value) => `GHS ${Number(value || 0).toLocaleString()}`;
  return <section className="record-page"><button className="back-button" type="button" onClick={onBack}>← Back to records</button><div className="section-heading"><div><p className="eyebrow">FINANCE RECORDS</p><h2>Finance</h2><p className="muted">Follow expenses, sales, and profitability.</p></div><span className="record-count">{expenses.length + sales.length} transactions</span></div>{!farms.length ? <div className="panel empty-wide"><h3>Create a farm first</h3></div> : <><label>Select farm<select value={farmId} onChange={(event) => setFarmId(event.target.value)}>{farms.map((farm) => <option value={farm.id} key={farm.id}>{farm.name}</option>)}</select></label>{error && <div className="notice error">{error}</div>}{summary && <div className="stat-grid records-summary"><Stat label="Revenue" value={money(summary.totalRevenue)} detail={`${summary.saleCount || 0} sales`} tone="green" /><Stat label="Expenses" value={money(summary.totalExpenses)} detail={`${summary.expenseCount || 0} expenses`} tone="red" /><Stat label="Net profit" value={money(summary.netProfit)} detail={`${summary.totalLosses ? money(summary.totalLosses) : 'No losses'}`} tone="blue" /></div>}<div className="segmented-control"><button className={tab === 'expenses' ? 'active' : ''} type="button" onClick={() => changeTab('expenses')}>Expenses</button><button className={tab === 'sales' ? 'active' : ''} type="button" onClick={() => changeTab('sales')}>Sales</button></div><form className="create-form" onSubmit={save}>{tab === 'expenses' ? <><label>Category<select value={form.category} onChange={update('category')}>{['FEED', 'SEED', 'FERTILIZER', 'PESTICIDE', 'LABOR', 'EQUIPMENT', 'MAINTENANCE', 'TRANSPORTATION', 'OTHER'].map((item) => <option value={item} key={item}>{item}</option>)}</select></label><label>Description<input value={form.description} onChange={update('description')} required /></label><label>Amount<input type="number" min="0.01" step="0.01" value={form.amount} onChange={update('amount')} required /></label><label>Date<input type="date" value={form.expenseDate} onChange={update('expenseDate')} required /></label><label>Payment method<select value={form.paymentMethod} onChange={update('paymentMethod')}><option value="CASH">Cash</option><option value="MOBILE_MONEY">Mobile money</option><option value="BANK_TRANSFER">Bank transfer</option><option value="CARD">Card</option></select></label><label>Notes<input value={form.notes} onChange={update('notes')} /></label></> : <><label>Sale number<input value={form.saleNumber} onChange={update('saleNumber')} placeholder="Auto-generated if blank" /></label><label>Total amount<input type="number" min="0.01" step="0.01" value={form.totalAmount} onChange={update('totalAmount')} required /></label><label>Sale date<input type="date" value={form.saleDate} onChange={update('saleDate')} required /></label><label>Buyer<input value={form.buyer} onChange={update('buyer')} /></label><label>Payment method<select value={form.paymentMethod} onChange={update('paymentMethod')}><option value="CASH">Cash</option><option value="MOBILE_MONEY">Mobile money</option><option value="BANK_TRANSFER">Bank transfer</option><option value="CARD">Card</option></select></label><label>Notes<input value={form.notes} onChange={update('notes')} /></label></>}<button className="primary-button" disabled={busy}>{busy ? 'Saving...' : tab === 'expenses' ? 'Add expense' : 'Record sale'}</button></form>{loading ? <div className="loading-line" aria-label="Loading financial records" /> : <div className="farm-grid">{(tab === 'expenses' ? expenses : sales).map((record) => <article className="farm-card" key={record.id}><div className="farm-card-top"><span className="farm-avatar large">{tab === 'expenses' ? '-' : '+'}</span><span className="live-badge">{record.status}</span></div><h3>{tab === 'expenses' ? record.description : record.saleNumber}</h3><p>{tab === 'expenses' ? record.category : record.buyer || 'Buyer not recorded'}</p><p className="muted">{money(tab === 'expenses' ? record.amount : record.totalAmount)} · {new Date(tab === 'expenses' ? record.expenseDate : record.saleDate).toLocaleDateString()}</p></article>)}{!(tab === 'expenses' ? expenses : sales).length && <div className="panel empty-wide"><h3>No {tab} yet</h3><p className="muted">Add a record to start tracking this farm's finances.</p></div>}</div>}</>}</section>;
}

function Stat({ label, value, detail, tone }) { return <div className={`stat-card ${tone}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>; }
