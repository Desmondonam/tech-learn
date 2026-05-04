import nodemailer from 'nodemailer';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

function createTransporter() {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

export async function sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
  const verificationUrl = `${APP_URL}/verify-email?token=${token}`;
  const transporter = createTransporter();

  if (!transporter) {
    console.log('\n========================================');
    console.log('EMAIL VERIFICATION LINK (no SMTP configured)');
    console.log(`To: ${email}`);
    console.log(`Link: ${verificationUrl}`);
    console.log('========================================\n');
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `TechLearn <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify your TechLearn account',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0e1a;color:#f0f6ff;padding:40px;border-radius:16px;">
        <div style="text-align:center;margin-bottom:32px;">
          <div style="display:inline-block;background:linear-gradient(135deg,#0ea5e9,#a78bfa);padding:16px;border-radius:16px;font-size:32px;margin-bottom:16px;">🚀</div>
          <h1 style="font-size:28px;margin:0;color:#f0f6ff;">TechLearn</h1>
        </div>
        <h2 style="color:#38bdf8;">Verify your email address</h2>
        <p>Hi ${name},</p>
        <p>Welcome to TechLearn! Click the button below to verify your email and activate your account.</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${verificationUrl}" style="background:linear-gradient(135deg,#0ea5e9,#a78bfa);color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;display:inline-block;">
            Verify Email Address
          </a>
        </div>
        <p style="color:#64748b;font-size:13px;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
        <p style="color:#475569;font-size:12px;">Or copy this link:<br/><a href="${verificationUrl}" style="color:#38bdf8;">${verificationUrl}</a></p>
      </div>
    `,
  });
}
