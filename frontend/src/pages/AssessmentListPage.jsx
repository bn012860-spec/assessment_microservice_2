import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { assessments } from '../api';

const AssessmentListPage = ({ user }) => {
  const [assessmentList, setAssessmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const res = await assessments.list();
        setAssessmentList(res.data);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to fetch assessments');
      } finally {
        setLoading(false);
      }
    };
    fetchAssessments();
  }, []);

  if (loading) return <div>Loading assessments...</div>;
  if (error) return <div className="error">{error}</div>;

  const now = new Date();

  const active = assessmentList.filter(a => new Date(a.startTime) <= now && new Date(a.endTime) >= now && a.status === 'Published');
  const upcoming = assessmentList.filter(a => new Date(a.startTime) > now && a.status === 'Published');
  const completed = assessmentList.filter(a => new Date(a.endTime) < now || a.status === 'Completed');

  const AssessmentCard = ({ assessment }) => (
    <div className="problem-card" style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3>{assessment.title}</h3>
          <p>{assessment.description}</p>
          <div style={{ fontSize: '0.9em', color: '#666' }}>
            <span>Starts: {new Date(assessment.startTime).toLocaleString()}</span>
            <span style={{ margin: '0 10px' }}>|</span>
            <span>Duration: {assessment.durationMinutes} mins</span>
            <span style={{ margin: '0 10px' }}>|</span>
            <span>Problems: {assessment.problems?.length || 0}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to={`/assessments/${assessment._id}`} className="button button-outline">
            View Details
          </Link>
          {(user?.role === 'admin' || user?.role === 'faculty') && (
            <Link to={`/admin/assessments/${assessment._id}/results`} className="button" style={{ background: '#9b59b6' }}>
              Results
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <h2>Assessments</h2>
      
      {active.length > 0 && (
        <section>
          <h3 style={{ color: '#2ecc71' }}>Active Assessments</h3>
          {active.map(a => <AssessmentCard key={a._id} assessment={a} />)}
        </section>
      )}

      {upcoming.length > 0 && (
        <section>
          <h3 style={{ color: '#3498db' }}>Upcoming Assessments</h3>
          {upcoming.map(a => <AssessmentCard key={a._id} assessment={a} />)}
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <h3 style={{ color: '#95a5a6' }}>Completed Assessments</h3>
          {completed.map(a => <AssessmentCard key={a._id} assessment={a} />)}
        </section>
      )}

      {assessmentList.length === 0 && <p>No assessments available.</p>}
    </div>
  );
};

export default AssessmentListPage;
