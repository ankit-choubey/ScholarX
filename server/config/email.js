const nodemailer = require('nodemailer');

// Use a no-op transporter if email isn't configured (placeholder values)
const isConfigured = (
  process.env.EMAIL_USER &&
  process.env.EMAIL_USER !== 'your_email@gmail.com' &&
  process.env.EMAIL_PASS &&
  process.env.EMAIL_PASS !== 'your_app_password'
);

let transporter;

if (isConfigured) {
  transporter = nodemailer.createTransport({
    host:   process.env.EMAIL_HOST || 'smtp.gmail.com',
    port:   Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth:   { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
} else {
  // Stub transporter — logs emails to console instead of sending
  console.log('Email: not configured — emails will be logged to console only.');
  transporter = {
    sendMail: async (opts) => {
      console.log(`[EMAIL STUB] To: ${opts.to} | Subject: ${opts.subject}`);
      return { messageId: 'stub' };
    },
  };
}

module.exports = transporter;
