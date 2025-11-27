const { getProductByCode, updateProduct } = require('../../database/products');

const editProdukHandler = async (ctx) => {
  const args = ctx.message.text.replace('/editproduk', '').trim();
  
  if (!args) {
    return ctx.reply(
      '❌ Format: /editproduk <code> <field> <value>\n\n' +
      'Field yang bisa diubah:\n' +
      '• code - Kode produk\n' +
      '• nama - Nama produk\n' +
      '• harga - Harga produk\n' +
      '• detail - Detail produk\n' +
      '• snk - Syarat & Ketentuan\n\n' +
      'Contoh:\n' +
      '/editproduk NF1 harga 25000\n' +
      '/editproduk NF1 nama Netflix Premium\n' +
      '/editproduk NF1 snk Jangan share akun!'
    );
  }
  
  const parts = args.split(' ');
  if (parts.length < 3) {
    return ctx.reply('❌ Format tidak lengkap! Gunakan: /editproduk <code> <field> <value>');
  }
  
  const code = parts[0];
  const field = parts[1].toLowerCase();
  const value = parts.slice(2).join(' ');
  
  const product = getProductByCode(code);
  if (!product) {
    return ctx.reply(`❌ Produk dengan code "${code}" tidak ditemukan!`);
  }
  
  const updates = {};
  
  if (field === 'code') {
    updates.code = value;
  } else if (field === 'nama') {
    updates.name = value;
  } else if (field === 'harga') {
    const harga = parseInt(value);
    if (isNaN(harga)) {
      return ctx.reply('❌ Harga harus berupa angka!');
    }
    updates.price = harga;
  } else if (field === 'detail') {
    updates.detail = value;
  } else if (field === 'snk') {
    updates.snk = value;
  } else {
    return ctx.reply('❌ Field tidak valid! Pilih: code, nama, harga, detail, atau snk');
  }
  
  const updated = updateProduct(code, updates);
  
  if (!updated) {
    return ctx.reply('❌ Gagal update produk!');
  }
  
  let msg = `✅ Produk berhasil diupdate!\n\n` +
    `📦 Produk: ${updated.name}\n` +
    `🔖 Code: ${updated.code}\n` +
    `💰 Harga: Rp ${updated.price.toLocaleString('id-ID')}\n` +
    `📝 Detail: ${updated.detail}`;
  
  if (updated.snk) {
    msg += `\n⚠️ S&K: ${updated.snk}`;
  }
  
  ctx.reply(msg);
};

module.exports = editProdukHandler;

