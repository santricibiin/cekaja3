const { getUserActivities, getAllActivities, getActivityStats, getPopularProducts } = require('../../database/useractivities');

const activityHandler = async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);
  
  // If no args, show global stats
  if (args.length === 0) {
    const stats = getActivityStats();
    const popular = getPopularProducts(5);
    
    let message = `📊 *STATISTIK AKTIVITAS*\n\n`;
    message += `📈 Total Aktivitas: ${stats.totalActivities}\n`;
    message += `📅 Hari Ini: ${stats.todayActivities}\n`;
    message += `👥 Unique Users: ${stats.uniqueUsers}\n\n`;
    
    message += `🎯 *BREAKDOWN AKTIVITAS:*\n`;
    Object.entries(stats.actionBreakdown)
      .sort((a, b) => b[1] - a[1])
      .forEach(([action, count]) => {
        const emoji = getActionEmoji(action);
        message += `${emoji} ${formatActionName(action)}: ${count}\n`;
      });
    
    if (popular.length > 0) {
      message += `\n🔥 *PRODUK POPULER:*\n`;
      popular.forEach((item, idx) => {
        message += `${idx + 1}. ${item.productName} (${item.views} views)\n`;
      });
    }
    
    return ctx.reply(message, { parse_mode: 'Markdown' });
  }
  
  // If args provided, check if it's username or user ID
  const target = args[0];
  let userId;
  
  // Check if it's a mention (@username)
  if (target.startsWith('@')) {
    const username = target.substring(1);
    const { getAllUsers } = require('../../database/users');
    const users = getAllUsers();
    const user = users.find(u => u.username?.toLowerCase() === username.toLowerCase());
    
    if (!user) {
      return ctx.reply(`❌ User @${username} tidak ditemukan di database.`);
    }
    userId = user.id;
  } else {
    // Assume it's a user ID
    userId = parseInt(target);
    if (isNaN(userId)) {
      return ctx.reply(`❌ Format salah! Gunakan:\n/activity - Lihat stats global\n/activity @username - Lihat aktivitas user\n/activity <user_id> - Lihat aktivitas user`);
    }
  }
  
  // Get user activities
  const activities = getUserActivities(userId, 30);
  
  if (activities.length === 0) {
    return ctx.reply(`❌ Tidak ada aktivitas untuk user ID ${userId}`);
  }
  
  const username = activities[0].username;
  let message = `👤 *AKTIVITAS: ${username}*\n`;
  message += `🆔 ID: ${userId}\n`;
  message += `📊 Total: ${activities.length} aktivitas (30 terakhir)\n\n`;
  
  // Group by date
  const groupedByDate = {};
  activities.forEach(act => {
    const date = new Date(act.timestamp).toLocaleDateString('id-ID');
    if (!groupedByDate[date]) {
      groupedByDate[date] = [];
    }
    groupedByDate[date].push(act);
  });
  
  // Show activities grouped by date
  Object.entries(groupedByDate).forEach(([date, acts]) => {
    message += `📅 *${date}*\n`;
    acts.forEach(act => {
      const time = new Date(act.timestamp).toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      const emoji = getActionEmoji(act.action);
      message += `  ${time} ${emoji} ${formatActionName(act.action)}`;
      
      if (act.details) {
        if (act.details.categoryName) {
          message += ` - ${act.details.categoryName}`;
        } else if (act.details.productName) {
          message += ` - ${act.details.productName}`;
        } else if (act.details.amount) {
          message += ` - Rp ${act.details.amount.toLocaleString('id-ID')}`;
        }
      }
      message += '\n';
    });
    message += '\n';
  });
  
  return ctx.reply(message, { parse_mode: 'Markdown' });
};

const getActionEmoji = (action) => {
  const emojis = {
    'view_category': '📁',
    'view_product': '👁️',
    'adjust_qty': '🔢',
    'view_deposit': '💳',
    'purchase_saldo': '💰',
    'purchase_qris': '📱',
    'view_stock': '📦',
    'view_cara_order': '📖',
    'view_admin_contact': '👤'
  };
  return emojis[action] || '📌';
};

const formatActionName = (action) => {
  const names = {
    'view_category': 'Lihat Kategori',
    'view_product': 'Lihat Produk',
    'adjust_qty': 'Atur Qty',
    'view_deposit': 'Buka Deposit',
    'purchase_saldo': 'Beli (Saldo)',
    'purchase_qris': 'Beli (QRIS)',
    'view_stock': 'Lihat Stock',
    'view_cara_order': 'Cara Order',
    'view_admin_contact': 'Kontak Admin'
  };
  return names[action] || action;
};

module.exports = activityHandler;
