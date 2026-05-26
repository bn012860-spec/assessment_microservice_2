import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { assessments } from '../api';

const AssessmentResultsPage = () => {
  const { id } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assessmentRes, attemptsRes] = await Promise.all([
          assessments.get(id),
          assessments.listAttempts(id)
        ]);
        setAssessment(assessmentRes.data);
        setAttempts(attemptsRes.data);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to fetch results');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const exportToCSV = () => {
    const headers = ['Student Name', 'Email', 'Score', 'Status', 'Started At', 'Submitted At', 'Time Used (min)'];
    const rows = attempts.map(a => {
      const timeUsed = a.submittedAt 
        ? Math.floor((new Date(a.submittedAt) - new Date(a.startedAt)) / 60000)
        : 'N/A';
      return [
        a.studentId.name,
        a.studentId.email,
        a.score,
        a.status,
        new Date(a.startedAt).toLocaleString(),
        a.submittedAt ? new Date(a.submittedAt).toLocaleString() : 'N/A',
        timeUsed
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `assessment_${id}_results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="container">Loading results...</div>;
  if (error) return <div className="container error">{error}</div>;

  const stats = {
    total: attempts.length,
    avgScore: attempts.length > 0 ? (attempts.reduce((acc, a) => acc + a.score, 0) / attempts.length).toFixed(1) : 0,
    maxScore: attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0,
    minScore: attempts.length > 0 ? Math.min(...attempts.map(a => a.score)) : 0
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Results: {assessment.title}</h2>
        <button className="button" onClick={exportToCSV}>Export CSV</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', margin: '20px 0' }}>
        <div className="problem-card" style={{ textAlign: 'center' }}>
          <h4>Participants</h4>
          <p style={{ fontSize: '1.5em', fontWeight: 'bold' }}>{stats.total}</p>
        </div>
        <div className="problem-card" style={{ textAlign: 'center' }}>
          <h4>Avg Score</h4>
          <p style={{ fontSize: '1.5em', fontWeight: 'bold' }}>{stats.avgScore}</p>
        </div>
        <div className="problem-card" style={{ textAlign: 'center' }}>
          <h4>Highest</h4>
          <p style={{ fontSize: '1.5em', fontWeight: 'bold' }}>{stats.maxScore}</p>
        </div>
        <div className="problem-card" style={{ textAlign: 'center' }}>
          <h4>Lowest</h4>
          <p style={{ fontSize: '1.5em', fontWeight: 'bold' }}>{stats.minScore}</p>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
            <th style={{ padding: '12px' }}>Student</th>
            <th style={{ padding: '12px' }}>Score</th>
            <th style={{ padding: '12px' }}>Status</th>
            <th style={{ padding: '12px' }}>Time Used</th>
            <th style={{ padding: '12px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {attempts.map(a => {
            const timeUsed = a.submittedAt 
              ? Math.floor((new Date(a.submittedAt) - new Date(a.startedAt)) / 60000)
              : Math.floor((new Date() - new Date(a.startedAt)) / 60000);
            return (
              <tr key={a._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>
                  <strong>{a.studentId.name}</strong><br />
                  <span style={{ fontSize: '0.85em', color: '#666' }}>{a.studentId.email}</span>
                </td>
                <td style={{ padding: '12px', fontSize: '1.1em', fontWeight: 'bold' }}>{a.score}</td>
                <td style={{ padding: '12px' }}>
                  <span className={`tag ${a.status === 'Submitted' ? 'difficulty-easy' : ''}`}>
                    {a.status}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>{timeUsed} min</td>
                <td style={{ padding: '12px' }}>
                  <Link to={`/admin/assessment-attempt/${a._id}`} className="button button-outline" style={{ fontSize: '0.9em' }}>
                    View Details
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AssessmentResultsPage;
