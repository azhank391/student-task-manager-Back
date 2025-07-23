const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const emailConfig = require("../config/email");

class EmailService {
  constructor() {
    this.OAuth2 = google.auth.OAuth2;
    this.createTransporter();
  }

  async createTransporter() {
    const oauth2Client = new this.OAuth2(
      emailConfig.gmail.clientId,
      emailConfig.gmail.clientSecret,
      "https://developers.google.com/oauthplayground"
    );
    oauth2Client.setCredentials({
      refresh_token: emailConfig.gmail.refreshToken,
    });
    const accessToken = await oauth2Client.getAccessToken();
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: emailConfig.gmail.from,
        clientId: emailConfig.gmail.clientId,
        clientSecret: emailConfig.gmail.clientSecret,
        refreshToken: emailConfig.gmail.refreshToken,
        accessToken: accessToken.token,
      },
      tls: {
        rejectUnauthorized: false, // allow self-signed certs
      },
    });
  }

  async sendWelcomeEmail(userEmail, userName) {
    const mailOptions = {
      from: emailConfig.gmail.from,
      to: userEmail,
      subject: "Welcome to Task Manager",
      html: `<h2>Welcome to Task Manager, ${userName}!</h2>
        <p>Thank you for joining our task management platform.</p>
        <p>You can now start organizing your tasks and boosting your productivity!</p>
        <p>Best regards,<br>The Task Manager Team</p>`,
    };
    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", result);
      return result;
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }
}

module.exports = new EmailService();
