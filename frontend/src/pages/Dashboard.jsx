import { useState, useEffect } from 'react';
import { getBooks, getTransactions } from '../services/api';

function Dashboard() {
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setError('');

        const [booksData, transactionsData] = await Promise.all([
          getBooks(),
          getTransactions()
        ]);

        setBooks(booksData);
        setTransactions(transactionsData);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const totalBooks = books.length;

  const totalCopies = books.reduce(
    (sum, book) => sum + Number(book.quantity || 0),
    0
  );

  const lowStock = books.filter(
    (book) => Number(book.quantity || 0) < 2
  ).length;

  const recentTx = transactions.slice(0, 5);

  const formatDate = (date) => {
    if (!date) return 'Date unavailable';

    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime())
      ? 'Date unavailable'
      : parsedDate.toLocaleString();
  };

  if (loading) {
    return (
      <main className="main">
        <h2 className="page-title">Dashboard</h2>
        <div className="card">
          <p>Loading dashboard data...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="main">
        <h2 className="page-title">Dashboard</h2>
        <div className="card">
          <p className="login-error">{error}</p>
          <p>
            Check that the backend is running and that the books
            and transactions API routes are working.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="main">
      <h2 className="page-title">Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="value">{totalBooks}</div>
          <div className="label">Unique Titles</div>
        </div>

        <div className="stat-card">
          <div className="value">{totalCopies}</div>
          <div className="label">Total Copies</div>
        </div>

        <div className="stat-card">
          <div className="value">{lowStock}</div>
          <div className="label">Low Stock Items</div>
        </div>

        <div className="stat-card">
          <div className="value">{transactions.length}</div>
          <div className="label">Transactions</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Book Availability</h2>
        </div>

        {books.length === 0 ? (
          <div className="empty-state">
            <p>No books in the library yet. Add some from the Books page.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Genre</th>
                  <th>ISBN</th>
                  <th>Quantity</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {books.map((book) => {
                  const quantity = Number(book.quantity || 0);
                  const isLow = quantity < 2;

                  return (
                    <tr
                      key={book.id}
                      className={isLow ? 'low-stock' : ''}
                    >
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.genre || '-'}</td>
                      <td>{book.isbn || '-'}</td>
                      <td>{quantity}</td>
                      <td>
                        {quantity === 0 ? (
                          <span className="badge badge-danger">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="badge badge-warning">
                            Low Stock
                          </span>
                        ) : (
                          <span className="badge badge-success">
                            Available
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Recent Transactions</h2>
        </div>

        {recentTx.length === 0 ? (
          <div className="empty-state">
            <p>No transactions yet.</p>
          </div>
        ) : (
          recentTx.map((tx) => (
            <div key={tx.id} className="transaction-item">
              <div>
                <strong>{tx.bookTitle}</strong>
                {` — ${tx.type === 'add' ? 'Added' : 'Borrowed'} ${tx.quantity} copy(ies)`}

                {tx.note && (
                  <span
                    style={{
                      color: '#a3a3a3',
                      fontSize: '0.8rem'
                    }}
                  >
                    {' '}({tx.note})
                  </span>
                )}
              </div>

              <span
                style={{
                  color: '#a3a3a3',
                  fontSize: '0.8rem'
                }}
              >
                {formatDate(tx.date)}
              </span>
            </div>
          ))
        )}
      </div>
    </main>
  );
}

export default Dashboard;