import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Users, Upload, CheckCircle, AlertCircle, Trash2, UserPlus, FileText, Download, Search, Key, Shield, User as UserIcon, Filter, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { admin } from '../api';

const UserManagementPage = () => {
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'bulk'
  const [usersJson, setUsersJson] = useState('');
  const [defaultPassword, setDefaultPassword] = useState('Student@2026');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // List users state
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await admin.listUsers({ search, role: roleFilter, page });
      setUsers(res.data.users);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, page]);

  useEffect(() => {
    if (activeTab === 'list') {
      fetchUsers();
    }
  }, [activeTab, fetchUsers]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        
        // Assume first row is header: Name, Email
        const processedUsers = data.slice(1).map(row => {
          if (row.length >= 2 && row[1]) {
            return { 
              name: String(row[0] || 'Unknown').trim(), 
              email: String(row[1]).trim().toLowerCase() 
            };
          }
          return null;
        }).filter(u => u && u.email && u.email.includes('@'));

        if (processedUsers.length === 0) {
          throw new Error('No valid student data found. Ensure Column A is Name and Column B is Email.');
        }

        setUsersJson(JSON.stringify(processedUsers, null, 2));
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to parse file: ' + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleBulkImport = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      let usersToImport;
      try {
        usersToImport = JSON.parse(usersJson);
      } catch {
        const lines = usersJson.split('\n').filter(line => line.trim());
        usersToImport = lines.map(line => {
          const parts = line.split(',').map(p => p.trim());
          if (parts.length >= 2) {
            return { name: parts[0], email: parts[1] };
          }
          return null;
        }).filter(u => u !== null);
      }

      if (!Array.isArray(usersToImport) || usersToImport.length === 0) {
        throw new Error('No valid user data found. Please check the format.');
      }

      const res = await admin.bulkImportStudents({
        users: usersToImport,
        defaultPassword
      });

      setResults(res.data);
      setUsersJson('');
    } catch (err) {
      console.error('Import failed', err);
      setError(err.response?.data?.error || err.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId, userName) => {
    const newPass = prompt(`Enter new password for ${userName}:`, 'Student@2026');
    if (!newPass) return;

    try {
      await admin.resetPassword(userId, newPass);
      alert('Password reset successfully');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to reset password');
    }
  };

  const downloadSample = () => {
    const sampleData = [
      ["Name", "Email"],
      ["John Doe", "john@college.edu"],
      ["Jane Smith", "jane@college.edu"]
    ];
    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "student_import_sample.xlsx");
  };

  const exportAllUsers = () => {
    const data = users.map(u => ({
      ID: u.id,
      Name: u.name,
      Email: u.email,
      Role: u.role
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "platform_users.xlsx");
  };

  return (
    <div className="container fade-in">
      <div className="flex-between mb-8">
        <div>
          <h1 className="mb-2">User Management</h1>
          <p className="text-muted">Manage platform access and onboard students.</p>
        </div>
        <div className="flex-center gap-3">
          <button 
            className={`button ${activeTab === 'list' ? 'button-primary' : 'button-outline'}`}
            onClick={() => setActiveTab('list')}
          >
            <Users size={18} /> User List
          </button>
          <button 
            className={`button ${activeTab === 'bulk' ? 'button-primary' : 'button-outline'}`}
            onClick={() => setActiveTab('bulk')}
          >
            <Upload size={18} /> Bulk Import
          </button>
        </div>
      </div>

      {activeTab === 'list' && (
        <div className="fade-in">
          {/* Filters */}
          <div className="responsive-flex mb-6" style={{ background: 'var(--surface)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                style={{ paddingLeft: '40px', background: 'var(--bg)', width: '100%' }}
              />
            </div>
            <div className="flex-center gap-3">
              <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} style={{ width: '180px', background: 'var(--bg)' }}>
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
              <button className="button button-outline" onClick={exportAllUsers}>
                <Download size={16} /> Export Excel
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name & Email</th>
                  <th>Role</th>
                  <th>ID</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ fontWeight: '600' }}>{user.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
                    </td>
                    <td>
                      <span className={`tag ${user.role === 'admin' ? 'difficulty-hard' : (user.role === 'faculty' ? 'difficulty-medium' : '')}`} style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{user.id}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="button button-outline" 
                        onClick={() => handleResetPassword(user.id, user.name)}
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        <Key size={14} /> Reset Password
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && !loading && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex-center gap-4 mt-8">
              <button 
                className="button button-outline" 
                disabled={page === 1} 
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <span className="text-muted">Page {page} of {totalPages}</span>
              <button 
                className="button button-outline" 
                disabled={page === totalPages} 
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'bulk' && (
        <div className="grid-2-col fade-in">
          {/* Import Form */}
          <div className="problem-card">
            <h3 className="mb-6 flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
              <UserPlus size={22} color="var(--primary)" /> Import Students
            </h3>

            <div className="mb-8 p-8" style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', border: '2px dashed var(--border)', textAlign: 'center' }}>
              <FileSpreadsheet size={48} className="text-muted mb-4" style={{ margin: '0 auto' }} />
              <h4 className="mb-2">Upload Spreadsheet</h4>
              <p className="text-muted mb-6" style={{ fontSize: '0.9rem' }}>Upload .xlsx or .csv (Column A: Name, Column B: Email)</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".xlsx, .xls, .csv" 
                style={{ display: 'none' }} 
              />
              <button 
                type="button" 
                className="button button-primary" 
                onClick={() => fileInputRef.current.click()}
              >
                <Upload size={18} /> Select File
              </button>
            </div>
            
            <form onSubmit={handleBulkImport}>
              <div className="form-group mb-6">
                <label className="label">Default Password for All</label>
                <input 
                  type="text" 
                  className="input" 
                  value={defaultPassword}
                  onChange={(e) => setDefaultPassword(e.target.value)}
                  placeholder="e.g. Student@2026"
                  required
                />
                <p className="form-hint">
                  Students will use this as their initial login password.
                </p>
              </div>

              <div className="form-group mb-6">
                <div className="flex-between mb-2">
                  <label className="label" style={{ margin: 0 }}>Review Data (JSON)</label>
                  <button type="button" onClick={downloadSample} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Download size={14} /> Download Excel Template
                  </button>
                </div>
                <textarea 
                  className="input" 
                  style={{ minHeight: '250px', fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)', fontSize: '0.9rem', lineHeight: '1.5' }}
                  value={usersJson}
                  onChange={(e) => setUsersJson(e.target.value)}
                  placeholder={`PASTE JSON:
[
  {"name": "John Doe", "email": "john@college.edu"},
  ...
]

OR UPLOAD EXCEL FILE ABOVE`}
                  required
                />
              </div>

              {error && (
                <div className="error-box mb-6 flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
                  <AlertCircle size={18} /> {error}
                </div>
              )}

              <button type="submit" className="button button-primary w-full" disabled={loading} style={{ height: '48px', fontSize: '1rem' }}>
                {loading ? 'Processing Import...' : 'Start Bulk Onboarding'}
              </button>
            </form>
          </div>

          {/* Instructions & Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="problem-card">
              <h4 className="mb-4">Onboarding Instructions</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="flex-center gap-3" style={{ justifyContent: 'flex-start' }}>
                  <div style={{ background: 'var(--primary-glow)', color: 'var(--primary)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.9rem' }}>1</div>
                  <p className="text-secondary" style={{ fontSize: '0.9rem', margin: 0 }}>Upload an Excel file or paste a JSON student list.</p>
                </div>
                <div className="flex-center gap-3" style={{ justifyContent: 'flex-start' }}>
                  <div style={{ background: 'var(--primary-glow)', color: 'var(--primary)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.9rem' }}>2</div>
                  <p className="text-secondary" style={{ fontSize: '0.9rem', margin: 0 }}>Review the data in the text area before starting.</p>
                </div>
                <div className="flex-center gap-3" style={{ justifyContent: 'flex-start' }}>
                  <div style={{ background: 'var(--primary-glow)', color: 'var(--primary)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.9rem' }}>3</div>
                  <p className="text-secondary" style={{ fontSize: '0.9rem', margin: 0 }}>Duplicates will be skipped automatically.</p>
                </div>
              </div>
            </div>

            {results && (
              <div className="problem-card fade-in" style={{ borderColor: 'var(--success)', background: 'rgba(16, 185, 129, 0.02)' }}>
                <h4 className="mb-6 flex-center gap-2" style={{ justifyContent: 'flex-start', color: 'var(--success)' }}>
                  <CheckCircle size={20} /> Import Results
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--success)' }}>{results.count}</div>
                    <div className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Imported</div>
                  </div>
                  <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: results.errors.length > 0 ? 'var(--error)' : 'var(--text-muted)' }}>{results.errors.length}</div>
                    <div className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Skipped</div>
                  </div>
                </div>

                {results.errors.length > 0 && (
                  <div>
                    <h5 className="mb-3 text-muted" style={{ fontSize: '0.85rem', textTransform: 'uppercase' }}>Details on Skipped Users:</h5>
                    <div style={{ maxHeight: '250px', overflowY: 'auto', background: 'var(--bg)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                      {results.errors.map((err, i) => (
                        <div key={i} className="mb-2 pb-2 flex-between" style={{ fontSize: '0.85rem', borderBottom: i < results.errors.length - 1 ? '1px solid var(--border)' : 'none' }}>
                          <span style={{ fontWeight: '600' }}>{err.email}</span>
                          <span className="tag" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: 'none' }}>{err.error}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      <style>{`
        .w-full { width: 100%; }
        .label { display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-secondary); font-size: 0.95rem; }
        .input { width: 100%; background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text); padding: 12px 16px; }
        .input:focus { border-color: var(--primary); outline: none; }
      `}</style>
    </div>
  );
};

export default UserManagementPage;
