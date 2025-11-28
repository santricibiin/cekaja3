const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'soldcount.json');

const initDB = () => {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ sold: {} }));
  }
};

const readDB = () => {
  initDB();
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    if (!data || data.trim() === '') {
      return { sold: {} };
    }
    return JSON.parse(data);
  } catch (error) {
    return { sold: {} };
  }
};

const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// Get sold count for product
const getSoldCount = (productCode) => {
  const db = readDB();
  return db.sold[productCode] || 0;
};

// Increment sold count
const incrementSold = (productCode, qty = 1) => {
  const db = readDB();
  db.sold[productCode] = (db.sold[productCode] || 0) + qty;
  writeDB(db);
  return db.sold[productCode];
};

// Set sold count (for manual override)
const setSoldCount = (productCode, count) => {
  const db = readDB();
  db.sold[productCode] = count;
  writeDB(db);
  return count;
};

module.exports = {
  getSoldCount,
  incrementSold,
  setSoldCount
};
