
import { useState, useEffect } from 'react';
import {
  getBooks,
  getTransactions,
  addTransaction
} from '../services/api';
import { getSession } from '../utils/storage';

function Transactions() {
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    bookId: '',
    type: 'add',
    quantity: '1',
    note: ''
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

  // Load books and transaction history from MySQL through the API
  const loadData = async () => {
    try {
      setLoading(true);

      const [booksData, transactionsData] = await Promise.all([
        getBooks(),
        getTransactions()
      ]);

      setBooks(booksData);
      setTransactions(transactionsData);
    } catch (error) {
      showToast(error.message || 'Could not load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    const qty = Number(form.quantity);

    if (!Number.isInteger(qty) || qty <= 0) {
      showToast('Quantity must be a positive whole number', 'error');
      return;
    }

    const selectedBook = books.find(
      (book) => book.id === form.bookId
    );

    if (!selectedBook) {
      showToast('Please select a valid book', 'error');
      return;
    }

    if (form.type === 'borrow' && Number(selectedBook.quantity) < qty) {
      showToast('Not enough stock available', 'error');
      return;
    }

    const session = getSession();

    try {
      setSaving(true);

      await addTransaction({
        bookId: form.bookId,
        bookTitle: selectedBook.title,
        type: form.type,
        quantity: qty,
        note: form.note.trim(),
        performedBy: session?.name || 'System'
      });

      showToast('Transaction recorded successfully', 'success');

      setForm({
        bookId: '',
        type: 'add',
        quantity: '1',
        note: ''
      });

      // Get the latest stock and transaction history from the database
      await loadData();
    } catch (error) {
      showToast(error.message || 'Could not record transaction', 'error');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '—';

    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime())
      ? date
      : parsedDate.toLocaleString();
  };

  if (loading) {
    return (
      <main className="main">
        <h2 className="page-title">Stock Transactions</h2>
        <p>Loading books and transactions...</p>
      </main>
    );
  }

  return (
    <main className="main">
      <h2 className="page-title">Stock Transactions</h2>

      <div className="card">
        <div className="card-header">
          <h2>Record Transaction</h2>
        </div>

        {books.length === 0 ? (
          <div className="empty-state">
            <p>Add books first before recording transactions.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Select Book</label>
                <select
                  name="bookId"
                  required
                  value={form.bookId}
                  onChange={handleChange}
                >
                  <option value="">-- Choose a book --</option>

                  {books.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title} (Current stock: {book.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Transaction Type</label>
                <select
                  name="type"
                  required
                  value={form.type}
                  onChange={handleChange}
                >
                  <option value="add">Add Stock (New arrivals)</option>
                  <option value="borrow">Deduct Stock (Borrowed)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  required
                  min="1"
                  step="1"
                  value={form.quantity}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Note (optional)</label>
                <input
                  type="text"
                  name="note"
                  maxLength="255"
                  placeholder="e.g. Received from supplier / Borrowed by John"
                  value={form.note}
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
                {saving ? 'Recording...' : 'Record Transaction'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Transaction History</h2>
        </div>

        {transactions.length === 0 ? (
          <div className="empty-state">
            <p>No transactions recorded yet.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Book</th>
                  <th>Type</th>
                  <th>Qty</th>
                  <th>Note</th>
                  <th>By</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>{formatDate(tx.date)}</td>
                    <td>{tx.bookTitle}</td>
                    <td>
                      <span
                        className={`badge ${
                          tx.type === 'add'
                            ? 'badge-success'
                            : 'badge-info'
                        }`}
                      >
                        {tx.type === 'add' ? 'Add Stock' : 'Borrowed'}
                      </span>
                    </td>
                    <td>{tx.quantity}</td>
                    <td>{tx.note || '—'}</td>
                    <td>{tx.performedBy || 'System'}</td>
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

export default Transactions;
