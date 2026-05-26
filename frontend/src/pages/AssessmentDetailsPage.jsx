import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assessments } from '../api';

const AssessmentDetailsPage = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const res = await assessments.get(id);
        setAssessment(res.data);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to fetch assessment details');
      } finally {
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [id]);

  const handleStart = async () => {
    if (!window.confirm('Are you sure you want to start this assessment? The timer will begin immediately.')) {
      return;
    }

    setStarting(true);
    try {
      const res = await assessments.start(id);
      // The start endpoint returns the attempt object
      const attempt = res.data;
      navigate(`/assessment-attempt/${attempt._id}`);
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to start assessment');
    } finally {
      setStarting(false);
    }
  };

  if (loading) return <div>Loading assessment details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!assessment) return <div>Assessment not found.</div>;

  const now = new Date();
  const startTime = new Date(assessment.startTime);
  const endTime = new Date(assessment.endTime);
  const isAvailable = now >= startTime && now <= endTime && assessment.status === 'Published';
  const isUpcoming = now < startTime;

  return (
    <div className="container">
      <h2>{assessment.title}</h2>
      <div className="problem-card">
        <p style={{ fontSize: '1.2em', marginBottom: '20px' }}>{assessment.description}</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          <div>
            <strong>Duration:</strong> {assessment.durationMinutes} minutes
          </div>
          <div>
            <strong>Problems:</strong> {assessment.problems?.length || 0}
          </div>
          <div>
            <strong>Start Time:</strong> {startTime.toLocaleString()}
          </div>
          <div>
            <strong>End Time:</strong> {endTime.toLocaleString()}
          </div>
          <div>
            <strong>Allowed Languages:</strong> {assessment.allowedLanguages?.join(', ') || 'All'}
          </div>
        </div>

        {isAvailable ? (
          <button 
            className="button" 
            style={{ padding: '15px 30px', fontSize: '1.1em' }}
            onClick={handleStart}
            disabled={starting}
          >
            {starting ? 'Starting...' : 'Start Assessment Now'}
          </button>
        ) : isUpcoming ? (
          <div className="info-box" style={{ background: '#e1f5fe', padding: '15px', borderRadius: '4px' }}>
            This assessment will be available on {startTime.toLocaleString()}.
          </div>
        ) : (
          <div className="info-box" style={{ background: '#f5f5f5', padding: '15px', borderRadius: '4px' }}>
            This assessment has ended or is not yet published.
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentDetailsPage;
