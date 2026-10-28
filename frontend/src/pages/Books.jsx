import { useState, useEffect } from 'react';
import {
  getBooks,
  addBook,
  updateBook,
  deleteBook,
} from '../services/api';

function Books() {
  const [books, setBooks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    author: '',
    genre: '',
    isbn: '',
    quantity: '1',
  });

  // Load books from the backend
  const loadBooks = async () => {
    try {
      setError('');
      const data = await getBooks();
      setBooks(data);
    } catch (err) {
      setError(err.message || 'Could not load books.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const resetForm = () => {
    setForm({
      title: '',
      author: '',
      genre: '',
      isbn: '',
      quantity: '1',
    });
    setEditingId(null);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

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

  // Add or update a book in MySQL
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    const quantity = Number(form.quantity);

    if (!Number.isInteger(quantity) || quantity < 0) {
      showToast('Quantity must be a non-negative whole number.', 'error');
      return;
    }

    const bookData = {
      title: form.title.trim(),
      author: form.author.trim(),
      genre: form.genre.trim(),
      isbn: form.isbn.trim(),
      quantity,
    };

    if (
      !bookData.title ||
      !bookData.author ||
      !bookData.genre ||
      !bookData.isbn
    ) {
      showToast('Please complete all fields.', 'error');
      return;
    }

    try {
      setSaving(true);
      setError('');

      if (editingId !== null) {
        await updateBook(editingId, bookData);
        showToast('Book updated successfully', 'success');
      } else {
        await addBook(bookData);
        showToast('Book added successfully', 'success');
      }

      await loadBooks();
      resetForm();
    } catch (err) {
      showToast(err.message || 'Could not save the book.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (book) => {
    setEditingId(book.id);

    setForm({
      title: book.title || '',
      author: book.author || '',
      genre: book.genre || '',
      isbn: book.isbn || '',
      quantity: String(book.quantity ?? 0),
    });
  };

  const handleDelete = async (book) => {
    if (
      !window.confirm(
        `Delete "${book.title}"? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setError('');
      await deleteBook(book.id);
      await loadBooks();
      showToast('Book deleted successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Could not delete the book.', 'error');
    }
  };

  return (
    <main className="main">
      <h2 className="page-title">Book Management</h2>

      {error && (
        <div className="card" role="alert">
          <p>{error}</p>
          <button
            type="button"
            className="btn btn-outline"
            onClick={loadBooks}
          >
            Try Again
          </button>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2>{editingId !== null ? 'Edit Book' : 'Add New Book'}</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                name="title"
                required
                value={form.title}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="author">Author</label>
              <input
                id="author"
                type="text"
                name="author"
                required
                value={form.author}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="genre">Genre</label>
              <input
                id="genre"
                type="text"
                name="genre"
                required
                value={form.genre}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="isbn">ISBN</label>
              <input
                id="isbn"
                type="text"
                name="isbn"
                required
                value={form.isbn}
                onChange={handleChange}
              />
            </div>

            {editingId === null && (
              <div className="form-group">
                <label htmlFor="quantity">Initial Quantity</label>
                <input
                  id="quantity"
                  type="number"
                  name="quantity"
                  required
                  min="0"
                  step="1"
                  value={form.quantity}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving
                ? 'Saving...'
                : editingId !== null
                  ? 'Update Book'
                  : 'Add Book'}
            </button>

            {editingId !== null && (
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
          <h2>All Books</h2>
        </div>

        {loading ? (
          <div className="empty-state">
            <p>Loading books...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="empty-state">
            <p>No books yet. Use the form above to add one.</p>
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
                  <th>Qty</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {books.map((book) => (
                  <tr
                    key={book.id}
                    className={Number(book.quantity) < 2 ? 'low-stock' : ''}
                  >
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.genre}</td>
                    <td>{book.isbn}</td>
                    <td>{book.quantity}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          className="btn btn-warning btn-sm"
                          onClick={() => handleEdit(book)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(book)}
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

export default Books;