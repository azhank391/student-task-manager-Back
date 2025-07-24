const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const emailConfig = require("../config/email");

class EmailService {
  constructor() {
    this.OAuth2 = google.auth.OAuth2;
    this.oauth2Client = null;
    this.transporter = null;
    this.tokenRefreshBuffer = 5 * 60 * 1000; // Refresh 5 minutes before expiry
    this.lastTokenRefresh = 0;
    this.initializeOAuth2Client();
  }

  initializeOAuth2Client() {
    this.oauth2Client = new this.OAuth2(
      emailConfig.gmail.clientId,
      emailConfig.gmail.clientSecret,
      "https://developers.google.com/oauthplayground"
    );
    
    this.oauth2Client.setCredentials({
      refresh_token: emailConfig.gmail.refreshToken,
    });
  }

  async getValidAccessToken() {
    try {
      // Check if we need to refresh the token
      const now = Date.now();
      const credentials = this.oauth2Client.credentials;
      
      // If no access token or it's about to expire, refresh it
      if (!credentials.access_token || 
          !credentials.expiry_date || 
          credentials.expiry_date - now < this.tokenRefreshBuffer ||
          now - this.lastTokenRefresh > 55 * 60 * 1000) { // Refresh every 55 minutes
        
        console.log('Refreshing access token...');
        const { credentials: newCredentials } = await this.oauth2Client.refreshAccessToken();
        this.oauth2Client.setCredentials(newCredentials);
        this.lastTokenRefresh = now;
        
        console.log('Access token refreshed successfully');
        return newCredentials.access_token;
      }
      
      return credentials.access_token;
    } catch (error) {
      if (error.message && error.message.includes('invalid_grant')) {
        throw new Error('REFRESH_TOKEN_EXPIRED: Please re-authenticate the application. The refresh token has expired or been revoked.');
      }
      console.error('Error getting access token:', error);
      throw error;
    }
  }

  async createTransporter() {
    try {
      const accessToken = await this.getValidAccessToken();
      
      this.transporter = nodemailer.createTransporter({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: emailConfig.gmail.from,
          clientId: emailConfig.gmail.clientId,
          clientSecret: emailConfig.gmail.clientSecret,
          refreshToken: emailConfig.gmail.refreshToken,
          accessToken: accessToken,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      // Verify the transporter
      await this.transporter.verify();
      console.log('Email transporter created and verified successfully');
      
    } catch (error) {
      console.error('Error creating transporter:', error);
      throw error;
    }
  }

  async ensureTransporterReady() {
    try {
      // Always refresh transporter before sending emails to ensure fresh token
      await this.createTransporter();
    } catch (error) {
      if (error.message && error.message.includes('REFRESH_TOKEN_EXPIRED')) {
        console.error('❌ CRITICAL: Refresh token has expired. Manual intervention required.');
        console.error('📝 Action needed: Please update the refresh token in your email configuration.');
        throw new Error('EMAIL_SERVICE_UNAVAILABLE: Authentication tokens have expired. Please contact administrator.');
      }
      throw error;
    }
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
      // Ensure transporter is ready with fresh token
      await this.ensureTransporterReady();
      
      const result = await this.transporter.sendMail(mailOptions);
      console.log("✅ Welcome email sent successfully to:", userEmail);
      return result;
    } catch (error) {
      console.error("❌ Error sending welcome email:", error.message);
      
      // If it's a token issue, try one more time
      if (error.message && error.message.includes('invalid_grant')) {
        console.log('🔄 Retrying email send with fresh token...');
        try {
          await this.createTransporter();
          const retryResult = await this.transporter.sendMail(mailOptions);
          console.log("✅ Email sent successfully on retry");
          return retryResult;
        } catch (retryError) {
          console.error("❌ Retry failed:", retryError.message);
          throw retryError;
        }
      }
      
      throw error;
    }
  }

  // Generic method to send any email
  async sendEmail(mailOptions) {
    try {
      await this.ensureTransporterReady();
      const result = await this.transporter.sendMail(mailOptions);
      console.log("✅ Email sent successfully to:", mailOptions.to);
      return result;
    } catch (error) {
      console.error("❌ Error sending email:", error.message);
      
      // Retry logic for token issues
      if (error.message && error.message.includes('invalid_grant')) {
        console.log('🔄 Retrying email send with fresh token...');
        try {
          await this.createTransporter();
          const retryResult = await this.transporter.sendMail(mailOptions);
          console.log("✅ Email sent successfully on retry");
          return retryResult;
        } catch (retryError) {
          console.error("❌ Retry failed:", retryError.message);
          throw retryError;
        }
      }
      
      throw error;
    }
  }

  // Method to check token health
  async checkTokenHealth() {
    try {
      const accessToken = await this.getValidAccessToken();
      return {
        status: 'healthy',
        hasAccessToken: !!accessToken,
        lastRefresh: this.lastTokenRefresh,
        message: 'Tokens are working properly'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        requiresAction: error.message.includes('REFRESH_TOKEN_EXPIRED')
      };
    }
  }
}

module.exports = new EmailService();