# Telegram Bot

Bot Telegram dengan fitur admin dan user menggunakan Telegraf.

## Instalasi

```bash
npm install
```

## Konfigurasi

Edit file `.env` sesuai kebutuhan:
- `BOT_TOKEN`: Token bot dari BotFather
- `ADMIN_ID`: User ID admin
- `PHOTO_URL`: URL foto untuk pesan /start

## Menjalankan Bot

```bash
npm start
```

Untuk development dengan auto-reload:

```bash
npm run dev
```

## Fitur

### User
- `/start` - Memulai bot dan registrasi user
- `/saldo` atau `/balance` - Cek saldo
- `/help` - Bantuan

### Admin
- `/broadcast <pesan>` - Kirim pesan ke semua user

## Struktur Folder

```
├── config/          # Konfigurasi
├── database/        # Database users
├── handlers/        # Handler commands
│   ├── admin/       # Handler admin
│   └── user/        # Handler user
└── middleware/      # Middleware autentikasi
```
