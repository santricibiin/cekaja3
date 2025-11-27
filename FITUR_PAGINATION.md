# Fitur Pagination Kategori

## Deskripsi
Sistem pagination otomatis untuk daftar kategori dengan maksimal 5 kategori per halaman. Navigasi menggunakan tombol **◀️ Prev** dan **Next ▶️**.

## Features
- ✅ **Max 5 per halaman** - Tampilan lebih rapi dan tidak overwhelm
- ✅ **Navigasi mudah** - Tombol Prev/Next untuk ganti halaman
- ✅ **Nomor urut global** - Nomor kategori tetap konsisten di semua halaman
- ✅ **Page indicator** - Tampilkan "Halaman X/Y"
- ✅ **Auto pagination** - Hanya muncul jika kategori > 5

## UI Layout

### Halaman 1 dari 3 (Contoh 12 kategori)
```
💰 Saldo: Rp 100.000
🕒 10:30 WIB
💬 "Sukses dimulai dari langkah pertama yang berani."

📦 Kategori Produk:
1. Elektronik
2. Fashion
3. Makanan
4. Gaming
5. Streaming

📄 Halaman 1/3

[1] [2]
[3] [4]
[5]
[Next ▶️]
```

### Halaman 2 dari 3
```
💰 Saldo: Rp 100.000
🕒 10:30 WIB
💬 "Jangan berhenti sampai kamu bangga."

📦 Kategori Produk:
6. Software
7. Cloud Storage
8. VPN
9. Music
10. Books

📄 Halaman 2/3

[6] [7]
[8] [9]
[10]
[◀️ Prev] [Next ▶️]
```

### Halaman 3 dari 3
```
💰 Saldo: Rp 100.000
🕒 10:30 WIB
💬 "Kerja keras adalah kunci kesuksesan."

📦 Kategori Produk:
11. Tools
12. Templates

📄 Halaman 3/3

[11] [12]
[◀️ Prev]
```

## Cara Kerja

### 1. Perhitungan Halaman
```javascript
const maxPerPage = 5;
const totalPages = Math.ceil(categories.length / maxPerPage);
const startIndex = page * maxPerPage;
const endIndex = startIndex + maxPerPage;
const pageCategories = categories.slice(startIndex, endIndex);
```

**Contoh:**
- Total kategori: 12
- Max per halaman: 5
- Total halaman: Math.ceil(12/5) = 3 halaman
- Halaman 0: index 0-4 (5 items)
- Halaman 1: index 5-9 (5 items)
- Halaman 2: index 10-11 (2 items)

### 2. Navigasi Buttons
```javascript
const navRow = [];

if (page > 0) {
  navRow.push(Markup.button.callback('◀️ Prev', `page_${page - 1}`));
}

if (page < totalPages - 1) {
  navRow.push(Markup.button.callback('Next ▶️', `page_${page + 1}`));
}

buttons.push(navRow);
```

**Logic:**
- **Prev button** → Muncul jika `page > 0`
- **Next button** → Muncul jika `page < totalPages - 1`
- **Halaman 1** → Hanya Next
- **Halaman tengah** → Prev & Next
- **Halaman terakhir** → Hanya Prev

### 3. Action Handlers
```javascript
// Navigasi ke halaman tertentu
bot.action(/^page_(\d+)$/, async (ctx) => {
  const page = parseInt(ctx.match[1]);
  // ... render page dengan nomor tersebut
});
```

**Callback data:**
- `page_0` → Halaman 1
- `page_1` → Halaman 2
- `page_2` → Halaman 3

## Implementation Details

### Files Modified

**1. `index.js`**
- Added `buildCategoryButtons()` helper function
- Added `page_X` action handler
- Added `page_info` dummy handler
- Updated `back_home` action dengan pagination

**2. `handlers/start.js`**
- Updated user start handler dengan pagination logic
- Max 5 categories per page
- Show page indicator jika > 5

