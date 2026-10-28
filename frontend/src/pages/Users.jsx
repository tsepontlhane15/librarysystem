
import { useState, useEffect } from 'react';
import {
  getUsers,
  addUser,
  updateUser,
  deleteUser
} from '../services/api';
import { getSession } from '../utils/storage';

function Users() {
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    membershipId: '',
    role: 'member',
    password: ''
  });

  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.background =
      type === 'error'
        ? '#dc2626'
        : type === 'success'
        ? '#16a34a'
        : '#2563eb';

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
  };

  // Load users from MySQL through the backend API
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      showToast(error.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const resetForm = () => {
    setForm({
      name: '',
      membershipId: '',
      role: 'member',
      password: ''
    });
    setEditingId(null);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    const name = form.name.trim();
    const membershipId = form.membershipId.trim();

    if (!name || !membershipId) {
      showToast('Name and Membership ID are required', 'error');
      return;
    }

    if (!editingId && !form.password.trim()) {
      showToast('Please enter a password', 'error');
      return;
    }

    const userData = {
      name,
      membershipId,
      role: form.role
    };

    // Send a password only when creating a user or changing it
    if (form.password.trim()) {
      userData.password = form.password.trim();
    }

    try {
      setSaving(true);

      if (editingId) {
        await updateUser(editingId, userData);
        showToast('User updated successfully', 'success');
      } else {
        await addUser(userData);
        showToast('User added successfully', 'success');
      }

      resetForm();
      await loadUsers();
    } catch (error) {
      showToast(error.message || 'Failed to save user', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setForm({
      name: user.name,
      membershipId: user.membershipId,
      role: user.role || 'member',
      password: ''
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (user) => {
    const session = getSession();

    if (session && String(session.id) === String(user.id)) {
      showToast('You cannot delete your own account', 'error');
      return;
    }

    if (!window.confirm(`Delete user "${user.name}"?`)) {
      return;
    }

    try {
      await deleteUser(user.id);

      setUsers((currentUsers) =>
        currentUsers.filter((u) => u.id !== user.id)
      );

      if (editingId === user.id) {
        resetForm();
      }

      showToast('User deleted successfully', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to delete user', 'error');
    }
  };

  return (
    <main className="main">
      <h2 className="page-title">User Management</h2>

      <div className="card">
        <div className="card-header">
          <h2>{editingId ? 'Edit User' : 'Add New User'}</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Membership ID</label>
              <input
                type="text"
                name="membershipId"
                required
                value={form.membershipId}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Role</label>
              <select
                name="role"
                required
                value={form.role}
                onChange={handleChange}
              >
                <option value="admin">Admin</option>
                <option value="librarian">Librarian</option>
                <option value="member">Member</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                {editingId
                  ? 'New Password (leave blank to keep)'
                  : 'Password'}
              </label>
              <input
                type="password"
                name="password"
                required={!editingId}
                minLength="6"
                placeholder={
                  editingId ? 'Leave blank to keep current password' : 'Set a password'
                }
                value={form.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving
                ? 'Saving...'
                : editingId
                ? 'Update User'
                : 'Add User'}
            </button>

            {editingId && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>All Users</h2>
        </div>

        {loading ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <p>No users found in the database.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Membership ID</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.membershipId}</td>
                    <td>
                      <span
                        className={`badge ${
                          user.role === 'admin'
                            ? 'badge-danger'
                            : user.role === 'librarian'
                            ? 'badge-info'
                            : 'badge-success'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.4rem'
                        }}
                      >
                        <button
                          type="button"
                          className="btn btn-warning btn-sm"
                          onClick={() => handleEdit(user)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(user)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

export default Users;
