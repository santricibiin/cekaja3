const { getAllUsers } = require('../../database/users');

const broadcastHandler = async (ctx) => {
  const reply = ctx.message.reply_to_message;
  const text = ctx.message.text.replace('/broadcast', '').trim();
  
  // Check if reply to photo or has text
  if (!reply?.photo && !text) {
    return ctx.reply('❌ Format:\n• /broadcast <pesan>\n• Reply gambar + /broadcast <caption>');
  }
  
  const users = getAllUsers();
  let success = 0, failed = 0;
  
  await ctx.reply(`📢 Mengirim ke ${users.length} user...`);
  
  for (const user of users) {
    try {
      if (reply?.photo) {
        const photoId = reply.photo[reply.photo.length - 1].file_id;
        await ctx.telegram.sendPhoto(user.id, photoId, { caption: text || '' });
      } else {
        await ctx.telegram.sendMessage(user.id, text);
      }
      success++;
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch {
      failed++;
    }
  }
  
  ctx.reply(`✅ Selesai!\n✔️ Sukses: ${success}\n❌ Gagal: ${failed}`);
};

module.exports = broadcastHandler;
