const { setSpecialPrice, removeSpecialPrice } = require('../../database/specialprices');
const { getProductByCode } = require('../../database/products');

const setPriceHandler = async (ctx) => {
  const args = ctx.message.text.replace('/setprice', '').trim().split(' ');
  
  if (args.length < 3) {
    return ctx.reply(
      '❌ Format: /setprice <code> <minqty> <harga>\n\n' +
      'Contoh:\n' +
      '/setprice NF1 10 2000\n' +
      '(Beli 10+ harga jadi Rp 2.000/item)'
    );
  }
  
  const code = args[0];
  const minQty = parseInt(args[1]);
  const newPrice = parseInt(args[2]);
  
  if (isNaN(minQty) || isNaN(newPrice)) {
    return ctx.reply('❌ Minimal qty dan harga harus angka!');
  }
  
  const product = getProductByCode(code);
  if (!product) {
    return ctx.reply(`❌ Produk dengan code "${code}" tidak ditemukan!`);
  }
  
  if (newPrice === 0) {
    removeSpecialPrice(code);
    return ctx.reply(`✅ Special price untuk "${product.name}" dihapus!`);
  }
  
  setSpecialPrice(code, minQty, newPrice);
  
  return ctx.reply(
    `✅ Special price berhasil diset!\n\n` +
    `📦 Produk: ${product.name}\n` +
    `🔖 Code: ${code}\n` +
    `💰 Harga Normal: Rp ${product.price.toLocaleString('id-ID')}\n` +
    `📦 Beli Min: ${minQty}\n` +
    `💰 Harga Khusus: Rp ${newPrice.toLocaleString('id-ID')}/item\n\n` +
    `💡 Beli ${minQty}+ dapat harga Rp ${newPrice.toLocaleString('id-ID')}/item`
  );
};

module.exports = setPriceHandler;

