import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { assessments } from '../api';

const AssessmentManagementPage = () => {
  const [assessmentList, setAssessmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    fetchAssessments();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this assessment?')) {
      try {
        await assessments.delete(id);
        fetchAssessments();
      } catch (err) {
        alert(err.response?.data?.msg || 'Failed to delete assessment');
      }
    }
  };

  if (loading) return <div className="container">Loading assessments...</div>;
  if (error) return <div className="container error">{error}</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Manage Assessments</h2>
        <Link to="/admin/assessments/add" className="button">Create Assessment</Link>
      </div>

      <div className="problem-list">
        {assessmentList.map((a) => (
          <div key={a._id} className="problem-card" style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0' }}>{a.title}</h3>
                <div className="flex-gap">
                  <span className={`tag ${a.status === 'Published' ? 'difficulty-easy' : (a.status === 'Draft' ? 'difficulty-medium' : '')}`}>
                    {a.status}
                  </span>
                  <span style={{ color: '#666', fontSize: '0.9em' }}>
                    {new Date(a.startTime).toLocaleDateString()} - {new Date(a.endTime).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link to={`/admin/assessments/${a._id}/results`} className="button button-outline" style={{ border: '1px solid #9b59b6', color: '#9b59b6' }}>
                  Results
                </Link>
                <Link to={`/admin/assessments/${a._id}/edit`} className="button button-outline">
                  Edit
                </Link>
                <button onClick={() => handleDelete(a._id)} className="button button-outline" style={{ border: '1px solid #e74c3c', color: '#e74c3c' }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {assessmentList.length === 0 && <p>No assessments found. Create your first one!</p>}
      </div>
    </div>
  );
};

export default AssessmentManagementPage;
