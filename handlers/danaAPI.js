const express = require('express');

class DanaAPI {
    constructor() {
        this.pendingPayments = new Map();
    }

    setupEndpoint(app, bot) {
        app.get('/api/dana-callback', (req, res) => {
            res.status(200).json({ 
                status: 'ok',
                message: 'DANA callback endpoint is running',
                pendingPayments: this.pendingPayments.size
            });
        });

        app.post('/api/dana-callback', express.json(), express.urlencoded({ extended: true }), async (req, res) => {
            try {
                console.log('\n==================== DANA CALLBACK ====================');
                console.log('📥 Request received at:', new Date().toISOString());
                console.log('📦 Body:', JSON.stringify(req.body, null, 2));
                
                let notification = req.body;
                
                if (!notification || typeof notification !== 'object') {
                    console.error('❌ Invalid notification format');
                    console.log('======================================================\n');
                    return res.status(400).json({ success: false, message: 'Invalid notification format' });
                }

                const formattedNotification = {
                    pkg: notification.pkg || '',
                    title: notification.title || '',
                    text: notification.text || ''
                };
                
                console.log('📱 Formatted notification:');
                console.log('   - Package:', formattedNotification.pkg);
                console.log('   - Title:', formattedNotification.title);
                console.log('   - Text:', formattedNotification.text);
                
                // Check if it's DANA notification
                const isDanaPackage = formattedNotification.pkg === 'id.dana';
                const isDanaText = formattedNotification.text?.includes('menerima Rp') || 
                                   formattedNotification.text?.includes('via Gopay');
                
                if (!isDanaPackage && !isDanaText) {
                    console.log('⚠️  Not DANA notification, ignored');
                    console.log('======================================================\n');
                    return res.json({ success: true, message: 'Not a DANA notification, ignored' });
                }
                
                console.log('✅ DANA notification confirmed (pkg:', isDanaPackage, 'text:', isDanaText, ')');

                // Parse amount from DANA notification format
                // Format: "Kamu berhasil menerima Rp[amount] via Gopay ke akunmu"
                // Amount can have separators: Rp1.336 or Rp1,336 or Rp1336
                const amountMatch = formattedNotification.text?.match(/menerima Rp([\d.,]+)/);
                if (!amountMatch) {
                    console.log('❌ Amount not found in text');
                    console.log('   Full text:', formattedNotification.text);
                    console.log('======================================================\n');
                    return res.status(400).json({ success: false, message: 'Invalid amount format' });
                }

                // Remove separators (dots/commas) and parse
                const amountString = amountMatch[1].replace(/[.,]/g, '');
                const amount = parseInt(amountString);
                console.log('💰 Amount detected:', amount, '(raw:', amountMatch[1], ')');
                
                let foundPayment = null;
                let foundPaymentId = null;

                console.log('🔍 Searching in', this.pendingPayments.size, 'pending payments:');
                for (const [paymentId, payment] of this.pendingPayments.entries()) {
                    console.log(`\n   Payment: ${paymentId}`);
                    console.log(`     User ID: ${payment.userId}`);
                    console.log(`     Type: ${payment.type || 'product'}`);
                    console.log(`     Total: ${payment.total}`);
                    console.log(`     Match: ${payment.total === amount ? '✅ YES' : '❌ NO'}`);
                    
                    if (payment.total === amount) {
                        foundPayment = payment;
                        foundPaymentId = paymentId;
                        console.log('   >>> MATCH FOUND! <<<');
                        break;
                    }
                }

                if (!foundPayment) {
                    console.log('\n❌ NO MATCHING PAYMENT FOUND!');
                    console.log('   Looking for amount:', amount);
                    console.log('======================================================\n');
                    return res.status(404).json({ success: false, message: 'Payment not found' });
                }
                
                console.log('\n✅ Payment matched! Processing...');
                console.log('   Payment type:', foundPayment.type || 'product');
                
                try {
                    const { getUser, updateBalance } = require('../database/users');
                    
                    const user = getUser(foundPayment.userId);
                    
                    if (!user) {
                        console.log('❌ User not found:', foundPayment.userId);
                        console.log('======================================================\n');
                        return res.status(404).json({ success: false, message: 'User not found' });
                    }

                    console.log('👤 User found:', user.username);
                    
                    // Check if this is a deposit
                    if (foundPayment.type === 'deposit') {
                        console.log('💳 Processing DEPOSIT...');
                        
                        // Add balance to user
                        updateBalance(foundPayment.userId, foundPayment.amount);
                        console.log(`✅ Balance added: Rp ${foundPayment.amount.toLocaleString('id-ID')}`);
                        
                        // Remove from pending
                        this.pendingPayments.delete(foundPaymentId);
                        console.log('🗑️  Removed from pending payments');
                        
                        // Delete QRIS message
                        if (foundPayment.messageToDelete) {
                            try {
                                await bot.telegram.deleteMessage(foundPayment.userId, foundPayment.messageToDelete);
                                console.log('🗑️  QRIS message deleted');
                            } catch (err) {
                                console.log('⚠️  Could not delete QRIS message:', err.message);
                            }
                        }
                        
                        // Send success notification
                        const { Markup } = require('telegraf');
                        await bot.telegram.sendMessage(
                            foundPayment.userId,
                            `✅ *ᴅᴇᴘᴏꜱɪᴛ ʙᴇʀʜᴀꜱɪʟ*\n\n` +
                            `⚡ *DANA QRIS*\n\n` +
                            `💰 ᴊᴜᴍʟᴀʜ: Rp ${foundPayment.amount.toLocaleString('id-ID')}\n` +
                            `🔢 ᴋᴏᴅᴇ ᴜɴɪᴋ: +Rp ${foundPayment.uniqueCode}\n` +
                            `💳 ᴛᴏᴛᴀʟ ʙᴀʏᴀʀ: Rp ${foundPayment.total.toLocaleString('id-ID')}\n\n` +
                            `💰 *ꜱᴀʟᴅᴏ ꜱᴇᴋᴀʀᴀɴɢ: Rp ${(user.balance + foundPayment.amount).toLocaleString('id-ID')}*\n\n` +
                            `🆔 ʀᴇꜰ: \`${foundPaymentId}\`\n` +
                            `📅 ᴡᴀᴋᴛᴜ: ${new Date().toLocaleString('id-ID')}\n\n` +
                            `🎉 ᴛᴇʀɪᴍᴀ ᴋᴀꜱɪʜ!\n\n` +
                            `💡 Ketik /start untuk kembali ke menu`,
                            { 
                                parse_mode: 'Markdown',
                                reply_markup: Markup.keyboard([
                                    [Markup.button.text('💳 Deposit Saldo'), Markup.button.text('📦 All Stock')],
                                    [Markup.button.text('📖 Cara Order'), Markup.button.text('👤 Admin')]
                                ]).resize().reply_markup
                            }
                        );
                        
                        console.log('✅ DEPOSIT BERHASIL -', user.username, '+Rp', foundPayment.amount.toLocaleString('id-ID'));
                        
                        // Notify admin
                        const { adminId } = require('../config/config');
                        try {
                            await bot.telegram.sendMessage(adminId, `⚡ Deposit DANA Berhasil!\n\n👤 User: ${user.username}\n🆔 ID: ${foundPayment.userId}\n💰 Jumlah: Rp ${foundPayment.amount.toLocaleString('id-ID')}\n💳 Total Bayar: Rp ${foundPayment.total.toLocaleString('id-ID')}`);
                        } catch (error) {}
                        
                        console.log('======================================================\n');
                        
                        return res.json({ 
                            success: true, 
                            message: 'Deposit successful',
                            type: 'deposit',
                            amount: foundPayment.amount 
                        });
                    }
                    
                    // Process product purchase (similar to deposit, for future use)
                    console.log('📦 Processing PRODUCT PURCHASE...');
                    const { useStock } = require('../database/stocks');
                    const { incrementSold } = require('../database/soldcount');

                    console.log('📦 Attempting to get stock for:', foundPayment.productCode, 'qty:', foundPayment.quantity);
                    const stocks = useStock(foundPayment.productCode, foundPayment.quantity);
                    
                    if (!stocks || stocks.length === 0) {
                        console.log('❌ Failed to get stock');
                        await bot.telegram.sendMessage(
                            foundPayment.userId,
                            `❌ *ᴘᴇᴍʙᴀʏᴀʀᴀɴ ᴅɪᴛᴇʀɪᴍᴀ*\n\n⚠️ ꜱᴛᴏᴋ ᴛɪᴅᴀᴋ ᴛᴇʀꜱᴇᴅɪᴀ!\n\n💰 ᴛᴏᴛᴀʟ: Rp ${foundPayment.total.toLocaleString('id-ID')}\n📦 ᴘʀᴏᴅᴜᴋ: ${foundPayment.productName}\n\n🙏 ʜᴜʙᴜɴɢɪ ᴀᴅᴍɪɴ ᴜɴᴛᴜᴋ ᴘᴇɴɢᴇᴍʙᴀʟɪᴀɴ ᴅᴀɴᴀ.\n🆔 ʀᴇꜰ: \`${foundPaymentId}\``,
                            { parse_mode: 'Markdown' }
                        );
                        console.log('======================================================\n');
                        return res.status(500).json({ success: false, message: 'Stock not available' });
                    }
                    
                    // Check bonus
                    const { getBonus } = require('../database/bonus');
                    const bonus = getBonus(foundPayment.productCode);
                    let bonusStocks = [];
                    if (bonus && foundPayment.quantity >= bonus.minPurchase) {
                        bonusStocks = useStock(foundPayment.productCode, bonus.bonusAmount) || [];
                    }

                    this.pendingPayments.delete(foundPaymentId);
                    
                    // Track transaction & sold count
                    const { addTransaction } = require('../database/transactions');
                    addTransaction(foundPayment.userId, user.username, 'dana', foundPayment.productName, foundPayment.quantity, foundPayment.total);
                    
                    if (foundPayment.productCode) {
                        incrementSold(foundPayment.productCode, foundPayment.quantity);
                    }

                    if (foundPayment.messageToDelete) {
                        try {
                            await bot.telegram.deleteMessage(foundPayment.userId, foundPayment.messageToDelete);
                        } catch (error) {}
                    }

                    let accountDetails = '';
                    stocks.forEach((stock, index) => {
                        accountDetails += `\n${index + 1}. ${stock.detail}`;
                    });
                    
                    if (bonusStocks.length > 0) {
                        accountDetails += `\n\n🎁 BONUS:`;
                        bonusStocks.forEach((stock, index) => {
                            accountDetails += `\n${stocks.length + index + 1}. ${stock.detail}`;
                        });
                    }

                    await bot.telegram.sendMessage(
                        foundPayment.userId,
                        `✅ *ᴘᴇᴍʙᴇʟɪᴀɴ ʙᴇʀʜᴀꜱɪʟ*\n\n` +
                        `⚡ *DANA QRIS*\n\n` +
                        `📦 ᴘʀᴏᴅᴜᴋ: ${foundPayment.productName}\n` +
                        `📦 ᴊᴜᴍʟᴀʜ: ${foundPayment.quantity}\n` +
                        `💰 ᴛᴏᴛᴀʟ: Rp ${foundPayment.total.toLocaleString('id-ID')}\n\n` +
                        `🎉 ᴛᴇʀɪᴍᴀ ᴋᴀꜱɪʜ!`,
                        { parse_mode: 'Markdown' }
                    );

                    await bot.telegram.sendMessage(
                        foundPayment.userId,
                        `🎉 Detail Akun:\n${accountDetails}\n\n⚠️ Simpan data ini dengan baik!`
                    );
                    
                    console.log('======================================================\n');
                    res.json({ success: true });

                } catch (error) {
                    console.error('❌ Error processing payment:', error);
                    console.log('======================================================\n');
                    res.status(500).json({ success: false, message: error.message });
                }
                
            } catch (error) {
                console.error('❌ Callback error:', error);
                res.status(500).json({ success: false });
            }
        });
    }

    addPendingPayment(paymentId, paymentData) {
        this.pendingPayments.set(paymentId, paymentData);
    }
}

module.exports = DanaAPI;
