import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, Users, Code2, RefreshCw, AlertCircle, BookOpen } from 'lucide-react';
import api from '../api';

const SystemDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/admin/system-stats');
      setStats(res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch system stats', err);
      setError(err.response?.data?.error || 'Failed to fetch system stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (loading && !stats) return <div className="container">Loading system dashboard...</div>;

  const getHealthColor = (status) => {
    switch (status) {
      case 'healthy':
      case 'connected':
        return 'var(--success)';
      case 'error':
      case 'unhealthy':
        return 'var(--error)';
      case 'disconnected':
      case 'offline':
        return 'var(--text-muted)';
      default:
        return 'var(--warning)';
    }
  };

  return (
    <div className="container fade-in">
      <div className="flex-between mb-8">
        <div>
          <h1 className="mb-2">System Dashboard</h1>
          <p className="text-muted">Live monitoring of platform infrastructure and metrics.</p>
        </div>
        <div className="flex-center gap-4">
          <div className="flex-center gap-2">
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>Auto-refresh:</span>
            <select 
              value={refreshInterval} 
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
            >
              <option value={2000}>2s</option>
              <option value={5000}>5s</option>
              <option value={10000}>10s</option>
              <option value={30000}>30s</option>
              <option value={0}>Off</option>
            </select>
          </div>
          <button className="button button-outline" onClick={fetchStats} disabled={loading} style={{ padding: '8px 16px' }}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-box mb-8 flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* System Health */}
      <div className="problem-card mb-8">
        <h3 className="mb-6 flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
          <Activity size={20} color="var(--primary)" /> System Health
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {stats?.health ? Object.entries(stats.health).map(([service, status]) => (
            <div key={service} style={{ 
              padding: '20px', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid',
              borderColor: getHealthColor(status),
              textAlign: 'center',
              background: `color-mix(in srgb, ${getHealthColor(status)} 10%, transparent)`
            }}>
              <div style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '8px' }}>
                {service}
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: getHealthColor(status) }}>
                {status.toUpperCase()}
              </div>
            </div>
          )) : <p className="text-muted">Loading health status...</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Queue Monitoring */}
        <div className="problem-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 className="mb-6 flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
            <Server size={20} color="var(--primary)" /> Queue & Workers
          </h3>
          <div style={{ textAlign: 'center', padding: '32px 0', borderBottom: '1px solid var(--border)', background: 'var(--bg)', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
            <div style={{ fontSize: '4.5rem', fontWeight: '800', color: (stats?.queueLength || 0) > 50 ? 'var(--error)' : 'var(--primary)', lineHeight: 1 }}>
              {stats?.queueLength || 0}
            </div>
            <p style={{ color: 'var(--text-muted)', marginTop: '12px', marginBottom: 0, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Submissions</p>
          </div>
          
          <div style={{ flex: 1 }}>
            <h4 className="mb-4 text-muted" style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Judge Pools</h4>
            {stats?.judgeStats ? (
              <div className="table-container" style={{ border: 'none', background: 'var(--bg)' }}>
                <table className="table" style={{ border: 'none' }}>
                  <thead>
                    <tr>
                      <th style={{ background: 'transparent' }}>Language</th>
                      <th style={{ background: 'transparent', textAlign: 'center' }}>Available</th>
                      <th style={{ background: 'transparent', textAlign: 'center' }}>In Use</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from(new Set([
                      ...Object.keys(stats.judgeStats.available || {}),
                      ...Object.keys(stats.judgeStats.in_use || {})
                    ])).map((lang) => {
                      const inUse = stats.judgeStats.in_use?.[lang] || 0;
                      return (
                        <tr key={lang} style={{ background: 'transparent' }}>
                          <td style={{ textTransform: 'capitalize', fontWeight: '600', color: 'var(--text)' }}>{lang}</td>
                          <td style={{ textAlign: 'center', color: 'var(--success)' }}>{stats.judgeStats.available?.[lang] || 0}</td>
                          <td style={{ textAlign: 'center', color: inUse > 0 ? 'var(--warning)' : 'var(--text-muted)', fontWeight: inUse > 0 ? '700' : 'normal' }}>
                            {inUse}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', background: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
                Judge service stats unavailable
              </div>
            )}
          </div>
        </div>

        {/* Global Metrics */}
        <div className="problem-card">
          <h3 className="mb-6 flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
            <Database size={20} color="var(--primary)" /> Platform Metrics
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: 'var(--bg)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div className="flex-center gap-2 mb-4" style={{ justifyContent: 'flex-start', color: 'var(--text-muted)' }}>
                <BookOpen size={16} />
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '700' }}>Content</span>
              </div>
              <div className="flex-between mb-3"><span className="text-secondary">Problems</span><strong style={{ fontSize: '1.1rem' }}>{stats?.metrics?.totalProblems || 0}</strong></div>
              <div className="flex-between mb-3"><span className="text-secondary">Assessments</span><strong style={{ fontSize: '1.1rem' }}>{stats?.metrics?.totalAssessments || 0}</strong></div>
              <div className="flex-between"><span className="text-secondary">Users</span><strong style={{ fontSize: '1.1rem' }}>{stats?.metrics?.totalUsers || 0}</strong></div>
            </div>
            
            <div style={{ background: 'var(--bg)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div className="flex-center gap-2 mb-4" style={{ justifyContent: 'flex-start', color: 'var(--text-muted)' }}>
                <Code2 size={16} />
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '700' }}>Submissions</span>
              </div>
              <div className="flex-between mb-3"><span className="text-secondary">Total</span><strong style={{ fontSize: '1.1rem' }}>{stats?.metrics?.totalSubmissions || 0}</strong></div>
              <div className="flex-between mb-3"><span className="text-secondary">Today</span><strong style={{ fontSize: '1.1rem' }}>{stats?.metrics?.submissionsToday || 0}</strong></div>
              <div className="flex-between"><span className="text-secondary">Accepted Today</span><strong style={{ fontSize: '1.1rem', color: 'var(--success)' }}>{stats?.metrics?.acceptedToday || 0}</strong></div>
            </div>
          </div>
          
          <div style={{ marginTop: '24px', padding: '32px', background: 'linear-gradient(135deg, var(--primary) 0%, #4338ca 100%)', color: 'white', borderRadius: 'var(--radius-lg)', textAlign: 'center', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)' }}>
            <div style={{ fontSize: '0.85rem', opacity: 0.9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall Acceptance Rate (Today)</div>
            <div style={{ fontSize: '3.5rem', fontWeight: '800', marginTop: '12px', lineHeight: 1 }}>
              {stats?.metrics?.submissionsToday > 0 ? ((stats.metrics.acceptedToday / stats.metrics.submissionsToday) * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Recent Submissions Feed */}
      <div className="problem-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ margin: 0 }}>Live Submission Feed</h3>
        </div>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Problem</th>
                <th>Language</th>
                <th>Verdict</th>
                <th style={{ textAlign: 'right' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentSubmissions && stats.recentSubmissions.length > 0 ? (
                stats.recentSubmissions.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <div style={{ fontWeight: '600', color: 'var(--text)' }}>{s.userId?.name || 'Anonymous'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.userId?.email}</div>
                    </td>
                    <td style={{ color: 'var(--text)', fontWeight: '500' }}>{s.problemId?.title || 'Unknown'}</td>
                    <td style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{s.language}</td>
                    <td>
                      <span className={`tag ${s.status === 'Success' ? 'difficulty-easy' : (['Fail', 'Error'].includes(s.status) ? 'difficulty-hard' : '')}`}>
                        {s.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {new Date(s.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No recent activity</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SystemDashboardPage;
