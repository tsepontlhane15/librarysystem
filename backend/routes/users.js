
const express = require('express');
const router = express.Router();
const db = require('../db');

// Generate a unique string ID
function generateUserId() {
  return 'u' + Date.now() + Math.random().toString(36).slice(2, 8);
}

// GET ALL USERS
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, membershipId, role FROM users ORDER BY name ASC'
    );

    res.json(rows);
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { membershipId, password } = req.body;

    if (!membershipId || !password) {
      return res.status(400).json({
        error: 'Membership ID and password are required'
      });
    }

    const [rows] = await db.query(
      `SELECT id, name, membershipId, role
       FROM users
       WHERE membershipId = ? AND password = ?`,
      [membershipId, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid Membership ID or password'
      });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
});


 // ADD USER
router.post('/', async (req, res) => {
  try {
    const { name, membershipId, role, password } = req.body;

    // Check required fields
    if (
      typeof name !== 'string' || !name.trim() ||
      typeof membershipId !== 'string' || !membershipId.trim() ||
      typeof password !== 'string' || !password.trim()
    ) {
      return res.status(400).json({
        error: 'Name, Membership ID and password are required'
      });
    }

    // Validate role
    const userRole = role || 'member';
    const allowedRoles = ['admin', 'librarian', 'member'];

    if (!allowedRoles.includes(userRole)) {
      return res.status(400).json({
        error: 'Invalid user role'
      });
    }

    // Generate the user ID automatically
    const id = generateUserId();

    // Insert the new user into MySQL
    await db.query(
      `INSERT INTO users (id, name, membershipId, role, password)
       VALUES (?, ?, ?, ?, ?)`,
      [
        id,
        name.trim(),
        membershipId.trim(),
        userRole,
        password
      ]
    );

    // Send a successful response
    res.status(201).json({
      id,
      name: name.trim(),
      membershipId: membershipId.trim(),
      role: userRole
    });

  } catch (err) {
    console.error('Error adding user:', err);

    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: 'Membership ID already exists'
      });
    }

    res.status(500).json({
      error: 'Failed to add user'
    });
  }
});

// UPDATE USER
router.put('/:id', async (req, res) => {
  try {
    const { name, membershipId, role, password } = req.body;

    if (
      typeof name !== 'string' ||
      !name.trim() ||
      typeof membershipId !== 'string' ||
      !membershipId.trim()
    ) {
      return res.status(400).json({
        error: 'Name and membership ID are required'
      });
    }

    const allowedRoles = ['admin', 'librarian', 'member'];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid user role' });
    }

    let result;

    if (typeof password === 'string' && password.trim()) {
      [result] = await db.query(
        `UPDATE users
         SET name = ?, membershipId = ?, role = ?, password = ?
         WHERE id = ?`,
        [
          name.trim(),
          membershipId.trim(),
          role,
          password,
          req.params.id
        ]
      );
    } else {
      [result] = await db.query(
        `UPDATE users
         SET name = ?, membershipId = ?, role = ?
         WHERE id = ?`,
        [name.trim(), membershipId.trim(), role, req.params.id]
      );
    }

    if (result.affectedRows === 0) {
      const [existing] = await db.query(
        'SELECT id FROM users WHERE id = ?',
        [req.params.id]
      );

      if (existing.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
    }

    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('Error updating user:', err.message);

    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: 'Membership ID already exists'
      });
    }

    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE USER
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM users WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err.message);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
