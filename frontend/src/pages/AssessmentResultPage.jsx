import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { assessments } from '../api';

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

        const submissionsRes = await assessments.getAttemptSubmissions(attemptId);
        setSubmissions(submissionsRes.data);

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
    const problemSubmissions = submissions.filter(s => {
      const sProblemId = s.problemId?._id || s.problemId;
      return String(sProblemId) === String(problemId);
    });
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
      <div className="problem-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
        <h1 style={{ fontSize: '5rem', margin: '0', color: 'var(--primary)', fontWeight: '800' }}>{attempt.score}</h1>
        <p style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>out of {totalMaxScore} points</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '40px', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Time Used</h3>
            <p style={{ fontSize: '1.25rem', fontWeight: '700' }}>{timeTaken} minutes</p>
          </div>
          <div>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Status</h3>
            <p style={{ fontSize: '1.25rem', fontWeight: '700', color: attempt.status === 'Submitted' ? 'var(--success)' : 'var(--warning)' }}>{attempt.status}</p>
          </div>
        </div>
      </div>

      <h3 className="mt-20">Problem Breakdown</h3>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Problem</th>
              <th>Verdict</th>
              <th style={{ textAlign: 'right' }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {assessment.problems.map((p, idx) => {
              const problemId = p.problemId?._id || p.problemId;
              const verdict = getProblemResult(problemId);
              const score = verdict === 'Accepted' ? (p.maxScore || 100) : 0;
              return (
                <tr key={problemId || idx}>
                  <td style={{ fontWeight: '600' }}>{p.problemId?.title || `Problem ${idx + 1}`}</td>
                  <td>
                    <span className={`tag ${verdict === 'Accepted' ? 'difficulty-easy' : (verdict === 'Failed' ? 'difficulty-hard' : '')}`}>
                      {verdict}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '700' }}>{score} / {p.maxScore || 100}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <Link to="/assessments" className="button">Back to Assessments</Link>
      </div>
    </div>
  );
};

export default AssessmentResultPage;
