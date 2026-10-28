import { NavLink } from 'react-router-dom';

function Header({ session, onLogout }) {
  return (
    <header className="header">
      <h1>📚 Community Library</h1>
      <div className="header-right">
        <nav className="nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/books"
            className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
          >
            Books
          </NavLink>
          <NavLink
            to="/transactions"
            className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
          >
            Transactions
          </NavLink>
          {session.role === 'admin' && (
            <NavLink
              to="/users"
              className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
            >
              Users
            </NavLink>
          )}
        </nav>
        <span className="user-info">
          {session.name} ({session.role})
        </span>
        <button
          className="btn btn-outline btn-sm"
          style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;