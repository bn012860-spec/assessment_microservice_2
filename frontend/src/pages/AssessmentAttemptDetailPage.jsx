import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { assessments } from '../api';

const AssessmentAttemptDetailPage = () => {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attemptRes, submissionsRes] = await Promise.all([
          assessments.getAttempt(attemptId),
          assessments.getAttemptSubmissions(attemptId)
        ]);
        setAttempt(attemptRes.data);
        setSubmissions(submissionsRes.data);
        if (submissionsRes.data.length > 0) {
          setSelectedSubmission(submissionsRes.data[0]);
        }
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to fetch attempt details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [attemptId]);

  if (loading) return <div className="container">Loading details...</div>;
  if (error) return <div className="container error">{error}</div>;

  const timeUsed = attempt.submittedAt 
    ? Math.floor((new Date(attempt.submittedAt) - new Date(attempt.startedAt)) / 60000)
    : Math.floor((new Date() - new Date(attempt.startedAt)) / 60000);

  return (
    <div className="container">
      <Link to={`/admin/assessments/${attempt.assessmentId._id || attempt.assessmentId}/results`} className="button button-outline mb-20">
        &larr; Back to All Results
      </Link>

      <div className="problem-card">
        <h2>Student: {attempt.studentId.name}</h2>
        <p>Email: {attempt.studentId.email}</p>
        <div style={{ display: 'flex', gap: '40px', marginTop: '20px' }}>
          <div>
            <strong>Score:</strong>
            <div style={{ fontSize: '2em', fontWeight: 'bold' }}>{attempt.score}</div>
          </div>
          <div>
            <strong>Time Used:</strong>
            <div style={{ fontSize: '2em', fontWeight: 'bold' }}>{timeUsed} min</div>
          </div>
          <div>
            <strong>Status:</strong>
            <div style={{ fontSize: '2em', fontWeight: 'bold' }}>{attempt.status}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginTop: '30px', height: '600px' }}>
        {/* Submissions List */}
        <div style={{ width: '300px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '4px' }}>
          <h4 style={{ padding: '10px', borderBottom: '1px solid #eee', margin: 0 }}>Submissions</h4>
          {submissions.map(s => (
            <div 
              key={s._id} 
              onClick={() => setSelectedSubmission(s)}
              style={{ 
                padding: '10px', 
                cursor: 'pointer', 
                borderBottom: '1px solid #eee',
                background: selectedSubmission?._id === s._id ? '#f0f7ff' : 'white'
              }}
            >
              <div style={{ fontWeight: 'bold' }}>{s.problemId?.title || 'Unknown Problem'}</div>
              <div style={{ fontSize: '0.85em', color: '#666', display: 'flex', justifyContent: 'space-between' }}>
                <span>{s.language}</span>
                <span>{new Date(s.createdAt).toLocaleTimeString()}</span>
              </div>
              <div className={`tag ${s.status === 'Success' ? 'difficulty-easy' : 'difficulty-hard'}`} style={{ marginTop: '5px' }}>
                {s.status}
              </div>
            </div>
          ))}
          {submissions.length === 0 && <p style={{ padding: '10px' }}>No submissions found.</p>}
        </div>

        {/* Code Viewer */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid #eee', borderRadius: '4px' }}>
          {selectedSubmission ? (
            <>
              <div style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0 }}>Submission Code</h4>
                <div className="tag">{selectedSubmission.status}</div>
              </div>
              <pre style={{ 
                flex: 1, 
                margin: 0, 
                padding: '20px', 
                backgroundColor: '#f8f9fa', 
                overflow: 'auto',
                fontSize: '14px',
                fontFamily: 'monospace'
              }}>
                {selectedSubmission.code}
              </pre>
            </>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#999' }}>
              Select a submission to view code
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentAttemptDetailPage;
