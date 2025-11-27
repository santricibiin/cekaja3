const { Markup } = require('telegraf');
const { getAllUsers } = require('../../database/users');

// State untuk menyimpan halaman saat ini per user
const userPages = {};

const listUsrHandler = async (ctx) => {
  const users = getAllUsers();
  
  if (users.length === 0) {
    return ctx.reply('❌ Belum ada user terdaftar.');
  }
  
  // Reset ke halaman pertama
  const page = 0;
  userPages[ctx.from.id] = page;
  
  await sendUserList(ctx, users, page);
};

const sendUserList = async (ctx, users, page) => {
  const maxPerPage = 10;
  const totalPages = Math.ceil(users.length / maxPerPage);
  const startIndex = page * maxPerPage;
  const endIndex = startIndex + maxPerPage;
  const pageUsers = users.slice(startIndex, endIndex);
  
  let message = `👥 *ᴅᴀꜰᴛᴀʀ ᴜꜱᴇʀ*\n\n`;
  message += `Total: ${users.length} user\n`;
  message += `📄 Halaman ${page + 1}/${totalPages}\n\n`;
  
  pageUsers.forEach((user, index) => {
    const globalIndex = startIndex + index + 1;
    message += `${globalIndex}. @${user.username || 'Unknown'}\n`;
    message += `   👤 ID: \`${user.id}\`\n`;
    message += `   📅 Bergabung: ${new Date(user.joinedAt).toLocaleDateString('id-ID')}\n\n`;
  });
  
  // Build pagination buttons
  const buttons = [];
  
  if (totalPages > 1) {
    const navRow = [];
    
    if (page > 0) {
      navRow.push(Markup.button.callback('◀️ Prev', `listusr_page_${page - 1}`));
    }
    
    navRow.push(Markup.button.callback(`${page + 1}/${totalPages}`, 'listusr_page_info'));
    
    if (page < totalPages - 1) {
      navRow.push(Markup.button.callback('Next ▶️', `listusr_page_${page + 1}`));
    }
    
    buttons.push(navRow);
  }
  
  const keyboard = buttons.length > 0 ? Markup.inlineKeyboard(buttons) : undefined;
  
  if (ctx.callbackQuery) {
    // Edit message jika dari callback
    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      ...keyboard
    });
  } else {
    // Reply baru jika dari command
    await ctx.reply(message, {
      parse_mode: 'Markdown',
      ...keyboard
    });
  }
};

// Handler untuk navigasi pagination
const listUsrPageHandler = async (ctx) => {
  const page = parseInt(ctx.match[1]);
  await ctx.answerCbQuery();
  
  const users = getAllUsers();
  userPages[ctx.from.id] = page;
  
  await sendUserList(ctx, users, page);
};

// Handler untuk tombol info (tidak melakukan apa-apa)
const listUsrPageInfoHandler = async (ctx) => {
  await ctx.answerCbQuery('Info halaman');
};

module.exports = {
  listUsrHandler,
  listUsrPageHandler,
  listUsrPageInfoHandler
};
