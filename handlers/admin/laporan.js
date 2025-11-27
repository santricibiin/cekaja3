const { getTransactions } = require('../../database/transactions');
const { getAllUsers } = require('../../database/users');

const laporanHandler = async (ctx) => {
  const transactions = getTransactions();
  const users = getAllUsers();
  
  // Get today transactions
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTransactions = transactions.filter(t => new Date(t.createdAt) >= today);
  
  // Get this month transactions
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  const monthTransactions = transactions.filter(t => new Date(t.createdAt) >= thisMonth);
  
  // Calculate totals
  const todayTotal = todayTransactions.reduce((sum, t) => sum + t.total, 0);
  const monthTotal = monthTransactions.reduce((sum, t) => sum + t.total, 0);
  const allTimeTotal = transactions.reduce((sum, t) => sum + t.total, 0);
  
  // Top products
  const productCount = {};
  transactions.forEach(t => {
    if (t.productName) {
      productCount[t.productName] = (productCount[t.productName] || 0) + t.qty;
    }
  });
  
  const topProducts = Object.entries(productCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  let message = `📊 *LAPORAN KEUANGAN*\n\n`;
  message += `👥 Total User: ${users.length}\n`;
  message += `📝 Total Transaksi: ${transactions.length}\n\n`;
  
  message += `💰 *PENDAPATAN*\n`;
  message += `├ Hari Ini: Rp ${todayTotal.toLocaleString('id-ID')} (${todayTransactions.length}x)\n`;
  message += `├ Bulan Ini: Rp ${monthTotal.toLocaleString('id-ID')} (${monthTransactions.length}x)\n`;
  message += `└ Total: Rp ${allTimeTotal.toLocaleString('id-ID')}\n\n`;
  
  if (topProducts.length > 0) {
    message += `🏆 *TOP 5 PRODUK*\n`;
    topProducts.forEach((p, i) => {
      message += `${i + 1}. ${p[0]} (${p[1]}x)\n`;
    });
  }
  
  ctx.reply(message, { parse_mode: 'Markdown' });
};

module.exports = laporanHandler;

