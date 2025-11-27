# Debug QRIS Payment Issue

## Masalah
Pembayaran diterima tapi produk tidak dikirim

## Perbaikan yang Dilakukan

### 1. **Validasi Stock yang Lebih Ketat**
```javascript
// Sebelum:
if (!stocks) { ... }

// Sesudah:
if (!stocks || stocks.length === 0) { ... }
```
**Alasan:** Array kosong (`[]`) tetap `truthy`, sehingga lolos validasi. Sekarang check length juga.

### 2. **Tambahan Logging Detail**
Untuk tracking proses:
- ✅ Log saat payment dibuat (product code, quantity, total)
- ✅ Log saat mencoba ambil stock
- ✅ Log hasil stock retrieval
- ✅ Log saat prepare account details
- ✅ Log saat kirim pesan ke user

### 3. **Validasi Pengiriman Detail Produk**
```javascript
if (accountDetails && accountDetails.trim() !== '') {
    await bot.telegram.sendMessage(userId, detail);
    console.log('✅ Product details sent');
} else {
    console.log('⚠️  Account details empty');
}
```

## Checklist Troubleshooting

### Saat Payment Dibuat:
1. ✅ Pastikan `product.code` tidak `null` atau `undefined`
2. ✅ Cek console log: "QRIS Payment created" dengan product code
3. ✅ Verify total amount dengan kode unik

### Saat Webhook Diterima:
1. ✅ Cek notifikasi masuk: "QRIS CALLBACK"
2. ✅ Verify package: `com.bnc.finance`
3. ✅ Extract amount dari text
4. ✅ Searching pending payments - apakah match?
5. ✅ User found?
6. ✅ Attempting to get stock - product code apa?
7. ✅ Stock result - berapa items?
8. ✅ Account details prepared - ada isinya?
9. ✅ Confirmation message sent?
10. ✅ Product details sent?

## Cara Testing

### 1. Restart Bot
```bash
npm start
```

### 2. Buat Order QRIS
- Pilih produk dengan stok tersedia
- Klik QRIS
- Catat total amount dengan kode unik

### 3. Monitor Console Log
Perhatikan output:
```
💳 QRIS Payment created: QRIS-123456789-1234567890
   Product: Product Name (Code: PROD001)
   Quantity: 1
   Total: Rp 10,347
```

### 4. Trigger Webhook
Kirim notifikasi test:
```bash
curl -X POST http://localhost:3000/api/qris-callback \
  -H "Content-Type: application/json" \
  -d '{
    "pkg": "com.bnc.finance",
    "text": "Rp10347 akan dikreditkan ke rekening Anda"
  }'
```

### 5. Cek Console Output
Harus muncul:
```
==================== QRIS CALLBACK ====================
📥 Request received at: ...
💰 Amount detected: 10347
🔍 Searching in X pending payments:
   >>> MATCH FOUND! <<<
👤 User found: username
📦 Attempting to get stock for: PROD001 qty: 1
📦 Stock result: [{ ... }]
✅ Stock retrieved successfully, count: 1
📝 Account details prepared: 
1. Detail Produk
✅ Confirmation message sent
✅ Product details sent to user
```

## Kemungkinan Penyebab Issue

### ❌ Stock Kosong
**Cek:** Console log "Stock result: []"
**Solusi:** Tambah stock dengan `/addstok code,detail`

### ❌ Product Code Null
**Cek:** Console log "Product: Name (Code: undefined)"
**Solusi:** Pastikan produk punya `code` saat dibuat

### ❌ Amount Tidak Match
**Cek:** Console log "NO MATCHING PAYMENT FOUND"
**Solusi:** Pastikan transfer tepat sesuai total + kode unik

### ❌ Package Salah
**Cek:** Console log "Not Nobu Bank notification"
**Solusi:** Validasi otomatis lewat:
- Package: `com.bnc.finance` ATAU
- Text pattern: "Pembayaran QRIS diterima" atau "akan dikreditkan ke Tabungan"

### ❌ Telegram API Error
**Cek:** Error log saat send message
**Solusi:** Verify bot token dan user sudah /start

## Command untuk Check Stock

Untuk cek stock tersedia (via code):
```javascript
const { getStockCount } = require('./database/stocks');
console.log('Stock for PROD001:', getStockCount('PROD001'));
```

Atau tambah command di bot:
```javascript
bot.command('checkstock', isAdmin, (ctx) => {
    const args = ctx.message.text.split(' ');
    const code = args[1];
    const count = getStockCount(code);
    ctx.reply(`Stock ${code}: ${count} items`);
});
```
