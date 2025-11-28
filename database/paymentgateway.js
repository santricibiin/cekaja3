const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'paymentgateway.json');

const initDB = () => {
  if (!fs.existsSync(dbPath)) {
    const defaultSettings = {
      nobu: { enabled: true, name: 'Nobu Bank', icon: '🏦' },
      dana: { enabled: false, name: 'DANA QRIS', icon: '⚡' }
    };
    fs.writeFileSync(dbPath, JSON.stringify(defaultSettings, null, 2));
  }
};

const readDB = () => {
  initDB();
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {
      nobu: { enabled: true, name: 'Nobu Bank', icon: '🏦' },
      dana: { enabled: false, name: 'DANA QRIS', icon: '⚡' }
    };
  }
};

const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// Get payment gateway settings
const getGatewaySettings = () => {
  return readDB();
};

// Get enabled gateways
const getEnabledGateways = () => {
  const settings = readDB();
  return Object.entries(settings)
    .filter(([key, value]) => value.enabled)
    .map(([key, value]) => ({ code: key, ...value }));
};

// Check if gateway is enabled
const isGatewayEnabled = (gateway) => {
  const settings = readDB();
  return settings[gateway]?.enabled || false;
};

// Toggle gateway on/off
const toggleGateway = (gateway, enabled) => {
  const settings = readDB();
  
  if (!settings[gateway]) {
    return { success: false, message: `Gateway '${gateway}' tidak ditemukan` };
  }
  
  // If turning ON, turn OFF all others
  if (enabled) {
    Object.keys(settings).forEach(key => {
      settings[key].enabled = (key === gateway);
    });
  } else {
    settings[gateway].enabled = false;
  }
  
  writeDB(settings);
  
  return { 
    success: true, 
    gateway: gateway,
    enabled: enabled,
    name: settings[gateway].name
  };
};

module.exports = {
  getGatewaySettings,
  getEnabledGateways,
  isGatewayEnabled,
  toggleGateway
};
