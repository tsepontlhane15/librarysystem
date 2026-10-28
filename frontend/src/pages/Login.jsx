import { useState } from 'react';
import { loginUser } from '../services/api';
import { setSession } from '../utils/storage';

function Login({ onLogin }) {
  const [membershipId, setMembershipId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check the credentials against the MySQL database
      const user = await loginUser({
        membershipId: membershipId.trim(),
        password
      });

      // Store only the user's session details
      const sessionUser = {
        id: user.id,
        name: user.name,
        membershipId: user.membershipId,
        role: user.role
      };

      setSession(sessionUser);
      onLogin(sessionUser);
    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Cannot connect to the server. Please check that the backend is running.'
          : err.message || 'Invalid Membership ID or password'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>📚 Ha-Teko Community Library</h1>
        <p className="subtitle">Library Management System</p>

        {error && (
          <div className="login-error" style={{ display: 'block' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="membershipId">Membership ID</label>
            <input
              id="membershipId"
              type="text"
              name="membershipId"
              required
              placeholder="Membership ID"
              autoComplete="username"
              value={membershipId}
              onChange={(e) => setMembershipId(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              required
              placeholder="Enter password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;