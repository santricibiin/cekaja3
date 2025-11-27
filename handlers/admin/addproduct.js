const { addProduct } = require('../../database/products');
const { getAllCategories } = require('../../database/categories');

const addProductHandler = async (ctx) => {
  const input = ctx.message.text.replace('/addproduk', '').trim();
  
  if (!input) {
    return ctx.reply(
      '❌ Format:\n' +
      '/addproduk kategori,code,nama,harga,detail\n' +
      '/addproduk kategori,code,nama,harga,detail,snk\n\n' +
      'Contoh:\n' +
      '/addproduk Canva,CP001,CANVA PRO 1 BULAN,5000,Bergaransi\n' +
      '/addproduk Canva,CP002,CANVA PRO,5000,Bergaransi,Jangan share akun!'
    );
  }
  
  const parts = input.split(',').map(p => p.trim());
  
  if (parts.length < 5) {
    return ctx.reply('❌ Minimal: kategori,code,nama,harga,detail');
  }
  
  const categoryName = parts[0];
  const categories = getAllCategories();
  const categoryExists = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
  
  if (!categoryExists) {
    return ctx.reply(`❌ Kategori "${categoryName}" tidak ditemukan!`);
  }
  
  const code = parts[1];
  const name = parts[2];
  const price = parts[3];
  const detail = parts[4];
  const snk = parts[5] || null;
  
  if (isNaN(price)) {
    return ctx.reply('❌ Harga harus angka!');
  }
  
  addProduct(categoryName, code, name, price, detail, snk);
  
  let msg = `✅ Produk berhasil ditambahkan!\n\n📦 ${name}\n🔖 Code: ${code}\n💰 Harga: Rp ${parseInt(price).toLocaleString('id-ID')}\n📝 Detail: ${detail}`;
  if (snk) {
    msg += `\n⚠️ S&K: ${snk}`;
  }
  
  ctx.reply(msg);
};

module.exports = addProductHandler;
