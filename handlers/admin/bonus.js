const { setBonus, removeBonus, getBonus } = require('../../database/bonus');
const { getProductByCode } = require('../../database/products');

const bonusHandler = async (ctx) => {
  const args = ctx.message.text.replace('/bonus', '').trim().split(' ');
  
  if (args.length < 2) {
    return ctx.reply(
      '❌ Format:\n' +
      '• /bonus on <code> <min> <bonus>\n' +
      '• /bonus off <code>\n\n' +
      'Contoh:\n' +
      '/bonus on chatgptbls 5 1\n' +
      '(Beli 5 dapat bonus 1)'
    );
  }
  
  const action = args[0].toLowerCase();
  const code = args[1];
  
  const product = getProductByCode(code);
  if (!product) {
    return ctx.reply(`❌ Produk dengan code "${code}" tidak ditemukan!`);
  }
  
  if (action === 'on') {
    if (args.length < 4) {
      return ctx.reply('❌ Format: /bonus on <code> <min> <bonus>');
    }
    
    const minPurchase = parseInt(args[2]);
    const bonusAmount = parseInt(args[3]);
    
    if (isNaN(minPurchase) || isNaN(bonusAmount)) {
      return ctx.reply('❌ Minimal pembelian dan jumlah bonus harus angka!');
    }
    
    setBonus(code, minPurchase, bonusAmount);
    
    return ctx.reply(
      `✅ Bonus diaktifkan!\n\n` +
      `📦 Produk: ${product.name}\n` +
      `🔖 Code: ${code}\n` +
      `🛒 Minimal Beli: ${minPurchase}\n` +
      `🎁 Bonus: ${bonusAmount}\n\n` +
      `💡 Beli ${minPurchase} dapat bonus ${bonusAmount}`
    );
  } else if (action === 'off') {
    removeBonus(code);
    return ctx.reply(`✅ Bonus untuk "${product.name}" dimatikan!`);
  } else {
    return ctx.reply('❌ Action harus "on" atau "off"');
  }
};

module.exports = bonusHandler;

