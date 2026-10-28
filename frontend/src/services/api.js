
const API_URL = 'http://localhost:5000';

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  const data = await response.json().catch(() => ({}));

if (!response.ok) {
  console.error('API error:', response.status, data);
  throw new Error(
    data.error || data.message || `Request failed (${response.status})`
  );
}

  return data;
}

// BOOKS
export const getBooks = () => request('/books');

export const addBook = (book) =>
  request('/books', {
    method: 'POST',
    body: JSON.stringify(book)
  });

export const updateBook = (id, book) =>
  request(`/books/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(book)
  });

export const deleteBook = (id) =>
  request(`/books/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });

// TRANSACTIONS
export const getTransactions = () => request('/transactions');

export const addTransaction = (transaction) =>
  request('/transactions', {
    method: 'POST',
    body: JSON.stringify(transaction)
  });

// USERS
export const getUsers = () => request('/users');

export const addUser = (user) =>
  request('/users', {
    method: 'POST',
    body: JSON.stringify(user)
  });

export const updateUser = (id, user) =>
  request(`/users/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(user)
  });

export const deleteUser = (id) =>
  request(`/users/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });

// LOGIN
export const loginUser = (credentials) =>
  request('/users/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
