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
      <div style={{ marginBottom: '24px' }}>
        <Link to={`/admin/assessments/${attempt.assessmentId._id || attempt.assessmentId}/results`} className="button button-outline">
          &larr; Back to All Results
        </Link>
      </div>

      <div className="problem-card">
        <h2 style={{ margin: '0 0 8px' }}>Student: {attempt.studentId.name}</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0 0 24px' }}>{attempt.studentId.email}</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '24px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.05em' }}>Score</div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)' }}>{attempt.score}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.05em' }}>Time Used</div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)' }}>{timeUsed} min</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.05em' }}>Status</div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: attempt.status === 'Completed' ? 'var(--success)' : 'var(--warning)' }}>{attempt.status}</div>
          </div>
        </div>
      </div>

      <div className="detail-layout" style={{ display: 'flex', gap: '24px', marginTop: '30px', height: '700px' }}>
        {/* Submissions List */}
        <div className="detail-sidebar" style={{ width: '320px', display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <h4 style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)', margin: 0 }}>Submissions</h4>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {submissions.map(s => (
              <div 
                key={s._id} 
                onClick={() => setSelectedSubmission(s)}
                style={{ 
                  padding: '16px 20px', 
                  cursor: 'pointer', 
                  borderBottom: '1px solid var(--border)',
                  background: selectedSubmission?._id === s._id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  borderLeft: selectedSubmission?._id === s._id ? '4px solid var(--primary)' : '4px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>{s.problemId?.title || 'Unknown Problem'}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ textTransform: 'capitalize' }}>{s.language}</span>
                  <span>{new Date(s.createdAt).toLocaleTimeString()}</span>
                </div>
                <span className={`tag ${s.status === 'Success' ? 'difficulty-easy' : 'difficulty-hard'}`}>
                  {s.status}
                </span>
              </div>
            ))}
            {submissions.length === 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No submissions found.
              </div>
            )}
          </div>
        </div>

        {/* Code Viewer */}
        <div className="detail-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#1e1e1e', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          {selectedSubmission ? (
            <>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)' }}>
                <h4 style={{ margin: 0 }}>Submission Code</h4>
                <div className={`tag ${selectedSubmission.status === 'Success' ? 'difficulty-easy' : 'difficulty-hard'}`}>
                  {selectedSubmission.status}
                </div>
              </div>
              <pre style={{ 
                flex: 1, 
                margin: 0, 
                padding: '24px', 
                backgroundColor: '#1e1e1e', 
                color: '#d4d4d4',
                overflow: 'auto',
                fontSize: '14px',
                lineHeight: '1.6',
                fontFamily: "'Fira Code', monospace"
              }}>
                {selectedSubmission.code}
              </pre>
            </>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)', flexDirection: 'column', gap: '16px' }}>
              <span style={{ fontSize: '3rem', opacity: 0.2 }}>&lt;/&gt;</span>
              Select a submission to view code
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentAttemptDetailPage;
