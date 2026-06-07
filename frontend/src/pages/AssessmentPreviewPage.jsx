import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Eye, Calendar, Clock, Code2, CheckCircle2, ChevronLeft, ShieldCheck, ListChecks, Award } from 'lucide-react';
import { assessments } from '../api';

const AssessmentPreviewPage = () => {
  const { id } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <div className="container">Loading preview...</div>;
  if (error) return <div className="container error-box">{error}</div>;
  if (!assessment) return <div className="container">Assessment not found.</div>;

  const startTime = new Date(assessment.startTime);
  const endTime = new Date(assessment.endTime);

  return (
    <div className="container fade-in">
      <div className="flex-between mb-8">
        <div>
          <Link to="/admin/assessments" className="text-muted flex-center gap-2 mb-4" style={{ width: 'fit-content', fontSize: '0.9rem', justifyContent: 'flex-start' }}>
            <ChevronLeft size={16} /> Back to Management
          </Link>
          <div className="flex-center gap-3" style={{ justifyContent: 'flex-start' }}>
            <span className="tag" style={{ background: 'var(--primary-glow)', color: 'var(--primary)', fontWeight: '700' }}>FACULTY PREVIEW</span>
            <h1 style={{ margin: 0 }}>{assessment.title}</h1>
          </div>
        </div>
        <Link to={`/admin/assessments/${id}/edit`} className="button button-outline">
          Edit Setup
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
        
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Summary Card */}
          <div className="problem-card">
            <h3 className="mb-6 flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
              <ShieldCheck size={22} color="var(--primary)" /> Assessment Configuration
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '8px' }}>Schedule</div>
                <div className="mb-4">
                  <div style={{ fontSize: '0.95rem' }}>Starts: <strong>{startTime.toLocaleString()}</strong></div>
                  <div style={{ fontSize: '0.95rem' }}>Ends: <strong>{endTime.toLocaleString()}</strong></div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '8px' }}>Duration</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)' }}>{assessment.durationMinutes} Minutes</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '8px' }}>Candidate Access</div>
                <div className="mb-4" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <span className="tag">{assessment.status}</span>
                  <span className="tag">Single Attempt Restricted</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '8px' }}>Allowed Languages</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>
                  {assessment.allowedLanguages?.join(', ') || 'All Platform Languages'}
                </div>
              </div>
            </div>
          </div>

          {/* Problems List */}
          <div className="problem-card">
            <h3 className="mb-6 flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
              <ListChecks size={22} color="var(--primary)" /> Question Bank
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {assessment.problems?.map((p, index) => (
                <div key={p.problemId?._id} className="flex-between" style={{ padding: '20px', background: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div className="flex-center gap-4" style={{ justifyContent: 'flex-start' }}>
                    <div style={{ background: 'var(--primary-glow)', color: 'var(--primary)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                      {index + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{p.problemId?.title}</div>
                      <div style={{ fontSize: '0.8rem' }} className={`difficulty-${p.problemId?.difficulty?.toLowerCase()}`}>
                        {p.problemId?.difficulty}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Maximum Marks</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '800' }}>{p.maxScore}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
               <span className="text-muted">Total Assessment Score:</span>
               <strong style={{ fontSize: '1.2rem', color: 'var(--success)' }}>
                  {assessment.problems?.reduce((sum, p) => sum + p.maxScore, 0)} Marks
               </strong>
            </div>
          </div>

        </div>

        {/* Sidebar Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="problem-card" style={{ background: 'var(--primary-glow)', borderColor: 'var(--primary)' }}>
            <Award size={32} color="var(--primary)" className="mb-4" />
            <h4 className="mb-2">Verify Everything</h4>
            <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
              Ensure that all test cases for these problems are certified and hidden. Check that the start/end times do not overlap with other exams.
            </p>
          </div>

          <div className="problem-card">
            <h4 className="mb-4">Student View</h4>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>
              This is how students will see the landing page before they begin the timer.
            </p>
            <Link to={`/assessments/${id}`} className="button button-outline w-full">
              View Student Landing
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AssessmentPreviewPage;
