const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'transactions.json');

const initDB = () => {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ transactions: [] }));
  }
};

const readDB = () => {
  initDB();
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return data ? JSON.parse(data) : { transactions: [] };
  } catch (error) {
    return { transactions: [] };
  }
};

const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

const addTransaction = (userId, username, type, productName, qty, total) => {
  const db = readDB();
  db.transactions.push({
    id: Date.now(),
    userId,
    username,
    type,
    productName,
    qty,
    total,
    createdAt: new Date().toISOString()
  });
  writeDB(db);
};

const getTransactions = (startDate = null, endDate = null) => {
  const db = readDB();
  let transactions = db.transactions;
  
  if (startDate) {
    transactions = transactions.filter(t => new Date(t.createdAt) >= new Date(startDate));
  }
  if (endDate) {
    transactions = transactions.filter(t => new Date(t.createdAt) <= new Date(endDate));
  }
  
  return transactions;
};

module.exports = {
  addTransaction,
  getTransactions
};

