const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'useractivities.json');

const initDB = () => {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ activities: [] }));
  }
};

const readDB = () => {
  initDB();
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    if (!data || data.trim() === '') {
      return { activities: [] };
    }
    return JSON.parse(data);
  } catch (error) {
    return { activities: [] };
  }
};

const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// Track user activity
const trackActivity = (userId, username, action, details = null) => {
  const db = readDB();
  
  const activity = {
    userId: userId,
    username: username || 'Unknown',
    action: action,
    details: details,
    timestamp: new Date().toISOString()
  };
  
  db.activities.push(activity);
  
  // Auto cleanup: keep only last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  db.activities = db.activities.filter(act => 
    new Date(act.timestamp) > thirtyDaysAgo
  );
  
  writeDB(db);
  return activity;
};

// Get user activities
const getUserActivities = (userId, limit = 50) => {
  const db = readDB();
  return db.activities
    .filter(act => act.userId === userId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
};

// Get all activities (for admin)
const getAllActivities = (limit = 100) => {
  const db = readDB();
  return db.activities
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
};

// Get activity statistics
const getActivityStats = () => {
  const db = readDB();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const stats = {
    totalActivities: db.activities.length,
    todayActivities: db.activities.filter(act => 
      new Date(act.timestamp) >= today
    ).length,
    uniqueUsers: [...new Set(db.activities.map(act => act.userId))].length,
    actionBreakdown: {}
  };
  
  // Count by action type
  db.activities.forEach(act => {
    stats.actionBreakdown[act.action] = (stats.actionBreakdown[act.action] || 0) + 1;
  });
  
  return stats;
};

// Get popular products (most viewed)
const getPopularProducts = (limit = 10) => {
  const db = readDB();
  const productViews = {};
  
  db.activities
    .filter(act => act.action === 'view_product' && act.details?.productName)
    .forEach(act => {
      const name = act.details.productName;
      productViews[name] = (productViews[name] || 0) + 1;
    });
  
  return Object.entries(productViews)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ productName: name, views: count }));
};

module.exports = {
  trackActivity,
  getUserActivities,
  getAllActivities,
  getActivityStats,
  getPopularProducts
};