### Key Functions

**buildCategoryButtons(categories, page, maxPerPage)**
```javascript
// Helper function untuk build buttons dengan pagination
// Returns: Array of button rows
```

**page_X action handler**
```javascript
// Handle klik tombol Prev/Next
// Re-render kategori list dengan page baru
```

## Configuration

### Ubah Max Per Page
Edit nilai di 3 lokasi:

**1. `handlers/start.js`** (line 65)
```javascript
const maxPerPage = 5; // Ubah sesuai kebutuhan
```

**2. `index.js` - back_home handler** (line 322)
```javascript
const maxPerPage = 5; // Ubah sesuai kebutuhan
```

**3. `index.js` - page_X handler** (line 393)
```javascript
const maxPerPage = 5; // Ubah sesuai kebutuhan
```

**Rekomendasi:**
- 3-5 kategori → Optimal untuk mobile
- 5-7 kategori → Masih OK
- >10 kategori → Terlalu banyak, use pagination!

## User Experience

### Navigation Flow
```
/start → Halaman 1
  ↓
Click [Next ▶️] → Halaman 2
  ↓
Click [Next ▶️] → Halaman 3
  ↓
Click [◀️ Prev] → Halaman 2
  ↓
Click [Category 7] → View products
  ↓
Click [🔙 Kembali] → Back to Halaman 1 (reset to first page)
```

### Behavior
- **Back to home** → Always reset ke halaman 1
- **Page indicator** → Hanya muncul jika > 1 halaman
- **Buttons** → Adaptive berdasarkan posisi halaman
- **Global numbering** → Nomor kategori konsisten di semua halaman

## Edge Cases

### Kategori = 5
```
📦 Kategori Produk:
1. Cat A
2. Cat B
3. Cat C
4. Cat D
5. Cat E

[1] [2]
[3] [4]
[5]
```
→ **No pagination** (exactly maxPerPage)

### Kategori = 6
```
📦 Kategori Produk:
1. Cat A
2. Cat B
3. Cat C
4. Cat D
5. Cat E

📄 Halaman 1/2

[1] [2]
[3] [4]
[5]
[Next ▶️]
```
→ **Pagination** muncul (> maxPerPage)

### Kategori = 0
```
📦 Kategori Produk:

❌ Belum ada kategori.
```
→ No buttons, no pagination

## Benefits

### For Users
- ✅ **Cleaner UI** - Tidak perlu scroll banyak
- ✅ **Faster Loading** - Less buttons to render
- ✅ **Better Navigation** - Easier to find categories
- ✅ **Mobile Friendly** - Optimized for small screens

### For Admins
- ✅ **Scalable** - Support unlimited categories
- ✅ **Configurable** - Easy to change max per page
- ✅ **Maintainable** - Centralized pagination logic

## Testing Checklist

- [ ] Test dengan 0 kategori → No pagination
- [ ] Test dengan 5 kategori → No pagination (exactly max)
- [ ] Test dengan 6 kategori → Show pagination
- [ ] Test dengan 12 kategori → 3 halaman
- [ ] Test navigasi Prev → Correct page
- [ ] Test navigasi Next → Correct page
- [ ] Test page indicator → Show correct X/Y
- [ ] Test global numbering → Consistent across pages
- [ ] Test back_home → Reset to page 1
- [ ] Test category click → Navigate to products

## Future Enhancements

Potential improvements:
- [ ] Jump to specific page (page selector)
- [ ] Show total categories in message
- [ ] Remember last page position
- [ ] Pagination for products (within category)
- [ ] Customizable page size per user
- [ ] Search/filter categories

## Notes

- Pagination hanya untuk **kategori list**
- Products dalam category **tidak** pakai pagination (yet)
- Default page adalah **0** (first page)
- Page numbering di UI dimulai dari **1** (user-friendly)
- Page numbering internal dimulai dari **0** (zero-indexed)
