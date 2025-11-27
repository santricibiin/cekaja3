const express = require('express');
const fs = require('fs');
const path = require('path');

class NobuAPI {
    constructor() {
        this.pendingDeposits = new Map();
    }

    // Setup notification endpoint
    setupEndpoint(app, bot) {
        // Health check endpoint
        app.get('/api/nobu-callback', (req, res) => {
            res.status(200).json({ 
                status: 'ok',
                message: 'NOBU callback endpoint is running',
                pendingDeposits: this.pendingDeposits.size
            });
        });

        // Notification handler endpoint
        app.post('/api/nobu-callback', express.json(), express.urlencoded({ extended: true }), async (req, res) => {
            try {
                console.log('\n==================== NOBU CALLBACK ====================');
                console.log('📥 Request received at:', new Date().toISOString());
                console.log('📦 Body:', JSON.stringify(req.body, null, 2));
                console.log('📋 Headers:', JSON.stringify(req.headers, null, 2));
                
                console.log('📥 Request received at:', new Date().toISOString());
                console.log('📦 Body:', JSON.stringify(req.body, null, 2));
                console.log('📋 Headers:', JSON.stringify(req.headers, null, 2));
                
                let notification = req.body;
                
                if (!notification || typeof notification !== 'object') {
                    console.error('❌ Invalid notification format');
                    console.log('======================================================\n');
                    return res.status(400).json({ success: false, message: 'Invalid notification format' });
                }

                const formattedNotification = {
                    name: notification.name || '',
                    pkg: notification.pkg || '',
                    title: notification.title || '',
                    text: notification.text || '',
                    subtext: notification.subtext || ''
                };
                
                console.log('📱 Formatted notification:');
                console.log('   - Name:', formattedNotification.name);
                console.log('   - Package:', formattedNotification.pkg);
                console.log('   - Title:', formattedNotification.title);
                console.log('   - Text:', formattedNotification.text);
                
                if (formattedNotification.pkg !== 'com.bnc.finance') {
                    console.log('⚠️  Not Nobu Bank notification, ignored');
                    console.log('======================================================\n');
                    return res.json({ success: true, message: 'Not a Nobu notification, ignored' });
                }

                const amountMatch = formattedNotification.text?.match(/Rp(\d+)\s+akan\s+dikreditkan/i);
                if (!amountMatch) {
                    console.log('❌ Amount not found in text');
                    console.log('   Text received:', formattedNotification.text);
                    console.log('======================================================\n');
                    return res.status(400).json({ success: false, message: 'Invalid amount format' });
                }

                const amount = parseInt(amountMatch[1]);
                console.log('💰 Amount detected:', amount);
                
                let foundDeposit = null;
                let foundDepositId = null;

                console.log('🔍 Searching in', this.pendingDeposits.size, 'pending deposits:');
                for (const [depositId, deposit] of this.pendingDeposits.entries()) {
                    console.log(`\n   Deposit: ${depositId}`);
                    console.log(`     Username: ${deposit.username}`);
                    console.log(`     Nominal: ${deposit.nominal}`);
                    console.log(`     Kode Unik: ${deposit.kodeUnik}`);
                    console.log(`     Total Amount: ${deposit.totalAmount}`);
                    console.log(`     Match: ${deposit.totalAmount === amount ? '✅ YES' : '❌ NO'}`);
                    
                    if (deposit.totalAmount === amount) {
                        foundDeposit = deposit;
                        foundDepositId = depositId;
                        console.log('   >>> MATCH FOUND! <<<');
                        break;
                    }
                }

                if (!foundDeposit) {
                    console.log('\n❌ NO MATCHING DEPOSIT FOUND!');
                    console.log('   Looking for amount:', amount);
                    console.log('======================================================\n');
                    return res.status(404).json({ success: false, message: 'Deposit not found' });
                }
                
                console.log('\n✅ Deposit matched! Processing payment...');
                
                console.log('\n✅ Deposit matched! Processing payment...');
                
                try {
                    const { findUser } = require('../../../../utils/database');
                    const user = findUser(foundDeposit.userId);
                    
                    if (!user) {
                        console.log('❌ User not found:', foundDeposit.userId);
                        console.log('======================================================\n');
                        return res.status(404).json({ success: false, message: 'User not found' });
                    }

                    console.log('👤 User found:', user.username);

                    const usersDir = path.join(__dirname, '../../../../database/datauser');
                    const userFilePath = path.join(usersDir, `${user.username}.json`);
                    
                    if (fs.existsSync(userFilePath)) {
                        const userData = JSON.parse(fs.readFileSync(userFilePath, 'utf8'));
                        const oldBalance = userData.balance || 0;
                        userData.balance = oldBalance + foundDeposit.nominal;
                        fs.writeFileSync(userFilePath, JSON.stringify(userData, null, 2));

                        console.log('💰 Balance updated:');
                        console.log('   Old balance:', oldBalance);
                        console.log('   Added:', foundDeposit.nominal);
                        console.log('   New balance:', userData.balance);

                        const depositDir = path.join(__dirname, '../../../../database/deposit/nobu');
                        const depositFile = path.join(depositDir, `${user.username || foundDeposit.userId}.json`);
                        
                        if (fs.existsSync(depositFile)) {
                            const deposits = JSON.parse(fs.readFileSync(depositFile, 'utf8'));
                            const depositIndex = deposits.findIndex(d => d.reffId === foundDeposit.reffId);
                            
                            if (depositIndex !== -1) {
                                deposits[depositIndex].status = 'success';
                                deposits[depositIndex].completedAt = new Date().toISOString();
                                deposits[depositIndex].paymentDetails = {
                                    title: formattedNotification.title,
                                    text: formattedNotification.text
                                };
                                fs.writeFileSync(depositFile, JSON.stringify(deposits, null, 2));
                                console.log('📝 Deposit status updated in database');
                            }
                        }

                        this.pendingDeposits.delete(foundDepositId);
                        console.log('🗑️  Removed from pending deposits');

                        if (foundDeposit.messageToDelete) {
                            try {
                                await bot.telegram.deleteMessage(
                                    foundDeposit.userId,
                                    foundDeposit.messageToDelete
                                );
                                console.log('🗑️  QR message deleted');
                            } catch (error) {
                                console.log('⚠️  Could not delete QR message:', error.message);
                            }
                        }

                        await bot.telegram.sendMessage(
                            foundDeposit.userId,
                            `✅ *ᴅᴇᴘᴏꜱɪᴛ ʙᴇʀʜᴀꜱɪʟ*\n\n` +
                            `💰 ɴᴏᴍɪɴᴀʟ: Rp ${foundDeposit.nominal.toLocaleString()}\n` +
                            `🔢 ᴋᴏᴅᴇ ᴜɴɪᴋ: +Rp ${foundDeposit.kodeUnik}\n` +
                            `💳 ᴛᴏᴛᴀʟ ʙᴀʏᴀʀ: Rp ${foundDeposit.totalAmount.toLocaleString()}\n` +
                            `🏦 ᴍᴇᴛᴏᴅᴇ: QRIS (Nobu Bank)\n\n` +
                            `🆔 ʀᴇꜰ: \`${foundDeposit.reffId}\`\n` +
                            `📅 ᴡᴀᴋᴛᴜ: ${new Date().toLocaleString('id-ID')}\n\n` +
                            `🎉 ꜱᴀʟᴅᴏ ʙᴀʀᴜ: *Rp ${userData.balance.toLocaleString()}*`,
                            { parse_mode: 'Markdown' }
                        );
                        
                        console.log('✅ Success message sent to user');
                        console.log('✅ ᴅᴇᴘᴏꜱɪᴛ ʙᴇʀʜᴀꜱɪʟ -', user.username, '+Rp', foundDeposit.nominal.toLocaleString());
                        console.log('======================================================\n');

                        return res.json({ success: true, message: 'Deposit processed successfully' });
                    } else {
                        console.log('❌ User file not found:', userFilePath);
                        console.log('======================================================\n');
                        return res.status(404).json({ success: false, message: 'User file not found' });
                    }
                } catch (error) {
                    console.error('❌ Error processing deposit:', error);
                    console.log('======================================================\n');
                    return res.status(500).json({ success: false, message: error.message });
                }

            } catch (error) {
                console.error('❌ Fatal error:', error);
                console.log('======================================================\n');
                return res.status(500).json({ success: false, message: error.message });
            }
        });
    }

    // Add pending deposit with logging
    addPendingDeposit(depositId, depositData) {
        this.pendingDeposits.set(depositId, depositData);
    }

    // Remove pending deposit with logging
    removePendingDeposit(depositId) {
        return this.pendingDeposits.delete(depositId);
    }

    // Get pending deposit info
    getPendingDeposit(depositId) {
        return this.pendingDeposits.get(depositId);
    }

    // Get all pending deposits
    getAllPendingDeposits() {
        return Array.from(this.pendingDeposits.entries());
    }
}

module.exports = NobuAPI;
