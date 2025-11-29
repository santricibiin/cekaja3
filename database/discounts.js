const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'discounts.json');

const initDB = () => {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ discounts: {} }));
  }
};

const readDB = () => {
  initDB();
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return data ? JSON.parse(data) : { discounts: {} };
  } catch (error) {
    return { discounts: {} };
  }
};

const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

const setDiscount = (userId, percentage) => {
  const db = readDB();
  db.discounts[userId] = {
    percentage: parseInt(percentage),
    createdAt: new Date().toISOString()
  };
  writeDB(db);
  return db.discounts[userId];
};

const getDiscount = (userId) => {
  const db = readDB();
  return db.discounts[userId] || null;
};

const removeDiscount = (userId) => {
  const db = readDB();
  delete db.discounts[userId];
  writeDB(db);
  return true;
};

module.exports = {
  setDiscount,
  getDiscount,
  removeDiscount
};

