import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { assessments } from '../api';

const AssessmentResultPage = () => {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const attemptRes = await assessments.getAttempt(attemptId);
        setAttempt(attemptRes.data);

        const assessmentRes = await assessments.get(attemptRes.data.assessmentId._id || attemptRes.data.assessmentId);
        setAssessment(assessmentRes.data);

        // Fetch all submissions for this attempt
        // We'll use a filtered list from the general submissions endpoint for now
        // A dedicated endpoint for attempt submissions would be better in the future
        const submissionsRes = await api.get('/api/submissions/my');
        const attemptSubmissions = submissionsRes.data.filter(s => s.attemptId === attemptId);
        setSubmissions(attemptSubmissions);

      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to load result');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [attemptId]);

  if (loading) return <div className="container">Loading results...</div>;
  if (error) return <div className="container error">{error}</div>;

  const getProblemResult = (problemId) => {
    const problemSubmissions = submissions.filter(s => s.problemId === problemId || s.problemId?._id === problemId);
    const wasAccepted = problemSubmissions.some(s => s.status === 'Success');
    return wasAccepted ? 'Accepted' : (problemSubmissions.length > 0 ? 'Failed' : 'Not Attempted');
  };

  const totalMaxScore = assessment.problems.reduce((acc, p) => acc + (p.maxScore || 100), 0);
  const timeTaken = attempt.submittedAt 
    ? Math.floor((new Date(attempt.submittedAt) - new Date(attempt.startedAt)) / 60000)
    : Math.floor((new Date() - new Date(attempt.startedAt)) / 60000);

  return (
    <div className="container">
      <h2>Assessment Result</h2>
      <div className="problem-card" style={{ textAlign: 'center', padding: '40px' }}>
        <h1 style={{ fontSize: '4em', margin: '0', color: '#2c3e50' }}>{attempt.score}</h1>
        <p style={{ fontSize: '1.5em', color: '#7f8c8d' }}>out of {totalMaxScore} points</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '50px', marginTop: '30px' }}>
          <div>
            <h3>Time Used</h3>
            <p style={{ fontSize: '1.2em' }}>{timeTaken} minutes</p>
          </div>
          <div>
            <h3>Status</h3>
            <p style={{ fontSize: '1.2em' }}>{attempt.status}</p>
          </div>
        </div>
      </div>

      <h3 className="mt-20">Problem Breakdown</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
            <th style={{ padding: '10px' }}>Problem</th>
            <th style={{ padding: '10px' }}>Verdict</th>
            <th style={{ padding: '10px' }}>Score</th>
          </tr>
        </thead>
        <tbody>
          {assessment.problems.map((p, idx) => {
            const verdict = getProblemResult(p.problemId._id || p.problemId);
            const score = verdict === 'Accepted' ? (p.maxScore || 100) : 0;
            return (
              <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>{p.problemId.title || `Problem ${idx + 1}`}</td>
                <td style={{ padding: '10px' }}>
                  <span className={`tag ${verdict === 'Accepted' ? 'difficulty-easy' : (verdict === 'Failed' ? 'difficulty-hard' : '')}`}>
                    {verdict}
                  </span>
                </td>
                <td style={{ padding: '10px' }}>{score} / {p.maxScore || 100}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <Link to="/assessments" className="button">Back to Assessments</Link>
      </div>
    </div>
  );
};

export default AssessmentResultPage;
