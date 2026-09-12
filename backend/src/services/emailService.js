const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: config.EMAIL_HOST,
      port: config.EMAIL_PORT,
      secure: false,
      auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS,
      },
    });
  }

  async sendEmail(options) {
    try {
      const mailOptions = {
        from: `${config.FROM_NAME} <${config.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Email sending failed:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(email, name) {
    const message = `Welcome to our application, ${name}!`;
    const html = `<h1>Welcome to our application, ${name}!</h1>`;

    await this.sendEmail({
      email,
      subject: 'Welcome to Our App',
      message,
      html,
    });
  }

  async sendPasswordResetEmail(email, resetToken) {
    const resetUrl = `${config.CLIENT_URL}/reset-password/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
    const html = `<p>You are receiving this email because you (or someone else) has requested the reset of a password.</p><p>Please click <a href="${resetUrl}">here</a> to reset your password.</p>`;

    await this.sendEmail({
      email,
      subject: 'Password Reset Token',
      message,
      html,
    });
  }
}

module.exports = new EmailService();
