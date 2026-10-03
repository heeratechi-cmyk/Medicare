import express, { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Configure Nodemailer Transporter with Gmail SMTP
const smtpUser = process.env.SMTP_USER || 'agkkwa333@gmail.com';
const smtpPass = process.env.SMTP_PASS || 'xpai qjdo xzoo pfjr';
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = Number(process.env.SMTP_PORT) || 587;

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465, // true for 465, false for 587
  auth: {
    user: smtpUser,
    pass: smtpPass.replace(/\s+/g, ''), // clean any accidental spaces in app password
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify SMTP connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.warn('[SMTP WARNING] SMTP Transporter connection issue:', error.message);
  } else {
    console.log('[SMTP READY] Gmail SMTP Server is configured and ready to send emails.');
  }
});

// API Route: Send 4-Digit Registration OTP
app.post('/api/send-otp', async (req: Request, res: Response) => {
  try {
    const { email, otp, fullName } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const recipientName = fullName ? fullName.trim().split(' ')[0] : 'there';

    // --- PRODUCTION SENDER BRANDING SETUP ---
    // To ensure the "M" logo appears as the Gmail Sender Avatar (not just in the email body):
    // 1. Google Workspace: Go to Admin Console > Account > Account Settings > Personalization. Upload the MediCare Logo.
    // 2. BIMI (Brand Indicators for Message Identification): 
    //    - Host a SVG version of the MediCare logo at a public URL.
    //    - Publish a BIMI TXT record on your domain DNS (e.g., v=BIMI1; l=https://medicare.com/logo.svg;).
    //    - Requires DMARC "quarantine" or "reject" policy.
    // 3. Gravatar: Create a Gravatar account for "${smtpUser}" and upload the MediCare Logo.

    const mailOptions = {
      from: `"MediCare Security" <${smtpUser}>`,
      to: email,
      subject: `Your MediCare verification code is ${otp}`,
      text: `Hi ${recipientName},\n\nWe received a request to verify your account for MediCare. Please use the following verification code:\n\n${otp}\n\nThis code will expire in 10 minutes.\n\nMediCare Healthcare Security`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your MediCare verification code</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; color: #24292f; line-height: 1.5;">
          <!-- Hidden Preheader for Gmail Preview -->
          <div style="display: none; max-height: 0px; overflow: hidden;">
            MediCare Hi ${recipientName}, We received a request to verify your account. Your 4-digit code is ${otp}.
          </div>
          
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; padding: 32px 16px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 540px; text-align: left;">
                  <!-- Brand Header with Premium M Logo -->
                  <tr>
                    <td style="padding-bottom: 8px;">
                      <img src="https://img.icons8.com/color/96/hospital.png" width="40" height="40" alt="MediCare Hospital Logo" style="display: block; border: 0; border-radius: 8px;">
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 24px;">
                      <div style="font-size: 16px; font-weight: 700; color: #0284c7; letter-spacing: -0.2px;">MediCare Security</div>
                    </td>
                  </tr>
                  
                  <!-- Greeting & Natural Text -->
                  <tr>
                    <td style="font-size: 14px; color: #24292f; padding-bottom: 14px;">
                      Hi ${recipientName},
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 14px; color: #24292f; padding-bottom: 18px; line-height: 1.6;">
                      We received a request to verify your email address for your MediCare account. Please use the following verification code to continue:
                    </td>
                  </tr>
                  
                  <!-- Plain Prominent Verification Code -->
                  <tr>
                    <td style="padding: 10px 0 20px 0;">
                      <div style="font-size: 32px; font-weight: 700; font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace; letter-spacing: 6px; color: #0f172a;">
                        ${otp}
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Expiry & Security Notice -->
                  <tr>
                    <td style="font-size: 13px; color: #57606a; padding-bottom: 12px; line-height: 1.5;">
                      This code will expire in 10 minutes.
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 13px; color: #57606a; padding-bottom: 32px; line-height: 1.5;">
                      If you did not request this verification, you can safely ignore this email. Someone may have entered your email address by mistake. Never share this code with anyone.
                    </td>
                  </tr>
                  
                  <!-- Minimalist Footer -->
                  <tr>
                    <td style="border-top: 1px solid #e1e4e8; padding-top: 20px; font-size: 12px; color: #6e7781; line-height: 1.5;">
                      MediCare Healthcare Security<br>
                      This is an automated message.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SENT] OTP ${otp} dispatched to ${email}. MessageId: ${info.messageId}`);
    return res.json({ success: true, message: 'OTP sent to your email successfully', messageId: info.messageId });
  } catch (error: any) {
    console.error('[EMAIL ERROR] Failed to send email via SMTP:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to dispatch email through SMTP server: ' + (error.message || 'Unknown error'),
      fallbackUsed: true
    });
  }
});

// API Route: Send Appointment Confirmation Slip
app.post('/api/send-appointment-confirmation', async (req: Request, res: Response) => {
  try {
    const { email, patientName, doctorName, tokenNumber, appointmentDate, appointmentTime, clinicName, clinicAddress } = req.body;

    if (!email || !tokenNumber) {
      return res.status(400).json({ success: false, message: 'Email and Token are required' });
    }

    const mailOptions = {
      from: `"MediCare Appointments" <${smtpUser}>`,
      to: email,
      subject: `Appointment Confirmed: Token #${tokenNumber} with ${doctorName}`,
      text: `Dear ${patientName},\n\nYour appointment has been confirmed.\n\nDoctor: ${doctorName}\nToken: ${tokenNumber}\nDate: ${appointmentDate}\nTime: ${appointmentTime}\nClinic: ${clinicName}, ${clinicAddress}\n\nPlease arrive 15 minutes before your time.\n\nMediCare Pakistan`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;">
          <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden;">
            <div style="background-color: #0284c7; padding: 20px; text-align: center; color: #ffffff;">
              <h2 style="margin: 0; font-size: 20px;">Appointment Confirmed</h2>
              <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Token: <strong>${tokenNumber}</strong></p>
            </div>
            <div style="padding: 24px;">
              <p style="font-size: 14px;">Dear <strong>${patientName}</strong>,</p>
              <p style="font-size: 13px; color: #475569;">Your hospital OPD slot has been successfully scheduled with <strong>${doctorName}</strong>.</p>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0;">
                <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; color: #64748b;">Date:</td><td style="padding: 8px 0; font-weight: bold;">${appointmentDate}</td></tr>
                <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; color: #64748b;">Time Slot:</td><td style="padding: 8px 0; font-weight: bold;">${appointmentTime}</td></tr>
                <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; color: #64748b;">Hospital / Clinic:</td><td style="padding: 8px 0; font-weight: bold;">${clinicName}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;">Location:</td><td style="padding: 8px 0; font-size: 12px;">${clinicAddress}</td></tr>
              </table>
              <p style="font-size: 12px; color: #64748b;">Please show your Token <strong>${tokenNumber}</strong> at the reception desk upon check-in.</p>
            </div>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return res.json({ success: true, message: 'Confirmation email dispatched', messageId: info.messageId });
  } catch (error: any) {
    console.error('[EMAIL ERROR] Failed to send appointment email:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Vite Middleware Integration for Dev / Static serving for Prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`[SERVER] Full-stack MediCare app running on http://localhost:${port}`);
  });
}

startServer();
