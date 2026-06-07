import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, Users, Code2, RefreshCw, AlertCircle, BookOpen, History } from 'lucide-react';
import api, { admin } from '../api';

const SystemDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  const fetchStats = async () => {
    try {
      const [statsRes, logsRes] = await Promise.all([
        admin.getSystemStats(),
        admin.getAuditLogs({ limit: 20 })
      ]);
      setStats(statsRes.data);
      setLogs(logsRes.data);
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

      <div className="grid grid-cols-2 gap-6 mb-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Left Column: Health & Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="problem-card">
            <h3 className="mb-6 flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
              <Activity size={20} color="var(--primary)" /> System Health
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {stats?.health ? Object.entries(stats.health).map(([service, status]) => (
                <div key={service} className="flex-between" style={{ 
                  padding: '12px 16px', 
                  borderRadius: 'var(--radius-md)', 
                  background: 'var(--bg)',
                  border: '1px solid var(--border)'
                }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{service}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: getHealthColor(status) }}>{status.toUpperCase()}</span>
                </div>
              )) : <p className="text-muted">Loading...</p>}
            </div>
          </div>

          <div className="problem-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 className="mb-6 flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
              <History size={20} color="var(--primary)" /> Audit Logs
            </h3>
            <div style={{ flex: 1, maxHeight: '500px', overflowY: 'auto' }}>
              {logs.map((log) => (
                <div key={log._id} className="mb-4 pb-4" style={{ borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                  <div className="flex-between mb-1">
                    <span className={`tag ${log.event.includes('FAILED') || log.event.includes('TIMEOUT') ? 'difficulty-hard' : 'difficulty-easy'}`} style={{ fontSize: '0.7rem' }}>
                      {log.event}
                    </span>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex-between">
                    <span style={{ fontWeight: '600' }}>{log.userId?.name || 'System'}</span>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>{log.ip}</span>
                  </div>
                  {log.details && Object.keys(log.details).length > 0 && (
                    <div className="mt-2 text-muted" style={{ fontSize: '0.8rem', background: 'var(--bg)', padding: '6px 10px', borderRadius: '4px', border: '1px dashed var(--border)' }}>
                      {JSON.stringify(log.details)}
                    </div>
                  )}
                </div>
              ))}
              {logs.length === 0 && <p className="text-muted text-center py-8">No logs found.</p>}
            </div>
          </div>
        </div>

        {/* Right Column: Queue & Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="problem-card">
            <h3 className="mb-6 flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
              <Server size={20} color="var(--primary)" /> Queue & Workers
            </h3>
            <div style={{ textAlign: 'center', padding: '24px 0', background: 'var(--bg)', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
              <div style={{ fontSize: '3.5rem', fontWeight: '800', color: (stats?.queueLength || 0) > 50 ? 'var(--error)' : 'var(--primary)', lineHeight: 1 }}>
                {stats?.queueLength || 0}
              </div>
              <p style={{ color: 'var(--text-muted)', marginTop: '8px', marginBottom: 0, fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem' }}>Pending Submissions</p>
            </div>
            
            <h4 className="mb-3 text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Judge Pools</h4>
            {stats?.judgeStats ? (
              <div className="table-container" style={{ border: 'none', background: 'var(--bg)' }}>
                <table className="table" style={{ border: 'none' }}>
                  <thead>
                    <tr>
                      <th style={{ background: 'transparent' }}>Lang</th>
                      <th style={{ background: 'transparent', textAlign: 'center' }}>Avail</th>
                      <th style={{ background: 'transparent', textAlign: 'center' }}>Busy</th>
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
                          <td style={{ textTransform: 'capitalize', fontWeight: '600' }}>{lang}</td>
                          <td style={{ textAlign: 'center', color: 'var(--success)' }}>{stats.judgeStats.available?.[lang] || 0}</td>
                          <td style={{ textAlign: 'center', color: inUse > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>{inUse}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-muted text-center py-4">Stats unavailable</p>}
          </div>

          <div className="problem-card">
            <h3 className="mb-6 flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
              <Database size={20} color="var(--primary)" /> Metrics
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div className="flex-between mb-2"><span className="text-muted" style={{ fontSize: '0.8rem' }}>Problems</span><strong>{stats?.metrics?.totalProblems || 0}</strong></div>
                <div className="flex-between mb-2"><span className="text-muted" style={{ fontSize: '0.8rem' }}>Assessments</span><strong>{stats?.metrics?.totalAssessments || 0}</strong></div>
                <div className="flex-between"><span className="text-muted" style={{ fontSize: '0.8rem' }}>Users</span><strong>{stats?.metrics?.totalUsers || 0}</strong></div>
              </div>
              <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div className="flex-between mb-2"><span className="text-muted" style={{ fontSize: '0.8rem' }}>Today</span><strong>{stats?.metrics?.submissionsToday || 0}</strong></div>
                <div className="flex-between mb-2"><span className="text-muted" style={{ fontSize: '0.8rem' }}>Accepted</span><strong style={{ color: 'var(--success)' }}>{stats?.metrics?.acceptedToday || 0}</strong></div>
                <div className="flex-between"><span className="text-muted" style={{ fontSize: '0.8rem' }}>Rate</span><strong>{stats?.metrics?.submissionsToday > 0 ? ((stats.metrics.acceptedToday / stats.metrics.submissionsToday) * 100).toFixed(1) : 0}%</strong></div>
              </div>
            </div>
            
            <div style={{ marginTop: '20px', padding: '24px', background: 'linear-gradient(135deg, var(--primary) 0%, #4338ca 100%)', color: 'white', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: '700', textTransform: 'uppercase' }}>Submissions (All Time)</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', marginTop: '8px' }}>{stats?.metrics?.totalSubmissions || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Submission Feed */}
      <div className="problem-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ margin: 0 }}>Live Submission Feed</h3>
        </div>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Problem</th>
                <th>Lang</th>
                <th>Verdict</th>
                <th style={{ textAlign: 'right' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentSubmissions?.map((s) => (
                <tr key={s._id}>
                  <td>
                    <div style={{ fontWeight: '600' }}>{s.userId?.name || 'Anonymous'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.userId?.email}</div>
                  </td>
                  <td>{s.problemId?.title || 'Unknown'}</td>
                  <td style={{ textTransform: 'capitalize' }}>{s.language}</td>
                  <td>
                    <span className={`tag ${s.status === 'Success' ? 'difficulty-easy' : (['Fail', 'Error'].includes(s.status) ? 'difficulty-hard' : '')}`}>
                      {s.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(s.createdAt).toLocaleTimeString()}
                  </td>
                </tr>
              )) || <tr><td colSpan="5" className="text-center py-8">No recent activity</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default SystemDashboardPage;
