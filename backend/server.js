const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./db');

const booksRouter = require('./routes/books');
const usersRouter = require('./routes/users');
const transactionsRouter = require('./routes/transactions');

const app = express();

app.use(cors());
app.use(express.json());

// Test whether the API is running
app.get('/', (req, res) => {
  res.json({ message: 'Library Management API is running' });
});

// Test the database connection
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({
      status: 'OK',
      message: 'API and database are connected'
    });
  } catch (error) {
    console.error('Database connection error:', error.message);
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed'
    });
  }
});

// API routes
app.use('/books', booksRouter);
app.use('/users', usersRouter);
app.use('/transactions', transactionsRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});