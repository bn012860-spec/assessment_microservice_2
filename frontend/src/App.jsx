import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, useLocation } from 'react-router-dom';
import { Code2, BookOpen, Settings, PlusCircle, LogIn, UserPlus, Database, LogOut, LayoutDashboard } from 'lucide-react';
import ProblemListPage from './pages/ProblemListPage';
import AssessmentListPage from './pages/AssessmentListPage';
import AssessmentManagementPage from './pages/AssessmentManagementPage';
import AddAssessmentPage from './pages/AddAssessmentPage';
import EditAssessmentPage from './pages/EditAssessmentPage';
import AssessmentDetailsPage from './pages/AssessmentDetailsPage';
import AssessmentWorkspace from './pages/AssessmentWorkspace';
import AssessmentResultPage from './pages/AssessmentResultPage';
import AssessmentResultsPage from './pages/AssessmentResultsPage';
import AssessmentAttemptDetailPage from './pages/AssessmentAttemptDetailPage';
import ProblemPage from './pages/ProblemPage';
import AddProblemPage from './pages/AddProblemPage';
import EditProblemPage from './pages/EditProblemPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MySubmissionsPage from './pages/MySubmissionsPage';
import SystemDashboardPage from './pages/SystemDashboardPage';
import { setAuthToken } from './api';

function AppContent() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(() => {
        try {
            const raw = localStorage.getItem('user');
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    });

    useEffect(() => {
        const syncAuth = () => {
            try {
                const raw = localStorage.getItem('user');
                const newUser = raw ? JSON.parse(raw) : null;
                
                // If the user was logged in but now isn't (e.g. token expired), 
                // and we are on a protected route, redirect to login.
                if (user && !newUser) {
                    const protectedRoutes = ['/add-problem', '/my-submissions', '/assessments', '/assessment-attempt', '/admin'];
                    if (protectedRoutes.some(path => window.location.pathname.startsWith(path))) {
                        navigate('/login');
                    }
                }
                
                setUser(newUser);
            } catch (e) {
                setUser(null);
            }
        };

        window.addEventListener('auth-change', syncAuth);
        window.addEventListener('storage', (e) => {
            if (e.key === 'user' || e.key === 'token' || e.key === null) {
                syncAuth();
            }
        });

        return () => {
            window.removeEventListener('auth-change', syncAuth);
            window.removeEventListener('storage', syncAuth);
        };
    }, [user, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuthToken(null);
        setUser(null);
        window.dispatchEvent(new Event('auth-change'));
        navigate('/login');
    };

    const canCreateProblem = user && (user.role === 'admin' || user.role === 'faculty' || user.role === 'superadmin');
    const isSuperAdmin = user && user.role === 'superadmin';

    const NavLink = ({ to, children, icon: Icon }) => {
        const isActive = location.pathname === to;
        return (
            <Link to={to} className={isActive ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {Icon && <Icon size={18} />}
                <span>{children}</span>
            </Link>
        );
    };

    return (
        <>
            <div className="header">
                <h1>
                    <Code2 size={28} />
                    <span>Placement Assessment</span>
                </h1>
                <nav>
                    <NavLink to="/" icon={BookOpen}>Problems</NavLink>
                    <NavLink to="/assessments" icon={LayoutDashboard}>Assessments</NavLink>
                    {canCreateProblem && (
                        <NavLink to="/admin/assessments" icon={Settings}>Manage</NavLink>
                    )}
                    {isSuperAdmin && (
                        <NavLink to="/admin/system" icon={Database}>System</NavLink>
                    )}
                    {canCreateProblem && (
                        <NavLink to="/add-problem" icon={PlusCircle}>Add Problem</NavLink>
                    )}
                    {!user && (
                        <NavLink to="/login" icon={LogIn}>Login</NavLink>
                    )}
                    {!user && (
                        <NavLink to="/register" icon={UserPlus}>Register</NavLink>
                    )}
                    {user && (
                        <NavLink to="/my-submissions" icon={Code2}>My Submissions</NavLink>
                    )}
                    {user && (
                        <button className="button button-outline" onClick={handleLogout} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                            <LogOut size={16} />
                            Logout
                        </button>
                    )}
                </nav>
            </div>
            <Routes>
                <Route path="/" element={<ProblemListPage user={user} />} />
                <Route path="/assessments" element={<AssessmentListPage user={user} />} />
                <Route path="/assessments/:id" element={<AssessmentDetailsPage user={user} />} />
                <Route path="/assessment-attempt/:attemptId" element={<AssessmentWorkspace user={user} />} />
                <Route path="/assessment-attempt/:attemptId/result" element={<AssessmentResultPage user={user} />} />
                
                {/* Admin/Faculty Routes */}
                <Route path="/admin/assessments" element={<AssessmentManagementPage />} />
                <Route path="/admin/assessments/add" element={<AddAssessmentPage />} />
                <Route path="/admin/assessments/:id/edit" element={<EditAssessmentPage />} />
                <Route path="/admin/assessments/:id/results" element={<AssessmentResultsPage />} />
                <Route path="/admin/assessment-attempt/:attemptId" element={<AssessmentAttemptDetailPage />} />
                <Route path="/admin/system" element={<SystemDashboardPage />} />

                <Route path="/problems/:_id" element={<ProblemPage user={user} />} />
                <Route path="/add-problem" element={<AddProblemPage />} />
                <Route path="/problems/:_id/edit" element={<EditProblemPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/my-submissions" element={<MySubmissionsPage />} />
            </Routes>
        </>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
