import React, { useEffect, useRef, useState } from 'react';
import apiClient from '../../services/api';

function FeedbackForm({ onSubmitted, onCancel }) {
  const [form, setForm] = useState({ subject: '', category: 'BUG_REPORT', description: '', priority: 'MEDIUM', pageUrl: window.location.pathname });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try { const result = await apiClient.post('/feedback', form); onSubmitted(result.data?.reference || result.data?.id || 'submitted'); }
    catch (requestError) { setError(requestError.message || 'Unable to submit feedback.'); }
    finally { setBusy(false); }
  };
  return <form className="support-form" onSubmit={submit}>
    <div className="support-form-heading"><div><p className="eyebrow">YOUR VOICE MATTERS</p><h3>Send feedback</h3></div><button type="button" className="icon-button" onClick={onCancel} aria-label="Back to FAQs">←</button></div>
    {error && <div className="notice error" role="alert">{error}</div>}
    <label>Subject<input value={form.subject} maxLength="200" onChange={(event) => setForm({ ...form, subject: event.target.value })} required /></label>
    <label>Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option value="BUG_REPORT">Bug report</option><option value="FEATURE_REQUEST">Feature request</option><option value="SUGGESTION">Suggestion</option><option value="USABILITY">Usability</option><option value="PERFORMANCE">Performance</option><option value="OTHER">Other</option></select></label>
    <label>Priority<select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="URGENT">Urgent</option></select></label>
    <label>What happened?<textarea value={form.description} maxLength="10000" rows="5" onChange={(event) => setForm({ ...form, description: event.target.value })} required /></label>
    <button className="primary-button" disabled={busy}>{busy ? 'Sending...' : 'Send feedback'} <span>→</span></button>
  </form>;
}

function FeedbackHistory({ onBack, onError, error }) {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/feedback/my')
      .then((result) => setItems(result.data || []))
      .catch((requestError) => onError(requestError.message || 'Unable to load your feedback.'))
      .finally(() => setLoading(false));
  }, [onError]);

  const open = async (feedback) => {
    try {
      const result = await apiClient.get(`/feedback/my/${feedback.id}`);
      setSelected(result.data);
    } catch (requestError) {
      onError(requestError.message || 'Unable to load feedback details.');
    }
  };

  if (selected) return <div className="support-history-detail">
    <button type="button" className="text-button" onClick={() => setSelected(null)}>← Back to my feedback</button>
    <p className="eyebrow">{selected.reference}</p>
    <h3>{selected.subject}</h3>
    <p className="muted">{selected.status.replaceAll('_', ' ')} · Submitted {new Date(selected.createdAt).toLocaleDateString()}</p>
    <div className="support-note"><p>{selected.description}</p></div>
    <h4>Responses</h4>
    {(selected.responses || []).length ? selected.responses.map((response) => <div className="support-note" key={response.id}><p>{response.message}</p><small className="muted">{response.author?.firstName || 'FarmWise support'} · {new Date(response.createdAt).toLocaleString()}</small></div>) : <p className="muted">No response yet. We will post an update here.</p>}
  </div>;

  return <div className="support-history">
    <div className="support-form-heading"><div><p className="eyebrow">YOUR SUPPORT REQUESTS</p><h3>My feedback</h3></div><button type="button" className="icon-button" onClick={onBack} aria-label="Back to FAQs">←</button></div>
    {error && <div className="notice error" role="alert">{error}</div>}
    {loading ? <div className="loading-line" aria-label="Loading your feedback" /> : items.length ? items.map((item) => <button className="support-history-item" type="button" key={item.id} onClick={() => open(item)}><span><strong>{item.reference}</strong><small>{item.subject}</small></span><span><b>{item.status.replaceAll('_', ' ')}</b><small>{new Date(item.createdAt).toLocaleDateString()}</small></span></button>) : <p className="muted">You have not sent any feedback yet.</p>}
  </div>;
}

