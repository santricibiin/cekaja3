# 📊 Fitur Activity Tracking

## 🎯 Overview
Fitur tracking aktivitas user yang otomatis merekam semua interaksi user dengan bot tanpa mengganggu user experience.

## ✨ Fitur Utama

### 1. **Auto Tracking**
Sistem otomatis mencatat aktivitas user:
- ✅ Melihat kategori
- ✅ Melihat produk
- ✅ Menambah/kurangi quantity
- ✅ Membuka halaman deposit
- ✅ Melihat All Stock
- ✅ Membuka Cara Order
- ✅ Menghubungi Admin
- ✅ Pembelian (Saldo & QRIS)

### 2. **Data Storage**
- Auto cleanup: Hanya simpan 30 hari terakhir
- Format: JSON lightweight
- Lokasi: `database/useractivities.json`

### 3. **Admin Commands**

#### `/activity`
Menampilkan statistik global aktivitas:
```
📊 STATISTIK AKTIVITAS

📈 Total Aktivitas: 150
📅 Hari Ini: 25
👥 Unique Users: 12

🎯 BREAKDOWN AKTIVITAS:
👁️ Lihat Produk: 45
📁 Lihat Kategori: 30
💰 Beli (Saldo): 15
📱 Beli (QRIS): 10
🔢 Atur Qty: 20
...

🔥 PRODUK POPULER:
1. Netflix Premium (23 views)
2. Spotify Premium (18 views)
3. YouTube Premium (15 views)
```

#### `/activity @username`
Menampilkan aktivitas spesifik user:
```
👤 AKTIVITAS: johndoe
🆔 ID: 123456789
📊 Total: 15 aktivitas (30 terakhir)

📅 28/11/2025
  14:30 👁️ Lihat Produk - Netflix Premium
  14:25 📁 Lihat Kategori - Streaming
  14:20 📦 Lihat Stock
  
📅 27/11/2025
  18:45 💰 Beli (Saldo) - Rp 50.000
  18:40 👁️ Lihat Produk - Spotify Premium
  ...
```

#### `/activity <user_id>`
Alternatif dengan menggunakan user ID:
```
/activity 123456789
```

## 🏗️ Struktur Database

### useractivities.json
```json
{
  "activities": [
    {
      "userId": 123456789,
      "username": "johndoe",
      "action": "view_product",
      "details": {
        "productName": "Netflix Premium",
        "productCode": "NF1"
      },
      "timestamp": "2025-11-28T14:30:00.000Z"
    }
  ]
}
```

## 📋 Action Types

| Action | Emoji | Deskripsi |
|--------|-------|-----------|
| `view_category` | 📁 | User melihat kategori |
| `view_product` | 👁️ | User melihat detail produk |
| `adjust_qty` | 🔢 | User mengubah quantity |
| `view_deposit` | 💳 | User membuka halaman deposit |
| `purchase_saldo` | 💰 | User membeli dengan saldo |
| `purchase_qris` | 📱 | User membeli dengan QRIS |
| `view_stock` | 📦 | User melihat All Stock |
| `view_cara_order` | 📖 | User membuka Cara Order |
| `view_admin_contact` | 👤 | User membuka kontak admin |

## 🔧 Fungsi Utama

### `trackActivity(userId, username, action, details)`
Mencatat aktivitas user:
```javascript
trackActivity(
  ctx.from.id, 
  ctx.from.username, 
  'view_product', 
  { productName: 'Netflix', productCode: 'NF1' }
);
```

### `getUserActivities(userId, limit)`
Mengambil aktivitas user tertentu:
```javascript
const activities = getUserActivities(123456789, 50);
```

### `getActivityStats()`
Mendapatkan statistik global:
```javascript
const stats = getActivityStats();
// Returns: { totalActivities, todayActivities, uniqueUsers, actionBreakdown }
```

### `getPopularProducts(limit)`
Mendapatkan produk paling banyak dilihat:
```javascript
const popular = getPopularProducts(10);
// Returns: [{ productName: 'Netflix', views: 45 }, ...]
```

## 💡 Use Cases

### 1. **Analisis Marketing**
- Produk mana yang paling banyak dilihat tapi tidak dibeli
- Waktu peak activity user
- Conversion rate dari view ke purchase

### 2. **User Behavior**
- Tracking user yang sering lihat tapi tidak beli
- Identifikasi user aktif vs pasif
- Pattern pembelian user

### 3. **Optimisasi UI/UX**
- Fitur mana yang paling sering diakses
- Flow user dari kategori ke purchase
- Bounce rate di kategori tertentu

### 4. **Customer Support**
- Lihat history aktivitas user sebelum komplain
- Verifikasi aktivitas user
- Tracking user behavior patterns

## ⚡ Performance

- **Lightweight**: Minimal overhead (~5ms per tracking)
- **Auto Cleanup**: Otomatis hapus data >30 hari
- **Async**: Tidak mengganggu response time bot
- **Efficient**: Query optimal dengan indexing by userId

## 🔒 Privacy & Security

- ✅ Hanya admin yang bisa akses data aktivitas
- ✅ Data tersimpan lokal di server
- ✅ Auto cleanup untuk privacy compliance
- ✅ Tidak track data sensitif (password, nomor kartu, dll)

## 📈 Future Enhancements

Fitur yang bisa ditambahkan:
- [ ] Export CSV untuk analisis external
- [ ] Dashboard grafik aktivitas
- [ ] Real-time notification untuk admin
- [ ] Machine learning untuk prediksi user behavior
- [ ] A/B testing framework
- [ ] Heatmap user journey

## 🛠️ Maintenance

### Backup Data
Data aktivitas otomatis ter-backup bersama database lain melalui `/autobackup`.

### Manual Cleanup
Jika ingin manual cleanup data lama:
```javascript
// Edit useractivities.js, ubah 30 menjadi jumlah hari yang diinginkan
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
```

### Reset Data
Untuk reset semua data aktivitas:
```json
// Edit useractivities.json
{"activities":[]}
```

## ✅ Checklist Implementasi

- [x] Database module (useractivities.js/json)
- [x] Tracking functions
- [x] Admin handler (/activity command)
- [x] Integrasi ke action handlers:
  - [x] Category view
  - [x] Product view
  - [x] Quantity adjustment
  - [x] Deposit view
  - [x] Stock view
  - [x] Cara Order view
  - [x] Admin contact view
  - [x] Purchase Saldo
  - [x] Purchase QRIS
- [x] Help documentation update
- [x] Auto cleanup system

## 🎉 Kesimpulan

Fitur activity tracking berhasil diimplementasikan dengan:
- ✅ **Non-intrusive**: Tidak mengganggu UX
- ✅ **Efficient**: Minimal overhead
- ✅ **Comprehensive**: Track semua aktivitas penting
- ✅ **Maintainable**: Auto cleanup & simple structure
- ✅ **Actionable**: Data yang bisa digunakan untuk insights

---

**Created**: November 28, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
