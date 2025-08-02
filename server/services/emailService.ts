import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

interface WelcomeEmailParams {
  to: string;
  userName: string;
}

export class EmailService {
  async sendWelcomeEmail({ to, userName }: WelcomeEmailParams): Promise<boolean> {
    try {
      const fromEmail = process.env.FROM_EMAIL || "welcome@clipnotes.ai";
      const appName = process.env.APP_NAME || "ClipNotes AI";
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ${appName}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${appName}</h1>
              <p>Transform Your Content into Actionable Insights</p>
            </div>
            <div class="content">
              <h2>Hi ${userName},</h2>
              
              <p>Thank you for joining ${appName}! I'm Shardul Kamble, and I'm thrilled you chose our platform to make sense of your notes and YouTube learnings.</p>
              
              <p>Get started by uploading your notes or pasting a YouTube video link. Our AI will summarize the content and answer any question you have about it—instantly.</p>
              
              <p>Here's what you can do with ${appName}:</p>
              <ul>
                <li>📄 Upload PDFs, text files, and Markdown documents</li>
                <li>🎥 Paste YouTube video links for automatic transcript analysis</li>
                <li>🤖 Get AI-powered summaries and insights</li>
                <li>❓ Ask questions about your content and get instant answers</li>
                <li>📱 Access your content history from any device</li>
              </ul>
              
              <a href="https://${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000'}" class="button">Start Using ${appName}</a>
              
              <p>If you have any feedback, just reply to this email. Welcome aboard!</p>
              
              <p>Best regards,<br>
              <strong>Shardul Kamble</strong><br>
              CEO, ${appName}</p>
            </div>
            <div class="footer">
              <p>This email was sent from ${appName}. If you didn't sign up for this service, please ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const textContent = `
        Hi ${userName},

        Thank you for joining ${appName}! I'm Shardul Kamble, and I'm thrilled you chose our platform to make sense of your notes and YouTube learnings.

        Get started by uploading your notes or pasting a YouTube video link. Our AI will summarize the content and answer any question you have about it—instantly.

        If you have any feedback, just reply to this email. Welcome aboard!

        — Shardul Kamble
        CEO, ${appName}
      `;

      await mailService.send({
        to,
        from: fromEmail,
        subject: `Welcome to ${appName} — Thanks from Shardul Kamble`,
        text: textContent,
        html: htmlContent,
      });

      return true;
    } catch (error) {
      console.error('SendGrid email error:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
