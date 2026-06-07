import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, Users, CheckCircle, Clock, AlertCircle, Search, RefreshCw, BarChart3, ChevronRight, FileSpreadsheet, MonitorOff, Copy, ClipboardPaste, Maximize } from 'lucide-react';
import * as XLSX from 'xlsx';
import { assessments } from '../api';

const AssessmentResultsPage = () => {
  const { id } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const [assessmentRes, attendanceRes] = await Promise.all([
        assessments.get(id),
        assessments.getAttendance(id)
      ]);
      setAssessment(assessmentRes.data);
      setAttendance(attendanceRes.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch results');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(interval);
  }, [id]);

  const exportToExcel = () => {
    const data = attendance.map(a => {
      const timeUsed = a.submittedAt && a.startedAt
        ? Math.floor((new Date(a.submittedAt) - new Date(a.startedAt)) / 60000)
        : 'N/A';
      return {
        'Student Name': a.name,
        'Email': a.email,
        'Status': a.status,
        'Score': a.score,
        'Tab Switches': a.tabSwitchCount || 0,
        'Copy Events': a.copyCount || 0,
        'Paste Events': a.pasteCount || 0,
        'Fullscreen Exits': a.fullscreenExitCount || 0,
        'Started At': a.startedAt ? new Date(a.startedAt).toLocaleString() : 'N/A',
        'Submitted At': a.submittedAt ? new Date(a.submittedAt).toLocaleString() : 'N/A',
        'Time Used (min)': timeUsed
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Assessment Results");
    
    // Auto-size columns
    const maxWidths = Object.keys(data[0] || {}).map(key => ({
      wch: Math.max(key.length, ...data.map(obj => String(obj[key]).length)) + 2
    }));
    ws['!cols'] = maxWidths;

    XLSX.writeFile(wb, `${assessment.title.replace(/\s+/g, '_')}_Results.xlsx`);
  };

  if (loading && !assessment) return <div className="container">Loading results dashboard...</div>;
  if (error) return <div className="container error-box">{error}</div>;

  const filteredAttendance = attendance.filter(a => {
    const name = a.name || '';
    const email = a.email || '';
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === '' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: attendance.length,
    started: attendance.filter(a => a.status !== 'Not Started').length,
    submitted: attendance.filter(a => a.status === 'Submitted' || a.status === 'TimedOut').length,
    avgScore: attendance.filter(a => a.status !== 'Not Started').length > 0 
      ? (attendance.reduce((acc, a) => acc + (a.score || 0), 0) / attendance.filter(a => a.status !== 'Not Started').length).toFixed(1) 
      : 0
  };

  const getStatusTagClass = (status) => {
    switch (status) {
      case 'Submitted': return 'difficulty-easy';
      case 'Active': return 'difficulty-medium';
      case 'TimedOut': return 'difficulty-hard';
      case 'Not Started': return '';
      default: return '';
    }
  };

  return (
    <div className="container fade-in">
      <div className="flex-between mb-8">
        <div>
          <div className="flex-center gap-2 mb-2" style={{ justifyContent: 'flex-start' }}>
            <span className="tag" style={{ background: 'var(--primary-glow)', color: 'var(--primary)', fontWeight: '700' }}>LIVE MONITORING</span>
            <h1 style={{ margin: 0 }}>{assessment.title}</h1>
          </div>
          <p className="text-muted">Real-time attendance and performance tracking.</p>
        </div>
        <div className="flex-center gap-3">
          <button className="button button-outline" onClick={() => fetchData(true)} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
            Refresh
          </button>
          <button className="button button-primary" onClick={exportToExcel}>
            <FileSpreadsheet size={16} />
            Export to Excel
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-6 mb-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="problem-card" style={{ textAlign: 'center' }}>
          <div className="text-muted mb-2 flex-center gap-2" style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '700' }}>
            <Users size={14} /> Total Candidates
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800' }}>{stats.total}</div>
        </div>
        <div className="problem-card" style={{ textAlign: 'center' }}>
          <div className="text-muted mb-2 flex-center gap-2" style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '700' }}>
            <Clock size={14} /> Participation
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>
            {stats.started} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ {stats.total}</span>
          </div>
        </div>
        <div className="problem-card" style={{ textAlign: 'center' }}>
          <div className="text-muted mb-2 flex-center gap-2" style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '700' }}>
            <CheckCircle size={14} /> Submissions
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--success)' }}>{stats.submitted}</div>
        </div>
        <div className="problem-card" style={{ textAlign: 'center' }}>
          <div className="text-muted mb-2 flex-center gap-2" style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '700' }}>
            <BarChart3 size={14} /> Avg. Score
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800' }}>{stats.avgScore}</div>
        </div>
      </div>

      {/* Live Attendance Table */}
      <div className="problem-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '20px', alignItems: 'center', background: 'var(--surface-hover)' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search students..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '40px', background: 'var(--bg)' }}
            />
          </div>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '200px', background: 'var(--bg)' }}
          >
            <option value="">All Statuses</option>
            <option value="Not Started">Not Started</option>
            <option value="Active">Active</option>
            <option value="Submitted">Submitted</option>
            <option value="TimedOut">Timed Out</option>
          </select>
        </div>

        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Status</th>
                <th>Score</th>
                <th>Security Metrics</th>
                <th>Timeline</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map((a) => (
                <tr key={a.studentId}>
                  <td>
                    <div style={{ fontWeight: '600' }}>{a.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.email}</div>
                  </td>
                  <td>
                    <span className={`tag ${getStatusTagClass(a.status)}`} style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: '700' }}>
                      {a.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: a.score > 0 ? 'var(--text)' : 'var(--text-muted)' }}>
                      {a.score}
                    </div>
                  </td>
                  <td>
                    <div className="flex-center gap-3" style={{ justifyContent: 'flex-start' }}>
                      <div className="flex-center gap-1" title="Tab Switches" style={{ color: a.tabSwitchCount > 5 ? 'var(--error)' : 'inherit' }}>
                        <MonitorOff size={14} /> <span style={{ fontSize: '0.85rem' }}>{a.tabSwitchCount}</span>
                      </div>
                      <div className="flex-center gap-1" title="Copies" style={{ color: a.copyCount > 10 ? 'var(--warning)' : 'inherit' }}>
                        <Copy size={14} /> <span style={{ fontSize: '0.85rem' }}>{a.copyCount}</span>
                      </div>
                      <div className="flex-center gap-1" title="Pastes" style={{ color: a.pasteCount > 5 ? 'var(--error)' : 'inherit' }}>
                        <ClipboardPaste size={14} /> <span style={{ fontSize: '0.85rem' }}>{a.pasteCount}</span>
                      </div>
                      <div className="flex-center gap-1" title="Fullscreen Exits" style={{ color: a.fullscreenExitCount > 0 ? 'var(--error)' : 'inherit' }}>
                        <Maximize size={14} /> <span style={{ fontSize: '0.85rem' }}>{a.fullscreenExitCount}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {a.startedAt ? (
                        <div className="flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
                          <Clock size={12} /> {new Date(a.startedAt).toLocaleTimeString()} 
                          {a.submittedAt && (
                            <>
                              <ChevronRight size={12} /> 
                              {new Date(a.submittedAt).toLocaleTimeString()}
                            </>
                          )}
                        </div>
                      ) : '—'}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {a.attemptId ? (
                      <Link to={`/admin/assessment-attempt/${a.attemptId}`} className="button button-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                        View Detailed Results
                      </Link>
                    ) : (
                      <span className="text-muted" style={{ fontSize: '0.8rem' }}>No attempt yet</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredAttendance.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                    No students match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssessmentResultsPage;
