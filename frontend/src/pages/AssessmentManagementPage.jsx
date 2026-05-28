import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Users, Calendar, AlertCircle, Settings } from 'lucide-react';
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
  if (error) return <div className="container error-box">{error}</div>;

  return (
    <div className="container fade-in">
      <div className="flex-between mb-8">
        <div>
          <h1 className="mb-2">Manage Assessments</h1>
          <p className="text-muted">Create and manage coding assessments, view participant results.</p>
        </div>
        <Link to="/admin/assessments/add" className="button">
          <Plus size={18} />
          Create Assessment
        </Link>
      </div>

      <div className="problem-card-grid" style={{ gridTemplateColumns: '1fr' }}>
        {assessmentList.map((a) => {
          const now = new Date();
          const startTime = new Date(a.startTime);
          const endTime = new Date(a.endTime);
          
          let statusLabel = 'ENDED';
          let statusColor = 'var(--text-muted)';
          let statusBg = 'rgba(255,255,255,0.05)';
          
          if (a.status === 'Draft') {
            statusLabel = 'DRAFT';
            statusColor = 'var(--warning)';
            statusBg = 'rgba(245, 158, 11, 0.1)';
          } else if (now >= startTime && now <= endTime) {
            statusLabel = 'LIVE NOW';
            statusColor = 'var(--success)';
            statusBg = 'rgba(16, 185, 129, 0.1)';
          } else if (now < startTime) {
            statusLabel = 'UPCOMING';
            statusColor = 'var(--primary)';
            statusBg = 'rgba(99, 102, 241, 0.1)';
          }

          return (
            <div key={a._id} className="problem-card" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '24px' }}>
              <div style={{ flex: 1 }}>
                <div className="flex-center gap-2 mb-2" style={{ justifyContent: 'flex-start' }}>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '100px', 
                    fontSize: '0.7rem', 
                    fontWeight: '700', 
                    color: statusColor, 
                    backgroundColor: statusBg,
                    letterSpacing: '0.05em'
                  }}>
                    {statusLabel}
                  </span>
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>ID: {a._id.slice(-6)}</span>
                </div>
                
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem' }}>{a.title}</h3>
                
                <div className="flex-center gap-6 text-muted" style={{ fontSize: '0.85rem', justifyContent: 'flex-start' }}>
                  <span className="flex-center gap-2"><Calendar size={14} /> {startTime.toLocaleDateString()} - {endTime.toLocaleDateString()}</span>
                  <span className="flex-center gap-2"><Users size={14} /> {a.participantCount || 0} participants</span>
                </div>
              </div>

              <div className="flex-center gap-3">
                <Link to={`/admin/assessments/${a._id}/results`} className="button button-outline" style={{ padding: '8px 16px', color: 'var(--primary)', borderColor: 'var(--primary-glow)', backgroundColor: 'var(--primary-glow)' }}>
                  <Users size={16} /> Results
                </Link>
                <Link to={`/admin/assessments/${a._id}/edit`} className="button button-outline" style={{ padding: '8px 16px' }}>
                  <Edit2 size={16} /> Edit
                </Link>
                <button onClick={() => handleDelete(a._id)} className="button button-outline" style={{ padding: '8px 16px', color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          )
        })}
        {assessmentList.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px', background: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1px dashed var(--border)' }}>
            <AlertCircle size={48} className="text-muted mb-4" style={{ margin: '0 auto' }} />
            <p className="text-muted" style={{ fontSize: '1.1rem' }}>No assessments found.</p>
            <Link to="/admin/assessments/add" className="button mt-4">Create your first assessment</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentManagementPage;
