import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
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
import { setAuthToken } from './api';

function AppContent() {
    const navigate = useNavigate();
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

    const canCreateProblem = user && (user.role === 'admin' || user.role === 'faculty');

    return (
        <>
            <div className="header">
                <h1>Placement Assessment</h1>
                <nav>
                    <Link to="/">All Problems</Link>
                    <span> | <Link to="/assessments">Assessments</Link></span>
                    {canCreateProblem && (
                        <span> | <Link to="/admin/assessments">Manage Assessments</Link></span>
                    )}
                    {canCreateProblem && (
                        <span> | <Link to="/add-problem">Add Problem</Link></span>
                    )}
                    {!user && (
                        <span> | <Link to="/login">Login</Link></span>
                    )}
                    {!user && (
                        <span> | <Link to="/register">Register</Link></span>
                    )}
                    {user && (
                        <span> | <Link to="/my-submissions">My Submissions</Link></span>
                    )}
                    {user && (
                        <span> | <button className="button" onClick={handleLogout}>Logout</button></span>
                    )}
                </nav>
            </div>
            <div className="container">
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

                    <Route path="/problems/:_id" element={<ProblemPage user={user} />} />
                    <Route path="/add-problem" element={<AddProblemPage />} />
                    <Route path="/problems/:_id/edit" element={<EditProblemPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/my-submissions" element={<MySubmissionsPage />} />
                </Routes>
            </div>
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
