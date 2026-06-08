import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Play, Calendar, Clock, Code2, AlertTriangle, ChevronLeft, CheckCircle2 } from 'lucide-react';
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
      const attempt = res.data;
      navigate(`/assessment-attempt/${attempt._id}`);
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to start assessment');
    } finally {
      setStarting(false);
    }
  };

  if (loading) return <div className="container">Loading assessment details...</div>;
  if (error) return <div className="container error-box">{error}</div>;
  if (!assessment) return <div className="container">Assessment not found.</div>;

  const now = new Date();
  const startTime = new Date(assessment.startTime);
  const endTime = new Date(assessment.endTime);
  const isAvailable = now >= startTime && now <= endTime && assessment.status === 'Published';
  const isUpcoming = now < startTime;
  const isEnded = now > endTime || assessment.status !== 'Published';

  const isStudent = user && user.role === 'student';
  const availableForUser = isAvailable && isStudent;

  return (
    <div className="container fade-in">
      <div className="mb-8">
        <Link to="/assessments" className="text-muted flex-center gap-2 mb-6" style={{ width: 'fit-content', fontSize: '0.9rem', justifyContent: 'flex-start' }}>
          <ChevronLeft size={16} /> Back to Assessments
        </Link>
        <h1 className="mb-2">{assessment.title}</h1>
        <p className="text-secondary" style={{ fontSize: '1.1rem', maxWidth: '800px' }}>
          {assessment.description}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Left Col: Info */}
        <div className="problem-card" style={{ height: 'fit-content' }}>
          <h3 className="mb-6">Assessment Details</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="flex-center gap-4" style={{ justifyContent: 'flex-start' }}>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <Clock size={24} color="var(--primary)" />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>Duration</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{assessment.durationMinutes} Minutes</div>
              </div>
            </div>

            <div className="flex-center gap-4" style={{ justifyContent: 'flex-start' }}>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <Calendar size={24} color="var(--success)" />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>Window</div>
                <div style={{ fontSize: '0.95rem' }}>Starts: <strong>{startTime.toLocaleString()}</strong></div>
                <div style={{ fontSize: '0.95rem' }}>Ends: <strong>{endTime.toLocaleString()}</strong></div>
              </div>
            </div>

            <div className="flex-center gap-4" style={{ justifyContent: 'flex-start' }}>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <Code2 size={24} color="var(--warning)" />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>Languages</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>
                  {assessment.allowedLanguages?.join(', ') || 'All Supported Languages'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Action & Problems summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Action Box */}
          <div className="problem-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px', background: isAvailable ? 'var(--surface-hover)' : 'var(--surface)', borderColor: isAvailable ? 'var(--primary)' : 'var(--border)' }}>
            
            {availableForUser ? (
              <>
                <div className="mb-4" style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 16px var(--success)', animation: 'pulse 2s infinite' }}></div>
                <h3 className="mb-2" style={{ color: 'var(--success)' }}>Live Now</h3>
                <p className="text-secondary mb-6">You have {assessment.durationMinutes} minutes to complete {assessment.problems?.length} problems.</p>
                <button
                  className="button"
                  style={{ padding: '16px 40px', fontSize: '1.15rem', borderRadius: '100px' }}
                  onClick={handleStart}
                  disabled={starting}
                >
                  <Play size={20} />
                  {starting ? 'Preparing Workspace...' : 'Start Assessment'}
                </button>
              </>
            ) : isAvailable && !isStudent ? (
              <>
                <AlertTriangle size={48} className="text-muted mb-4" />
                <h3 className="mb-2 text-muted">Cannot Start</h3>
                <p className="text-secondary mb-6">You cannot start this assessment because your account role is <strong>{user?.role || 'guest'}</strong>. Only students can start assessments.</p>
              </>
            ) : isUpcoming ? (
              <>
                <Calendar size={48} className="text-muted mb-4" />
                <h3 className="mb-2">Upcoming Assessment</h3>
                <p className="text-secondary mb-6">This assessment will be available shortly.</p>
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '16px 32px', borderRadius: '100px', color: 'var(--primary)', border: '1px solid rgba(99, 102, 241, 0.2)', fontWeight: '600' }}>
                  Available on {startTime.toLocaleDateString()}
                </div>
              </>
            ) : (
              <>
                <AlertTriangle size={48} className="text-muted mb-4" />
                <h3 className="mb-2 text-muted">Assessment Ended</h3>
                <p className="text-secondary mb-0">This assessment is no longer accepting submissions.</p>
              </>
            )}

          </div>

          <div className="problem-card">
            <h4 className="mb-4 flex-center gap-2" style={{ justifyContent: 'flex-start' }}><CheckCircle2 size={18} /> Problems Included</h4>
            <div className="flex-between" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: '700' }}>{assessment.problems?.length || 0}</span>
              <span className="text-muted">Total Coding Challenges</span>
            </div>
            <p className="text-muted mt-4" style={{ fontSize: '0.85rem' }}>
              Note: Problem details are hidden until you start the assessment to prevent cheating.
            </p>
          </div>

        </div>

      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `}</style>
    </div>
  );
};

export default AssessmentDetailsPage;
