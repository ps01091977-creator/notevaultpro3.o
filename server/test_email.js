const sendEmail = require('./utils/sendEmail');
require('dotenv').config();

async function testEmail() {
  try {
    await sendEmail({
      email: 'ps01091977@gmail.com',
      subject: 'Nodemailer sendEmail.js Test',
      message: 'If you receive this, the modified sendEmail.js works perfectly!',
      html: '<h3>Test Successful</h3><p>Nodemailer sendEmail.js is working with host smtp.gmail.com!</p>'
    });
    console.log('Email sent successfully via utils/sendEmail.js!');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

testEmail();
