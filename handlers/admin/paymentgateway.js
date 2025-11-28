const { toggleGateway, getGatewaySettings } = require('../../database/paymentgateway');

const paymentGatewayHandler = async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);
  
  // If no args, show current settings
  if (args.length === 0) {
    const settings = getGatewaySettings();
    
    let message = `⚙️ *PAYMENT GATEWAY SETTINGS*\n\n`;
    
    Object.entries(settings).forEach(([code, info]) => {
      const status = info.enabled ? '✅ ON' : '❌ OFF';
      message += `${info.icon} *${info.name}*\n`;
      message += `   Code: \`${code}\`\n`;
      message += `   Status: ${status}\n\n`;
    });
    
    message += `💡 *Cara Penggunaan:*\n`;
    message += `\`/pg on <code>\` - Aktifkan gateway\n`;
    message += `\`/pg off <code>\` - Nonaktifkan gateway\n\n`;
    message += `📝 *Contoh:*\n`;
    message += `\`/pg on dana\` - Aktifkan DANA\n`;
    message += `\`/pg off nobu\` - Nonaktifkan Nobu`;
    
    return ctx.reply(message, { parse_mode: 'Markdown' });
  }
  
  if (args.length < 2) {
    return ctx.reply(
      '❌ Format salah!\n\n' +
      'Gunakan: `/pg on/off <code>`\n\n' +
      'Contoh:\n' +
      '`/pg on dana` - Aktifkan DANA\n' +
      '`/pg off nobu` - Nonaktifkan Nobu',
      { parse_mode: 'Markdown' }
    );
  }
  
  const action = args[0].toLowerCase();
  const gateway = args[1].toLowerCase();
  
  if (action !== 'on' && action !== 'off') {
    return ctx.reply('❌ Action harus `on` atau `off`!', { parse_mode: 'Markdown' });
  }
  
  const enabled = action === 'on';
  const result = toggleGateway(gateway, enabled);
  
  if (!result.success) {
    return ctx.reply(`❌ ${result.message}`);
  }
  
  const statusEmoji = enabled ? '✅' : '❌';
  const statusText = enabled ? 'DIAKTIFKAN' : 'DINONAKTIFKAN';
  
  let message = `${statusEmoji} *PAYMENT GATEWAY ${statusText}*\n\n` +
    `Gateway: ${result.name}\n` +
    `Code: \`${result.gateway}\`\n` +
    `Status: ${enabled ? '✅ Active' : '❌ Inactive'}\n\n`;
  
  if (enabled) {
    message += `🎉 Gateway siap digunakan!\n\n` +
      `⚠️ *Note:* Gateway lain otomatis dinonaktifkan.\n` +
      `Hanya 1 gateway aktif dalam 1 waktu.`;
  } else {
    message += `⚠️ Gateway tidak tersedia untuk user`;
  }
  
  ctx.reply(message, { parse_mode: 'Markdown' });
};

module.exports = paymentGatewayHandler;
