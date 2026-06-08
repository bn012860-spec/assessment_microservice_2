import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { questions } from '../api';

const EditQuestionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [tags, setTags] = useState('');
  const [marks, setMarks] = useState(100);
  const [timeLimitMs, setTimeLimitMs] = useState(2000);
  const [memoryLimitMb, setMemoryLimitMb] = useState(256);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await questions.get(id);
        const q = res.data;
        setTitle(q.title);
        setDifficulty(q.difficulty || 'Easy');
        setTags((q.tags || []).join(', '));
        setMarks(q.marks || 100);
        setTimeLimitMs(q.timeLimitMs || 2000);
        setMemoryLimitMb(q.memoryLimitMb || 256);
      } catch (err) {
        console.error(err);
        alert('Failed to load question');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        difficulty,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        marks: Number(marks),
        timeLimitMs: Number(timeLimitMs),
        memoryLimitMb: Number(memoryLimitMb)
      };
      await questions.update(id, payload);
      navigate('/questions');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Failed to update question');
    }
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container fade-in">
      <div className="mb-8">
        <h1>Edit Question</h1>
      </div>

      <div className="problem-card" style={{ maxWidth: 760 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Difficulty</label>
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>

          <div className="form-group">
            <label>Tags (comma separated)</label>
            <input value={tags} onChange={e => setTags(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Marks</label>
            <input type="number" value={marks} onChange={e => setMarks(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Time Limit (ms)</label>
            <input type="number" value={timeLimitMs} onChange={e => setTimeLimitMs(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Memory Limit (MB)</label>
            <input type="number" value={memoryLimitMb} onChange={e => setMemoryLimitMb(e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="button button-primary" type="submit">Save</button>
            <button className="button button-outline" type="button" onClick={() => navigate('/questions')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQuestionPage;
