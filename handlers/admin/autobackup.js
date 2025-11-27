const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '../../database/backupsettings.json');

const getSettings = () => {
  try {
    const data = fs.readFileSync(settingsPath, 'utf8');
    return JSON.parse(data);
  } catch {
    return { enabled: false, interval: 3600000, intervalType: 'hour' };
  }
};

const saveSettings = (settings) => {
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
};

const autobackupHandler = async (ctx) => {
  const args = ctx.message.text.replace('/autobackup', '').trim().split(' ');
  
  if (args.length < 2) {
    const settings = getSettings();
    return ctx.reply(
      `⚙️ *AUTO BACKUP SETTINGS*\n\n` +
      `Status: ${settings.enabled ? '✅ Aktif' : '❌ Nonaktif'}\n` +
      `Interval: ${settings.intervalType === 'minute' ? settings.interval / 60000 + ' menit' : settings.intervalType === 'hour' ? settings.interval / 3600000 + ' jam' : settings.interval / 86400000 + ' hari'}\n\n` +
      `Format:\n` +
      `/autobackup on <angka> <menit/jam/hari>\n` +
      `/autobackup off\n\n` +
      `Contoh:\n` +
      `/autobackup on 30 menit\n` +
      `/autobackup on 1 jam\n` +
      `/autobackup on 1 hari`,
      { parse_mode: 'Markdown' }
    );
  }
  
  const action = args[0].toLowerCase();
  
  if (action === 'off') {
    saveSettings({ enabled: false, interval: 3600000, intervalType: 'hour' });
    return ctx.reply('✅ Auto backup dimatikan!');
  }
  
  if (action === 'on') {
    if (args.length < 3) {
      return ctx.reply('❌ Format: /autobackup on <angka> <menit/jam/hari>');
    }
    
    const value = parseInt(args[1]);
    const type = args[2].toLowerCase();
    
    if (isNaN(value) || value < 1) {
      return ctx.reply('❌ Angka harus lebih dari 0!');
    }
    
    let interval;
    let intervalType;
    
    if (type === 'menit' || type === 'minute') {
      interval = value * 60000;
      intervalType = 'minute';
    } else if (type === 'jam' || type === 'hour') {
      interval = value * 3600000;
      intervalType = 'hour';
    } else if (type === 'hari' || type === 'day') {
      interval = value * 86400000;
      intervalType = 'day';
    } else {
      return ctx.reply('❌ Type harus: menit, jam, atau hari');
    }
    
    saveSettings({ enabled: true, interval, intervalType });
    
    return ctx.reply(
      `✅ Auto backup diaktifkan!\n\n` +
      `⏰ Interval: ${value} ${type}\n` +
      `📁 Database akan otomatis di-backup setiap ${value} ${type}`
    );
  }
  
  ctx.reply('❌ Action harus "on" atau "off"');
};

module.exports = autobackupHandler;

