import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { assessments } from '../api';

const EditAssessmentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [formData, setFormData] = useState(null);
  const [selectedProblemId, setSelectedProblemId] = useState('');
  const [problemScore, setProblemScore] = useState(100);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assessmentRes, problemsRes] = await Promise.all([
          assessments.get(id),
          api.get('/api/problems')
        ]);
        
        const assessmentData = assessmentRes.data;
        // Format dates for datetime-local input (YYYY-MM-DDThh:mm)
        const formatDate = (date) => {
          const d = new Date(date);
          return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        };

        setFormData({
          title: assessmentData.title,
          description: assessmentData.description,
          durationMinutes: assessmentData.durationMinutes,
          startTime: formatDate(assessmentData.startTime),
          endTime: formatDate(assessmentData.endTime),
          allowedLanguages: assessmentData.allowedLanguages || [],
          problems: assessmentData.problems.map(p => ({
            problemId: p.problemId._id || p.problemId,
            title: p.problemId.title || 'Unknown',
            maxScore: p.maxScore
          })),
          status: assessmentData.status
        });
        setProblems(problemsRes.data);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to fetch assessment data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLanguageToggle = (lang) => {
    const next = formData.allowedLanguages.includes(lang)
      ? formData.allowedLanguages.filter(l => l !== lang)
      : [...formData.allowedLanguages, lang];
    setFormData({ ...formData, allowedLanguages: next });
  };

  const addProblemToAssessment = () => {
    if (!selectedProblemId) return;
    if (formData.problems.some(p => p.problemId === selectedProblemId)) {
      alert('Problem already added');
      return;
    }

    const problem = problems.find(p => p._id === selectedProblemId);
    setFormData({
      ...formData,
      problems: [...formData.problems, { 
        problemId: selectedProblemId, 
        title: problem.title, 
        maxScore: problemScore 
      }]
    });
    setSelectedProblemId('');
  };

  const removeProblem = (id) => {
    setFormData({
      ...formData,
      problems: formData.problems.filter(p => p.problemId !== id)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.problems.length === 0) {
      alert('Please add at least one problem');
      return;
    }

    try {
      const payload = {
        ...formData,
        problems: formData.problems.map(p => ({ problemId: p.problemId, maxScore: p.maxScore }))
      };
      await assessments.update(id, payload);
      navigate('/admin/assessments');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update assessment');
    }
  };

  if (loading) return <div className="container">Loading assessment data...</div>;
  if (error) return <div className="container error">{error}</div>;

  const totalScore = formData.problems.reduce((acc, p) => acc + Number(p.maxScore), 0);

  return (
    <div className="container">
      <h2>Edit Assessment</h2>
      <form onSubmit={handleSubmit}>
        <div className="problem-card" style={{ marginBottom: '20px' }}>
          <h3>Basic Information</h3>
          <div className="form-group">
            <label>Title:</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Description:</label>
            <textarea name="description" value={formData.description} onChange={handleChange} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label>Duration (Minutes):</label>
              <input type="number" name="durationMinutes" value={formData.durationMinutes} onChange={handleChange} required min="1" />
            </div>
            <div className="form-group">
              <label>Start Time:</label>
              <input type="datetime-local" name="startTime" value={formData.startTime} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>End Time:</label>
              <input type="datetime-local" name="endTime" value={formData.endTime} onChange={handleChange} required />
            </div>
          </div>
        </div>

        <div className="problem-card" style={{ marginBottom: '20px' }}>
          <h3>Allowed Languages</h3>
          <div className="flex-gap">
            {['python', 'javascript', 'typescript', 'java', 'cpp', 'c', 'csharp', 'go'].map(lang => (
              <label key={lang} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={formData.allowedLanguages.includes(lang)} 
                  onChange={() => handleLanguageToggle(lang)}
                />
                {lang}
              </label>
            ))}
          </div>
        </div>

        <div className="problem-card" style={{ marginBottom: '20px' }}>
          <h3>Problems</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '20px' }}>
            <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
              <label>Select Problem:</label>
              <select value={selectedProblemId} onChange={(e) => setSelectedProblemId(e.target.value)}>
                <option value="">Choose a problem...</option>
                {problems.map(p => (
                  <option key={p._id} value={p._id}>{p.title} ({p.difficulty})</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Marks:</label>
              <input type="number" value={problemScore} onChange={(e) => setProblemScore(e.target.value)} min="1" />
            </div>
            <button type="button" className="button" onClick={addProblemToAssessment}>Add</button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                <th style={{ padding: '10px' }}>Problem</th>
                <th style={{ padding: '10px' }}>Max Score</th>
                <th style={{ padding: '10px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {formData.problems.map((p) => (
                <tr key={p.problemId} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{p.title}</td>
                  <td style={{ padding: '10px' }}>{p.maxScore}</td>
                  <td style={{ padding: '10px' }}>
                    <button type="button" onClick={() => removeProblem(p.problemId)} style={{ color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td style={{ padding: '10px' }}><strong>Total Score:</strong></td>
                <td style={{ padding: '10px' }}><strong>{totalScore}</strong></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="form-group">
          <label>Status:</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="mt-20">
          <button type="submit" className="button" style={{ padding: '15px 40px' }}>Update Assessment</button>
        </div>
      </form>
    </div>
  );
};

export default EditAssessmentPage;
