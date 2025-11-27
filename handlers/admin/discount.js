const { setDiscount, removeDiscount, getDiscount } = require('../../database/discounts');
const { getUser } = require('../../database/users');

const discountHandler = async (ctx) => {
  const args = ctx.message.text.replace('/diskon', '').trim().split(' ');
  
  if (args.length < 2) {
    return ctx.reply(
      '❌ Format:\n' +
      '• /diskon @username <persen>\n' +
      '• /diskon @username 0 (hapus diskon)\n\n' +
      'Contoh:\n' +
      '/diskon @johndoe 10\n' +
      '(User dapat diskon 10%)'
    );
  }
  
  let username = args[0];
  const percentage = parseInt(args[1]);
  
  if (isNaN(percentage) || percentage < 0 || percentage > 100) {
    return ctx.reply('❌ Persen harus angka 0-100!');
  }
  
  // Remove @ if exists
  username = username.replace('@', '');
  
  // Find user by username
  const { getAllUsers } = require('../../database/users');
  const users = getAllUsers();
  const targetUser = users.find(u => u.username && u.username.toLowerCase() === username.toLowerCase());
  
  if (!targetUser) {
    return ctx.reply(`❌ User @${username} tidak ditemukan!`);
  }
  
  if (percentage === 0) {
    removeDiscount(targetUser.id);
    return ctx.reply(`✅ Diskon untuk @${username} dihapus!`);
  }
  
  setDiscount(targetUser.id, percentage);
  
  return ctx.reply(
    `✅ Diskon berhasil diset!\n\n` +
    `👤 User: @${username}\n` +
    `🆔 ID: ${targetUser.id}\n` +
    `💰 Diskon: ${percentage}%\n\n` +
    `💡 User ini akan mendapat diskon ${percentage}% di semua pembelian`
  );
};

module.exports = discountHandler;

