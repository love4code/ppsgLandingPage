const nodemailer = require('nodemailer');

let transporter = null;

const initTransporter = () => {
  if (transporter) return transporter;
  
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  
  return transporter;
};

const sendContactEmail = async (submission) => {
  try {
    const emailTransporter = initTransporter();
    
    // Build subject line
    let subject = 'New Lead - Aquarian Pool and Spa';
    if (submission.productName) {
      subject = `Product Inquiry: ${submission.productName} - Aquarian Pool and Spa`;
    }
    
    // Build product info section
    let productInfo = '';
    if (submission.productName) {
      productInfo = `
        <p><strong>Product:</strong> ${submission.productName}</p>
        ${submission.selectedSize ? `<p><strong>Selected Size:</strong> ${submission.selectedSize}</p>` : ''}
      `;
    }
    
    const mailOptions = {
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: process.env.MAIL_TO || 'aquarianpoolandspa@gmail.com',
      subject: subject,
      html: `
        <h2>${submission.productName ? 'Product Inquiry' : 'New Contact Form Submission'}</h2>
        ${productInfo}
        <p><strong>Name:</strong> ${submission.name}</p>
        <p><strong>Email:</strong> ${submission.email}</p>
        <p><strong>Phone:</strong> ${submission.phone || 'Not provided'}</p>
        <p><strong>Town/City:</strong> ${submission.town}</p>
        <p><strong>Message:</strong></p>
        <p>${submission.message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>Submitted: ${submission.createdAt.toLocaleString()}</small></p>
      `
    };
    
    await emailTransporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

module.exports = {
  sendContactEmail
};

