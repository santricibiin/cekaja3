# Fitur Ganti Foto Bot

## Deskripsi
Command `/gantifoto` memungkinkan admin untuk mengubah foto yang ditampilkan di semua pesan bot tanpa perlu restart.

## Penggunaan

### Format Command
```
/gantifoto <URL>
```

### Contoh
```
/gantifoto https://i.imgur.com/abc123.jpg
/gantifoto https://telegra.ph/file/xyz789.jpg
/gantifoto https://example.com/image.png
```

## Requirements
- ✅ Harus admin (cek via ADMIN_ID)
- ✅ URL harus valid (http:// atau https://)
- ✅ Format image yang didukung: JPG, PNG, GIF, dll

## Response Bot

### Success
```
✅ ꜰᴏᴛᴏ ʙᴇʀʜᴀꜱɪʟ ᴅɪɢᴀɴᴛɪ!

🖼️ URL Baru:
`https://example.com/photo.jpg`

📅 Updated: 23/11/2025, 17:30:00

⚠️ Foto baru langsung berlaku!
```

### Error - Bukan Admin
```
❌ Perintah ini hanya untuk admin!
```

### Error - URL Invalid
```
❌ URL tidak valid! Harus dimulai dengan http:// atau https://
```

### Error - Format Salah
```
❌ Format: /gantifoto <URL>

Contoh:
/gantifoto https://example.com/photo.jpg

📝 URL harus valid (http/https)
```

## Cara Kerja

### 1. Update `.env` File
Command akan membaca dan mengupdate file `.env`:

**Before:**
```env
BOT_TOKEN=xxx
ADMIN_ID=123
PHOTO_URL=https://old-url.com/photo.jpg
```

**After:**
```env
BOT_TOKEN=xxx
ADMIN_ID=123
PHOTO_URL=https://new-url.com/image.jpg  ← Updated!
```

### 2. Runtime Update
```javascript
// Update process.env
process.env.PHOTO_URL = newUrl;

// Update config object
require('../../config/config').photoUrl = newUrl;
```

### 3. Dynamic Loading
Semua handler menggunakan dynamic loading untuk photoUrl:

```javascript
// start.js - menggunakan getPhotoUrl()
const getPhotoUrl = () => {
  delete require.cache[require.resolve('../config/config')];
  return require('../config/config').photoUrl;
};

// index.js - dynamic reload sebelum digunakan
delete require.cache[require.resolve('./config/config')];
const currentPhotoUrl = require('./config/config').photoUrl;
```

## Dimana Foto Digunakan?

Foto bot ditampilkan di:
1. ✅ `/start` - Welcome message (admin & user)
2. ✅ Pilih produk dengan qty (new message)
3. ✅ Back to home menu
4. ✅ Category listing

## Technical Details

### Files Modified
- `handlers/admin/changephoto.js` - Main handler
- `handlers/start.js` - Dynamic photo loading
- `index.js` - Dynamic photo loading di showProductMessage
- `.env` - Photo URL storage

### Module Caching
Untuk support runtime changes, code menggunakan:
```javascript
delete require.cache[require.resolve('./config/config')];
```
Ini clear cache sehingga `require()` berikutnya akan load fresh data dari `.env`.

### Security
- ✅ Admin-only command (via `isAdmin` middleware)
- ✅ URL validation (must start with http:// or https://)
- ✅ Error handling untuk file I/O operations
- ✅ Tidak expose sensitive data di error messages

## Troubleshooting

### Foto Tidak Berubah?
1. **Check apakah command berhasil**
   - Harus dapat response "✅ ꜰᴏᴛᴏ ʙᴇʀʜᴀꜱɪʟ ᴅɪɢᴀɴᴛɪ!"
   
2. **Check .env file**
   ```bash
   cat .env | grep PHOTO_URL
   ```
   URL harus sudah berubah

3. **Test dengan /start**
   - Ketik `/start` lagi
   - Foto seharusnya sudah berubah
   - Jika belum, cek console log untuk errors

### URL Error?
- Pastikan URL valid dan accessible
- Test URL di browser terlebih dahulu
- Beberapa URL mungkin blocked oleh Telegram

### Permission Error?
- Pastikan `.env` file writable
- Check file permissions: `ls -la .env`

## Best Practices

### Recommended Image Hosting
1. **Imgur** - https://imgur.com
2. **Telegraph** - https://telegra.ph
3. **GitHub Raw** - Raw URL dari GitHub repo
4. **Cloudinary** - https://cloudinary.com

### Image Specifications
- **Format:** JPG, PNG recommended
- **Size:** < 5MB
- **Dimensions:** 800x600 atau 1200x800 optimal
- **Aspect Ratio:** 4:3 atau 16:9

### Tips
- Use stable hosting (jangan temporary URLs)
- Use HTTPS (lebih secure)
- Test URL di browser sebelum gunakan
- Keep backup dari URL lama

## Example Workflow

```bash
# 1. Admin ingin ganti foto
/gantifoto https://i.imgur.com/newphoto.jpg

# 2. Bot response
✅ ꜰᴏᴛᴏ ʙᴇʀʜᴀꜱɪʟ ᴅɪɢᴀɴᴛɪ!

# 3. Test dengan /start
/start

# 4. Foto baru muncul! ✅
```

## Console Logs

### Success
```
📸 Photo URL changed by admin 123456789: https://example.com/photo.jpg
```

### Error
```
Error changing photo: [Error details]
```

## Maintenance

### Backup Old URLs
Sebelum ganti foto, save URL lama:
```
# Old URL: https://old-url.com/photo.jpg
/gantifoto https://new-url.com/photo.jpg
```

### Rollback
Untuk revert ke foto lama:
```
/gantifoto https://old-url.com/photo.jpg
```

## Future Enhancements

Potential improvements:
- [ ] Upload foto langsung ke bot (tanpa URL)
- [ ] Preview foto sebelum save
- [ ] History foto yang pernah digunakan
- [ ] Multiple foto untuk different categories
- [ ] Auto-upload ke image hosting service
