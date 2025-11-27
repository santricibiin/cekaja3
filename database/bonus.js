const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'bonus.json');

const initDB = () => {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ bonus: {} }));
  }
};

const readDB = () => {
  initDB();
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return data ? JSON.parse(data) : { bonus: {} };
  } catch (error) {
    return { bonus: {} };
  }
};

const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

const setBonus = (code, minPurchase, bonusAmount) => {
  const db = readDB();
  db.bonus[code.toLowerCase()] = {
    minPurchase: parseInt(minPurchase),
    bonusAmount: parseInt(bonusAmount),
    active: true
  };
  writeDB(db);
  return db.bonus[code.toLowerCase()];
};

const removeBonus = (code) => {
  const db = readDB();
  delete db.bonus[code.toLowerCase()];
  writeDB(db);
  return true;
};

const getBonus = (code) => {
  const db = readDB();
  return db.bonus[code.toLowerCase()] || null;
};

const getAllBonus = () => {
  const db = readDB();
  return db.bonus;
};

module.exports = {
  setBonus,
  removeBonus,
  getBonus,
  getAllBonus
};

