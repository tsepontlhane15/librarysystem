const STORAGE_KEYS = {
  books: 'library_books',
  users: 'library_users',
  transactions: 'library_transactions',
  session: 'library_session'
};

const DEFAULT_USERS = [
  {
    id: 'u1',
    name: 'System Admin',
    membershipId: 'Admin',
    role: 'admin',
    password: 'admin1521'
  }
];

export function loadData(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function getBooks() {
  return loadData(STORAGE_KEYS.books) || [];
}

export function saveBooks(books) {
  saveData(STORAGE_KEYS.books, books);
}

export function getUsers() {
  return loadData(STORAGE_KEYS.users) || [];
}

export function saveUsers(users) {
  saveData(STORAGE_KEYS.users, users);
}

export function getTransactions() {
  return loadData(STORAGE_KEYS.transactions) || [];
}

export function saveTransactions(txs) {
  saveData(STORAGE_KEYS.transactions, txs);
}

export function getSession() {
  return loadData(STORAGE_KEYS.session);
}

export function setSession(user) {
  saveData(STORAGE_KEYS.session, user);
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.session);
}

export function initStorage() {
  if (!loadData(STORAGE_KEYS.users)) {
    saveUsers(DEFAULT_USERS);
  }
  if (!loadData(STORAGE_KEYS.books)) {
    saveBooks([]);
  }
  if (!loadData(STORAGE_KEYS.transactions)) {
    saveTransactions([]);
  }
}

export function generateId(prefix) {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}