import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { getSession, initStorage, clearSession } from './utils/storage';
import Login from './pages/Login';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Transactions from './pages/Transactions';
import Users from './pages/Users';

function App() {
  const [session, setSessionState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initStorage();
    const existing = getSession();
    if (existing) setSessionState(existing);
    setLoading(false);
  }, []);

  const handleLogin = (user) => setSessionState(user);

  const handleLogout = () => {
    clearSession();
    setSessionState(null);
  };

  if (loading) return <div>Loading...</div>;
  if (!session) return <Login onLogin={handleLogin} />;

  return (
    <>
      <Header session={session} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/books" element={<Books />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route
          path="/users"
          element={session.role === 'admin' ? <Users /> : <Navigate to="/" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;