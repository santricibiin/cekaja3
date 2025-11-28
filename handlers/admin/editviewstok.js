const { setSoldCount } = require('../../database/soldcount');
const { getAllProducts } = require('../../database/products');

const editViewStokHandler = async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);
  
  if (args.length < 2) {
    return ctx.reply(
      '❌ Format salah!\n\n' +
      'Gunakan: `/editviewstok <code> <jumlah>`\n\n' +
      'Contoh: `/editviewstok NF1 150`\n' +
      'Artinya: Set produk NF1 tampil "150 Terjual"',
      { parse_mode: 'Markdown' }
    );
  }
  
  const productCode = args[0];
  const soldCount = parseInt(args[1]);
  
  if (isNaN(soldCount) || soldCount < 0) {
    return ctx.reply('❌ Jumlah harus berupa angka positif!');
  }
  
  // Verify product exists
  const products = getAllProducts();
  const product = products.find(p => p.code === productCode);
  
  if (!product) {
    return ctx.reply(`❌ Produk dengan code "${productCode}" tidak ditemukan!`);
  }
  
  // Set sold count
  setSoldCount(productCode, soldCount);
  
  ctx.reply(
    `✅ *View Stok Terjual Berhasil Diubah!*\n\n` +
    `📦 Produk: ${product.name}\n` +
    `🔖 Code: ${productCode}\n` +
    `🔥 Tampilan Terjual: ${soldCount.toLocaleString('id-ID')}\n\n` +
    `💡 Sekarang produk ini akan tampil "${soldCount} Terjual" di detail produk.`,
    { parse_mode: 'Markdown' }
  );
};

module.exports = editViewStokHandler;
