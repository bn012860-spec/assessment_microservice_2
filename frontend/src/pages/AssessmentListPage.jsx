import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, Calendar } from 'lucide-react';
import { assessments } from '../api';

const AssessmentListPage = () => {
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

  if (loading) return <div className="container">Loading assessments...</div>;
  if (error) return <div className="container error-box">{error}</div>;

  const now = new Date();
  const active = assessmentList.filter(a => new Date(a.startTime) <= now && new Date(a.endTime) >= now && a.status === 'Published');
  const upcoming = assessmentList.filter(a => new Date(a.startTime) > now && a.status === 'Published');
  const past = assessmentList.filter(a => new Date(a.endTime) < now || a.status !== 'Published');

  const AssessmentCard = ({ assessment, type }) => {
    const isPast = type === 'past';
    const isUpcoming = type === 'upcoming';
    const isActive = type === 'active';

    return (
      <div className={`problem-card fade-in ${isActive ? 'active-assessment' : ''}`} style={{ 
        position: 'relative', 
        borderLeft: isActive ? '4px solid var(--success)' : (isUpcoming ? '4px solid var(--primary)' : '1px solid var(--border)')
      }}>
        <div className="flex-between mb-4">
          <div className="flex-center gap-2">
            {isActive && <span className="status-dot active"></span>}
            <span className={`tag ${isActive ? 'difficulty-easy' : (isUpcoming ? 'difficulty-medium' : '')}`} style={{ fontSize: '0.7rem' }}>
              {isActive ? 'LIVE NOW' : (isUpcoming ? 'UPCOMING' : 'ENDED')}
            </span>
          </div>
          <span className="text-muted" style={{ fontSize: '0.8rem' }}>
            {assessment.durationMinutes} mins
          </span>
        </div>

        <h3 className="mb-2">{assessment.title}</h3>
        <p className="text-secondary mb-6" style={{ fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {assessment.description}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="flex-center gap-2 text-muted" style={{ fontSize: '0.8rem', justifyContent: 'flex-start' }}>
            <Calendar size={14} />
            <span>{new Date(assessment.startTime).toLocaleDateString()}</span>
          </div>
          <div className="flex-center gap-2 text-muted" style={{ fontSize: '0.8rem', justifyContent: 'flex-start' }}>
            <BookOpen size={14} />
            <span>{assessment.problems?.length || 0} Problems</span>
          </div>
        </div>

        <div className="flex-between mt-auto pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <span className="text-muted" style={{ fontSize: '0.8rem' }}>
            Ends {new Date(assessment.endTime).toLocaleString()}
          </span>
          
          <Link 
            to={`/assessments/${assessment._id}`} 
            className={`button ${isPast ? 'button-outline' : ''}`}
            style={{ padding: '6px 16px', fontSize: '0.85rem' }}
          >
            {isActive ? 'Join Now' : 'View Details'}
            <ChevronRight size={16} />
          </Link>
        </div>

        {isActive && (
          <style>{`
            .active-assessment {
              box-shadow: 0 0 20px rgba(16, 185, 129, 0.1);
              border-color: rgba(16, 185, 129, 0.3);
            }
            .status-dot {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              display: inline-block;
            }
            .status-dot.active {
              background-color: var(--success);
              box-shadow: 0 0 8px var(--success);
              animation: pulse 2s infinite;
            }
            @keyframes pulse {
              0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
              70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
              100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
            }
          `}</style>
        )}
      </div>
    );
  };

  return (
    <div className="container fade-in">
      <div className="mb-12">
        <h1 className="mb-2">Assessments</h1>
        <p className="text-muted">Take part in timed challenges to test your skills and compete with others.</p>
      </div>

      {active.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-6 flex-center gap-2" style={{ justifyContent: 'flex-start', color: 'var(--success)', fontSize: '1.25rem' }}>
            <div className="status-dot active"></div>
            Active Assessments
          </h2>
          <div className="problem-card-grid">
            {active.map(a => <AssessmentCard key={a._id} assessment={a} type="active" />)}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-6" style={{ fontSize: '1.25rem' }}>Upcoming Challenges</h2>
          <div className="problem-card-grid">
            {upcoming.map(a => <AssessmentCard key={a._id} assessment={a} type="upcoming" />)}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-6" style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>Past Assessments</h2>
        {past.length > 0 ? (
          <div className="problem-card-grid">
            {past.map(a => <AssessmentCard key={a._id} assessment={a} type="past" />)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
            <p className="text-muted">No past assessments found.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default AssessmentListPage;
