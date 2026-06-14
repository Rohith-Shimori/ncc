const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

let vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY
};

// Generate VAPID keys if they are missing
if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
  console.log('[WebPush] VAPID keys are missing in environment variables. Generating new keys...');
  const keys = webpush.generateVAPIDKeys();
  vapidKeys = {
    publicKey: keys.publicKey,
    privateKey: keys.privateKey
  };
  
  try {
    const envPath = path.join(__dirname, '../../.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Clean any empty entries or append
    envContent = envContent.replace(/VAPID_PUBLIC_KEY=.*/g, '').replace(/VAPID_PRIVATE_KEY=.*/g, '');
    envContent += `\nVAPID_PUBLIC_KEY=${keys.publicKey}\nVAPID_PRIVATE_KEY=${keys.privateKey}\n`;
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('[WebPush] Dynamic VAPID keys written successfully to backend/.env');
  } catch (err) {
    console.warn('[WebPush] Could not write generated VAPID keys to backend/.env:', err.message);
  }
}

// Set Web Push VAPID details
webpush.setVapidDetails(
  'mailto:support@ncc-digital-training.org',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

module.exports = {
  webpush,
  vapidKeys
};
