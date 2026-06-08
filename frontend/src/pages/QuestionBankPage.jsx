import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { questions } from '../api';

const QuestionBankPage = ({ user }) => {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await questions.list({ search });
      setList(res.data || []);
    } catch (err) {
      console.error('Failed to fetch questions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuestions(); }, [search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await questions.delete(id);
      fetchQuestions();
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to delete');
    }
  };

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
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '12px', background: 'var(--bg)' }}
        />
      </div>

      {loading ? <div>Loading...</div> : (
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
      )}
    </div>
  );
};

export default QuestionBankPage;
