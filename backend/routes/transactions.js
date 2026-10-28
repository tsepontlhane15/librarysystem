
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all transactions
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM transactions ORDER BY date DESC'
    );

    res.json(rows);
  } catch (err) {
    console.error('Fetch transactions error:', err.message);
    res.status(500).json({ error: 'Failed to fetch transactions.' });
  }
});

// ADD transaction and update book stock together
router.post('/', async (req, res) => {
  const { bookId, type, quantity, note, performedBy } = req.body;

  const amount = Number(quantity);

  if (!bookId || !['add', 'borrow'].includes(type)) {
    return res.status(400).json({
      error: 'A book ID and a valid transaction type are required.'
    });
  }

  if (!Number.isInteger(amount) || amount <= 0) {
    return res.status(400).json({
      error: 'Quantity must be a positive whole number.'
    });
  }

  if (!performedBy) {
    return res.status(400).json({
      error: 'The person performing the transaction is required.'
    });
  }

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Lock the selected book while its stock is being updated.
    const [books] = await connection.query(
      'SELECT id, title, quantity FROM books WHERE id = ? FOR UPDATE',
      [bookId]
    );

    if (books.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Book not found.' });
    }

    const book = books[0];
    const currentQuantity = Number(book.quantity ?? 0);

    if (type === 'borrow' && currentQuantity < amount) {
      await connection.rollback();
      return res.status(400).json({
        error: 'Not enough stock available.'
      });
    }

    if (type === 'add') {
      await connection.query(
        'UPDATE books SET quantity = quantity + ? WHERE id = ?',
        [amount, bookId]
      );
    } else {
      await connection.query(
        'UPDATE books SET quantity = quantity - ? WHERE id = ?',
        [amount, bookId]
      );
    }

    // Generate an ID compatible with a VARCHAR ID column.
    const id = `t${Date.now()}${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    await connection.query(
      `INSERT INTO transactions
       (id, bookId, bookTitle, type, quantity, note, performedBy)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        book.id,
        book.title,
        type,
        amount,
        note?.trim() || '',
        performedBy
      ]
    );

    await connection.commit();

    res.status(201).json({
      id,
      bookId: book.id,
      bookTitle: book.title,
      type,
      quantity: amount,
      note: note?.trim() || '',
      performedBy,
      message: 'Transaction recorded successfully.'
    });
  } catch (err) {
    if (connection) {
      await connection.rollback();
    }

    console.error('Create transaction error:', err.message);
    res.status(500).json({
      error: 'Failed to record transaction.'
    });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
