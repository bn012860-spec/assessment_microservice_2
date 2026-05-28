import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Code2, AlertCircle, UserPlus } from "lucide-react";
import api, { setAuthToken } from "../api";

function isMongoObjectId(value) {
  return /^[a-fA-F0-9]{24}$/.test(value);
}

const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [collegeId, setCollegeId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const trimmedCollegeId = collegeId.trim();

    if (trimmedCollegeId && !isMongoObjectId(trimmedCollegeId)) {
      setError("College ID must be a valid 24-character Mongo ObjectId.");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name,
        email,
        password,
        role
      };

      if (trimmedCollegeId) {
        payload.collegeId = trimmedCollegeId;
      }

      const res = await api.post("/api/auth/register", payload);
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setAuthToken(token);
      window.dispatchEvent(new Event("auth-change"));
      navigate("/");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.msg ||
        err.message ||
        "Registration failed. Please check your inputs.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container fade-in" style={{ minHeight: 'calc(100vh - 100px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div className="problem-card" style={{ width: '100%', maxWidth: '540px', padding: '48px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <div style={{ padding: '16px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', marginBottom: '24px' }}>
          <Code2 size={32} color="var(--primary)" />
        </div>

        <h2 className="text-center mb-2" style={{ fontSize: '1.75rem' }}>Create Account</h2>
        <p className="text-center text-muted mb-8" style={{ fontSize: '0.95rem' }}>Join the platform to start practicing</p>
        
        {error && (
          <div className="error-box mb-6 w-100 flex-center gap-2" style={{ justifyContent: 'flex-start', width: '100%' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div className="form-group mb-4">
            <label style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              autoComplete="name"
              style={{ padding: '12px 16px' }}
            />
          </div>
          
          <div className="form-group mb-4">
            <label style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
              autoComplete="email"
              style={{ padding: '12px 16px' }}
            />
          </div>
          
          <div className="form-group mb-6">
            <label style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              style={{ padding: '12px 16px' }}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-8" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group mb-0">
              <label style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: '12px 16px' }}>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>
            <div className="form-group mb-0">
              <label style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>College ID (Optional)</label>
              <input
                type="text"
                value={collegeId}
                onChange={(e) => setCollegeId(e.target.value)}
                placeholder="24-char ID"
                style={{ padding: '12px 16px' }}
              />
            </div>
          </div>
          
          <button type="submit" className="button" style={{ width: '100%', padding: '16px', fontSize: '1.05rem', borderRadius: '100px' }} disabled={isLoading}>
            {isLoading ? 'Creating Account...' : (
              <>
                <UserPlus size={20} />
                Create Account
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-8 pt-6 w-100" style={{ width: '100%', borderTop: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
