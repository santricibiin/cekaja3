# Troubleshooting Dynamic QRIS

## ❌ Produk Tidak Terkirim Meskipun Pembayaran Terdeteksi

### Symptom:
```
💰 Amount detected: 1 (raw: 1)
❌ NO MATCHING PAYMENT FOUND!
   Looking for amount: 1
```

Tapi pending payment menunjukkan total berbeda (misal: Rp 486)

### Root Causes & Solutions:

#### 1. **User Scan QR Lama / Wrong QR**
**Penyebab:** User scan QR code yang berbeda, bukan yang baru digenerate

**Solusi:**
- Pastikan user scan **QR code terbaru** yang muncul di bot
- Jangan scan QR lama atau screenshot QR sebelumnya
- QR code harus fresh generate setiap transaksi

#### 2. **Dynamic QRIS API Gagal**
**Penyebab:** API converter tidak bekerja atau return QRIS statis

**Cek di Console Log:**
```
🔄 Generating dynamic QRIS for Rp 486...
   Request data: { qrisCode: "...", nominal: "486", ... }
   API Response status: 200
   API Response data keys: ['qrCode', ...]
⚠️  Tag 54 (amount) not found - QRIS might be static!  <-- MASALAH!
```

**Solusi:**
- Check API endpoint: `https://qris-statis-to-dinamis.vercel.app/generate-qris`
- Verify QRIS_CODE di `.env` valid
- Test API secara manual dengan curl/postman
- Jika API down, update ke API alternatif

#### 3. **Wallet App Tidak Support Dynamic Amount**
**Penyebab:** Beberapa e-wallet tidak support QRIS dinamis

**Solusi:**
- Test dengan berbagai wallet (GoPay, OVO, DANA, ShopeePay, dll)
- Jika persistent, consider fallback ke QRIS statis + manual verify

#### 4. **Amount Extraction Failed**
**Penyebab:** Format notifikasi Nobu berubah

**Cek di Console Log:**
```
📱 Formatted notification:
   - Text: Pembayaran QRIS diterima, Rp1 akan dikreditkan...
💰 Amount detected: 1 (raw: 1)  <-- Extract "1" instead of "486"
```

**Solusi:**
- Update regex pattern di `qrisAPI.js`
- Current pattern: `/Rp([\d.,]+)\s+akan\s+dikreditkan/i`
- Jika format berubah, adjust pattern sesuai text baru

## 🔍 Debugging Checklist

### Step 1: Verify Dynamic QRIS Generation
Cek console saat generate:
```
✅ Dynamic QRIS generated - Amount in QR: 486 (expected: 486)
```

Jika muncul:
```
⚠️  Tag 54 (amount) not found - QRIS might be static!
```
→ **QRIS masih statis, API tidak bekerja!**

### Step 2: Verify Notification Format
Cek console saat webhook received:
```
📦 Body: {
  "text": "Pembayaran QRIS diterima, Rp486 akan dikreditkan..."
}
💰 Amount detected: 486 (raw: 486)
```

Jika amount detected tidak match dengan total:
→ **User scan QR yang salah atau app tidak support dynamic**

### Step 3: Verify Pending Payments
```
🔍 Searching in 2 pending payments:
   Payment: QRIS-xxx
     Total: 486
     Match: ✅ YES  <-- Harus YES untuk terkirim
```

Jika semua NO:
→ **Amount tidak match dengan satupun pending payment**

## 🛠️ Manual Testing

### Test Dynamic QRIS API:
```bash
curl -X POST https://qris-statis-to-dinamis.vercel.app/generate-qris \
  -H "Content-Type: application/json" \
  -d '{
    "qrisCode": "YOUR_STATIC_QRIS",
    "nominal": "486",
    "feeType": "r",
    "fee": "0",
    "includeFee": false
  }'
```

Response harus ada:
```json
{
  "qrCode": "data:image/png;base64,iVBOR..."
}
```

### Decode QRIS String:
QR code hasil API harus punya **Tag 54** (amount):
```
...5403486...  (54 = tag, 03 = length, 486 = amount)
```

Jika tidak ada Tag 54 → API tidak bekerja dengan benar

## 📌 Best Practices

1. **Fresh QR for Each Transaction**
   - Generate new QR setiap user checkout
   - Don't reuse QR code

2. **Monitor API Health**
   - Log all API responses
   - Setup alert untuk API errors

3. **User Education**
   - Inform user untuk scan QR yang baru muncul
   - Jangan gunakan screenshot atau QR lama

4. **Cleanup Old Payments**
   - Auto-delete pending payments > 15 menit
   - Prevent memory leak

## 🔄 Fallback Strategy

Jika Dynamic QRIS consistently gagal:

1. **Option A:** Revert ke Static QRIS + Manual Verify
2. **Option B:** Use alternative dynamic QRIS API
3. **Option C:** Implement payment confirmation button

## 📞 Support

Jika issue persist after troubleshooting:
1. Check all console logs
2. Test dengan different e-wallet
3. Verify API endpoint masih aktif
4. Check Nobu notification format
