
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET ALL BOOKS
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM books ORDER BY title ASC'
    );

    res.json(rows);
  } catch (err) {
    console.error('Error fetching books:', err.message);

    res.status(500).json({
      error: 'Failed to fetch books'
    });
  }
});

// GET ONE BOOK BY ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM books WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Book not found'
      });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching book:', err.message);

    res.status(500).json({
      error: 'Failed to fetch book'
    });
  }
});

// ADD A NEW BOOK
router.post('/', async (req, res) => {
  try {
    const { title, author, genre, isbn, quantity } = req.body;

    const id =
      'b' + Date.now() + Math.random().toString(36).slice(2, 8);

    console.log('Generated book ID:', id);

    await db.query(
      `INSERT INTO books
       (id, title, author, genre, isbn, quantity)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, title, author, genre || null, isbn || null, quantity ?? 0]
    );

    res.status(201).json({
      message: 'Book added successfully',
      id
    });
  } catch (err) {
    console.error('Add book error:', err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE AN EXISTING BOOK
router.put('/:id', async (req, res) => {
  try {
    const { title, author, genre, isbn, quantity } = req.body;

    if (
      typeof title !== 'string' ||
      !title.trim() ||
      typeof author !== 'string' ||
      !author.trim()
    ) {
      return res.status(400).json({
        error: 'Title and author are required'
      });
    }

    const qty = Number(quantity ?? 0);

    if (!Number.isInteger(qty) || qty < 0) {
      return res.status(400).json({
        error: 'Quantity must be a non-negative whole number'
      });
    }

    const [result] = await db.query(
      `UPDATE books
       SET title = ?, author = ?, genre = ?, isbn = ?, quantity = ?
       WHERE id = ?`,
      [
        title.trim(),
        author.trim(),
        genre || null,
        isbn || null,
        qty,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      const [existing] = await db.query(
        'SELECT id FROM books WHERE id = ?',
        [req.params.id]
      );

      if (existing.length === 0) {
        return res.status(404).json({
          error: 'Book not found'
        });
      }
    }

    const [rows] = await db.query(
      'SELECT * FROM books WHERE id = ?',
      [req.params.id]
    );

    res.json({
      message: 'Book updated successfully',
      book: rows[0]
    });
  } catch (err) {
    console.error('Error updating book:', err.message);

    res.status(500).json({
      error: 'Failed to update book'
    });
  }
});

// DELETE A BOOK
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM books WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Book not found'
      });
    }

    res.json({
      message: 'Book deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting book:', err.message);

    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        error: 'This book has related transactions and cannot be deleted'
      });
    }

    res.status(500).json({
      error: 'Failed to delete book'
    });
  }
});

module.exports = router;
