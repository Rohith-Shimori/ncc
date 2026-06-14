const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const enabled = process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true';
const senderEmail = process.env.SMTP_FROM || 'noreply@ncc-digital-training.gov.in';

const logFilePath = path.join(__dirname, '../../logs/sent_emails.log');

const logDir = path.dirname(logFilePath);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

let transporter = null;

const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

if (host && port && user && pass) {
  console.log('[Nodemailer Config] Live SMTP Config found. Initializing real mail transporter...');
  transporter = nodemailer.createTransport({
    host,
    port: parseInt(port, 10),
    secure: parseInt(port, 10) === 465,
    auth: {
      user,
      pass
    }
  });
} else {
  console.log('[Nodemailer Config] No SMTP Config found. Defaulting to safe simulation (local log mode)...');
}

const sendEmailAlert = async ({ to, subject, html }) => {
  if (!enabled) {
    console.log(`[Nodemailer Config] Email notifications disabled. Skipped sending email to ${to}`);
    return;
  }

  const mailOptions = {
    from: `"NCC Digital Training" <${senderEmail}>`,
    to,
    subject,
    html
  };

  const timestamp = new Date().toISOString();
  const logMessage = `
========================================
TIMESTAMP: ${timestamp}
FROM: ${mailOptions.from}
TO: ${to}
SUBJECT: ${subject}
BODY:
${html}
========================================
`;
  
  try {
    fs.appendFileSync(logFilePath, logMessage, 'utf8');
    console.log(`[Nodemailer] Logged email to ${to} in backend/logs/sent_emails.log`);
  } catch (err) {
    console.error('[Nodemailer] Failed to write email log file:', err);
  }

  if (transporter) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[Nodemailer] Live email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error(`[Nodemailer] Error sending live email to ${to}:`, error);
    }
  } else {
    console.log(`[Nodemailer] [SIMULATED] Email would be sent to ${to}.`);
  }
};

module.exports = {
  sendEmailAlert
};
