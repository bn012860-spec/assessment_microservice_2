import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { questions } from '../api';

const QuestionBankPage = ({ user }) => {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [tagFilter, setTagFilter] = useState('');

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = { search, page, limit };
      if (tagFilter) params.tag = tagFilter;
      const res = await questions.list(params);
      const data = res.data;
      if (data.questions) {
        setList(data.questions);
        setTotal(data.total || 0);
        setPage(data.page || page);
        setTotalPages(data.totalPages || 1);
      } else {
        setList(data || []);
        setTotal(Array.isArray(data) ? data.length : 0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to fetch questions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuestions(); }, [search, page, limit, tagFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await questions.delete(id);
      fetchQuestions();
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to delete');
    }
  };

  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
    let mounted = true;
    const loadTags = async () => {
      try {
        const res = await questions.tags();
        if (mounted) setAvailableTags(res.data || []);
      } catch (err) {
        // fallback to current-page derived tags
        setAvailableTags(Array.from(new Set(list.flatMap(q => q.tags || []))));
      }
    };
    loadTags();
    return () => { mounted = false; };
  }, [user]);

  return (
    <div className="container fade-in">
      <div className="flex-between mb-8">
        <div>
          <h1>Question Bank</h1>
          <p className="text-muted">Manage reusable questions for assessments.</p>
        </div>
        <div className="flex-center gap-3">
          <button className="button button-primary" onClick={() => navigate('/questions/add')}>Add Question</button>
        </div>
      </div>

      <div className="problem-card mb-6">
        <input
          type="text"
          placeholder="Search by title or tag..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ width: '100%', padding: '12px', background: 'var(--bg)' }}
        />

        <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className={`tag ${tagFilter === '' ? 'active' : ''}`} onClick={() => { setTagFilter(''); setPage(1); }} style={{ cursor: 'pointer' }}>All</button>
          {availableTags.map(t => (
            <button key={t} className={`tag ${tagFilter === t ? 'active' : ''}`} onClick={() => { setTagFilter(t); setPage(1); }} style={{ cursor: 'pointer' }}>{t}</button>
          ))}
        </div>
      </div>

      {loading ? <div>Loading...</div> : (
        <>
        <div className="problem-card-grid">
          {list.map(q => (
            <div key={q._id} className="problem-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ margin: 0 }}>{q.title}</h3>
                  <div className="text-muted" style={{ fontSize: '0.85rem' }}>{q.difficulty} • {q.tags?.join(', ')}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link to={`/questions/${q._id}/edit`} className="button button-outline" style={{ padding: '6px 10px' }}>Edit</Link>
                  <button className="button button-outline" onClick={() => handleDelete(q._id)} style={{ padding: '6px 10px' }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
          {list.length === 0 && <div className="problem-card">No questions found.</div>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px' }}>
          <div className="text-muted">Showing page {page} of {totalPages} — {total} total</div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="button button-outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Prev</button>
            <button className="button button-outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</button>
            <select value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }} style={{ background: 'var(--bg)' }}>
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
            </select>
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default QuestionBankPage;