export default function GlobalFAQButton() {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState(false);
  const [query, setQuery] = useState('');
  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [history, setHistory] = useState(false);
  const [error, setError] = useState('');
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const load = async () => {
      try { const params = new URLSearchParams({ page: String(page), limit: '10' }); if (query.trim()) params.set('search', query.trim()); if (categoryId) params.set('categoryId', categoryId); const [faqResult, categoryResult] = await Promise.all([apiClient.get(`/faqs?${params}`), apiClient.get('/faqs/categories')]); setFaqs(faqResult.data || []); setPagination(faqResult.pagination); setCategories(categoryResult.data || []); }
      catch (requestError) { setError(requestError.message || 'Unable to load help content.'); }
    };
    load();
    dialogRef.current?.focus();
    const onKeyDown = (event) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKeyDown);
    return () => { document.removeEventListener('keydown', onKeyDown); previous?.focus?.(); };
  }, [open, query, categoryId, page]);

  const rate = async (faqId, helpful) => {
    try { await apiClient.post(`/faqs/${faqId}/helpful`, { helpful }); } catch (requestError) { setError(requestError.message || 'Unable to record your response.'); }
  };
  return <>
    <button className="faq-float-button" type="button" onClick={() => { setOpen(true); setFeedback(false); setHistory(false); }} aria-label="Open FAQ and help" title="FAQ & Help"><span aria-hidden="true">?</span><b>FAQ & Help</b></button>
    {open && <div className="support-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section className="support-dialog" role="dialog" aria-modal="true" aria-labelledby="support-title" tabIndex="-1" ref={dialogRef}>
        <div className="support-dialog-header"><div><p className="eyebrow">FARMWISE SUPPORT</p><h2 id="support-title">How can we help?</h2></div><button type="button" className="icon-button" onClick={() => setOpen(false)} aria-label="Close FAQ and help">×</button></div>
        {feedback ? <FeedbackForm onCancel={() => setFeedback(false)} onSubmitted={(reference) => { setFeedback(false); setError(`Thank you. Feedback ${reference} was submitted successfully.`); }} /> : history ? <FeedbackHistory onBack={() => setHistory(false)} onError={setError} error={error} /> : <>
          <label className="support-search">Search FAQs<input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search account, farms, tasks..." autoFocus /></label>
          {categories.length > 0 && <div className="support-categories" aria-label="FAQ categories"><button type="button" className={!categoryId ? 'active' : ''} onClick={() => { setCategoryId(''); setPage(1); }}>All</button>{categories.map((category) => <button type="button" className={categoryId === category.id ? 'active' : ''} key={category.id} onClick={() => { setCategoryId(category.id); setPage(1); }}>{category.name}</button>)}</div>}
          {error && <div className="notice error" role="alert">{error}</div>}
          <div className="support-faq-list">{faqs.length ? faqs.map((faq) => <article className="support-faq-item" key={faq.id}><button type="button" className="support-faq-question" onClick={() => setExpanded(expanded === faq.id ? null : faq.id)} aria-expanded={expanded === faq.id}>{faq.question}<span aria-hidden="true">{expanded === faq.id ? '−' : '+'}</span></button>{expanded === faq.id && <div className="support-faq-answer"><p>{faq.answer}</p><div className="support-helpful"><span>Was this helpful?</span><button type="button" onClick={() => rate(faq.id, true)} aria-label="Yes, this FAQ was helpful">Yes</button><button type="button" onClick={() => rate(faq.id, false)} aria-label="No, this FAQ was not helpful">No</button></div></div>}</article>) : <p className="muted">No published FAQs match that search.</p>}</div>
          {pagination?.pages > 1 && <div className="support-pagination"><button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Previous FAQ page">←</button><span>Page {page} of {pagination.pages}</span><button type="button" disabled={page >= pagination.pages} onClick={() => setPage(page + 1)} aria-label="Next FAQ page">→</button></div>}
          <button type="button" className="outline-button support-feedback-button" onClick={() => { setHistory(true); setError(''); }}>View my feedback <span>→</span></button>
          <button type="button" className="outline-button support-feedback-button" onClick={() => { setFeedback(true); setError(''); }}>Send feedback <span>→</span></button>
        </>}
      </section>
    </div>}
  </>;
}