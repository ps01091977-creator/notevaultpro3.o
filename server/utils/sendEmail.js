const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  let transporter;
  let isTestAccount = false;

  // SMTP validation check in production/staging
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
      throw new Error('SMTP credentials (EMAIL_USER or EMAIL_PASS) are missing in the server environment variables.');
    }
  }

  // Use real credentials if available, otherwise generate a test account dynamically
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // Use SSL/TLS for standard SMTP port 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Dynamically create a test account on ethereal.email
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
    isTestAccount = true;
  }

  // Force from address to align with EMAIL_USER to pass spam filters (SPF/DKIM alignment)
  const fromName = 'NoteVault Pro';
  const fromEmail = isTestAccount ? (process.env.EMAIL_FROM || 'noreply@notevaultpro.com') : process.env.EMAIL_USER;

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  const info = await transporter.sendMail(mailOptions);

  if (isTestAccount) {
    console.log(`\n=== 📧 TEST EMAIL SENT 📧 ===`);
    console.log(`To view the OTP email visually, click the link below:`);
    console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    console.log(`===============================\n`);
  }
};

module.exports = sendEmail;
