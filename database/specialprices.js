const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'specialprices.json');

const initDB = () => {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ prices: {} }));
  }
};

const readDB = () => {
  initDB();
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return data ? JSON.parse(data) : { prices: {} };
  } catch (error) {
    return { prices: {} };
  }
};

const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

const setSpecialPrice = (code, minQty, newPrice) => {
  const db = readDB();
  if (!db.prices[code.toLowerCase()]) {
    db.prices[code.toLowerCase()] = [];
  }
  
  // Remove existing rule with same minQty
  db.prices[code.toLowerCase()] = db.prices[code.toLowerCase()].filter(p => p.minQty !== minQty);
  
  // Add new rule
  db.prices[code.toLowerCase()].push({
    minQty: parseInt(minQty),
    price: parseInt(newPrice)
  });
  
  // Sort by minQty descending
  db.prices[code.toLowerCase()].sort((a, b) => b.minQty - a.minQty);
  
  writeDB(db);
  return db.prices[code.toLowerCase()];
};

const getSpecialPrice = (code, qty) => {
  const db = readDB();
  const rules = db.prices[code.toLowerCase()];
  if (!rules) return null;
  
  // Find first matching rule (highest minQty that qty meets)
  for (const rule of rules) {
    if (qty >= rule.minQty) {
      return rule.price;
    }
  }
  return null;
};

const removeSpecialPrice = (code) => {
  const db = readDB();
  delete db.prices[code.toLowerCase()];
  writeDB(db);
  return true;
};

module.exports = {
  setSpecialPrice,
  getSpecialPrice,
  removeSpecialPrice
};

