# Auto-Verify QRIS Payment dengan Dynamic QR

## Features
- ✨ **Dynamic QRIS** - QR code otomatis terisi nominal pembayaran
- 🔢 **Kode Unik** - Setiap transaksi punya kode unik 3 digit
- 🤖 **Auto Verify** - Pembayaran terdeteksi & produk terkirim otomatis
- 📱 **Webhook Integration** - Real-time notification dari Nobu Bank
- 🔒 **Stock Management** - Auto deduct stock setelah payment

## Setup

1. **Install dependencies**
```bash
npm install
```

2. **Configure .env**
```env
BOT_TOKEN=your_telegram_bot_token
ADMIN_ID=your_telegram_id
PHOTO_URL=your_photo_url
QRIS_CODE=00020101021126740025ID.CO.BANKNEOCOMMERCE.WWW011893600490594039289802120005001207420303UMI51550025ID.CO.BANKNEOCOMMERCE.WWW0215ID10243262829500303UMI5204526253033605802ID5908FAST SMM6007BANDUNG6105409116233052230017964618501075763200703T0163040ABB
PORT=3000
```

3. **Start bot**
```bash
npm start
```

## Webhook Setup

### Untuk Testing Lokal (Ngrok)
```bash
ngrok http 3000
```
Copy URL ngrok (contoh: `https://abc123.ngrok.io`) dan gunakan sebagai webhook di aplikasi notifikasi.

### Webhook Endpoint
```
POST http://your-domain.com/api/qris-callback
GET  http://your-domain.com/api/qris-callback (health check)
```

## Cara Kerja

1. User klik **📱 QRIS** saat checkout
2. Bot hitung: Total = Harga produk + kode unik 3 digit (100-999)
3. **Generate Dynamic QRIS** via API dengan nominal exact
4. QR code langsung terisi nominal, user tinggal scan!
5. Payment disimpan di `pendingPayments` (in-memory)
6. User scan QR & bayar (nominal otomatis match)
7. Nobu Bank kirim notifikasi ke webhook
8. System matching amount dengan pending payment
9. Auto-verify & kirim produk ke user
10. Delete QR message & kirim konfirmasi

### Dynamic QRIS Generator
- API: `https://qris-statis-to-dinamis.vercel.app/generate-qris`
- Input: QRIS statis + nominal
- Output: QRIS dinamis dengan nominal terisi
- Timeout: 15 detik
- User tidak perlu input manual nominal!

## Format Notifikasi dari Nobu Bank

### Format 1 (dengan package):
```json
{
  "name": "Nobu",
  "pkg": "com.bnc.finance",
  "title": "Transfer Masuk",
  "text": "Rp10347 akan dikreditkan ke rekening Anda",
  "subtext": ""
}
```

### Format 2 (tanpa package, validasi via text):
```json
{
  "title": "Kamu menerima 1 pembayaran",
  "text": "Pembayaran QRIS diterima, Rp114 akan dikreditkan ke Tabungan Reguler kamu 5859********8988",
  "subtext": "",
  "bigtext": "...",
  "infotext": ""
}
```

**Validasi:** System accept notifikasi jika:
- Package = `com.bnc.finance` ATAU
- Text mengandung "Pembayaran QRIS diterima" atau "akan dikreditkan ke Tabungan"

## Flow Pembayaran

```
User Order → Hitung Total + Kode Unik
                    ↓
          Generate Dynamic QRIS (API Call)
                    ↓
          QR dengan Nominal Terisi → Show to User
                    ↓
          Add to Pending Payments
                    ↓
User Scan & Pay (Nominal Auto Match) → Nobu Send Notification
                    ↓
          Webhook Receive → Match Amount
                    ↓
          Get Stock → Send to User → Delete Pending → Konfirmasi
```

**Keunggulan Dynamic QRIS:**
- ✅ User tidak perlu input nominal manual
- ✅ Mengurangi human error pembayaran
- ✅ Lebih cepat dan praktis
- ✅ Auto-match 100% akurat

## Admin Commands

- `/addcategory <nama>` - Tambah kategori
- `/addproduk kategori,code,nama,harga,detail` - Tambah produk
- `/addstok code,detail1,detail2,...` - Tambah stok
- `/broadcast <pesan>` - Broadcast ke semua user

## Notes

- Pending payments disimpan di **memory** (hilang saat restart)
- Untuk production, gunakan database (Redis/MongoDB)
- Pastikan webhook accessible dari internet
- Kode unik memudahkan matching payment
- **Dynamic QRIS** requires internet connection untuk API call
- API timeout 15 detik - jika gagal, akan show error message
- QRIS statis code disimpan di `.env` sebagai fallback
