const transporter = require('../config/email');

const templates = {
  reviewerAssigned: (authorName, paperTitle) => ({
    subject: 'Your paper is now under review — ScholarX',
    html: `<p>Hi ${authorName},</p><p>Reviewers have been assigned to <strong>${paperTitle}</strong>. You will be notified once a decision is made.</p>`,
  }),
  decisionMade: (authorName, paperTitle, decision, note) => ({
    subject: `Editorial decision on your paper — ScholarX`,
    html: `<p>Hi ${authorName},</p><p>A decision has been made on <strong>${paperTitle}</strong>: <strong>${decision.toUpperCase()}</strong></p>${note ? `<p>Editor note: ${note}</p>` : ''}`,
  }),
  paperPublished: (authorName, paperTitle, doi) => ({
    subject: 'Your paper has been published — ScholarX',
    html: `<p>Congratulations ${authorName}!</p><p><strong>${paperTitle}</strong> is now published.</p><p>DOI: ${doi}</p>`,
  }),
};

exports.sendEmail = async (to, templateName, ...args) => {
  try {
    const t = templates[templateName](...args);
    await transporter.sendMail({ from: `"ScholarX" <${process.env.EMAIL_USER}>`, to, ...t });
  } catch (err) {
    console.error('Email failed:', err.message);
  }
};
