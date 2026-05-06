// src/utils/emailTemplates.js
const { APP_URL } = process.env;

export function verificationEmailTemplate(rawToken) {
  const url = `${APP_URL}/verify-email?token=${encodeURIComponent(rawToken)}`;
  const text = `Welcome to Debisi!

Please verify your email by clicking the link below:
${url}

If you did not create an account, you can ignore this email.`;

  const html = `
  <div style="font-family: Arial, sans-serif; line-height:1.5; color:#222">
    <h2>Welcome to Debisi!</h2>
    <p>Please verify your email by clicking the button below:</p>
    <p>
      <a href="${url}" style="background:#0d6efd; color:#fff; padding:10px 16px; text-decoration:none; border-radius:6px; display:inline-block;">
        Verify Email
      </a>
    </p>
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p><a href="${url}">${url}</a></p>
    <p>If you did not create an account, you can ignore this email.</p>
  </div>
  `;

  return { subject: 'Verify your email', text, html };
}


export function passwordResetEmailTemplate(rawToken) {
  const url = `${APP_URL}/reset-password?token=${encodeURIComponent(rawToken)}`;
  const text = `Password Reset Request

You requested to reset your password. Click the link below to create a new password:
${url}

This link will expire in 1 hour for security reasons.

If you didn't request this reset, please ignore this email and your password will remain unchanged.`;

  const html = `
  <div style="font-family: Arial, sans-serif; line-height:1.5; color:#222; max-width:600px;">
    <h2 style="color:#0d6efd;">Password Reset Request</h2>
    <p>You requested to reset your password. Click the button below to create a new password:</p>
    
    <p style="margin:30px 0;">
      <a href="${url}" style="background:#dc3545; color:#fff; padding:12px 20px; text-decoration:none; border-radius:6px; display:inline-block; font-weight:bold;">
        Reset Password
      </a>
    </p>
    
    <p style="color:#6c757d; font-size:14px;">
      <strong>This link will expire in 1 hour</strong> for security reasons.
    </p>
    
    <p style="color:#6c757d; font-size:14px;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${url}" style="color:#0d6efd; word-break:break-all;">${url}</a>
    </p>
    
    <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
    
    <p style="color:#6c757d; font-size:14px;">
      If you didn't request this reset, please ignore this email and your password will remain unchanged.
    </p>
    
    <p style="color:#6c757d; font-size:12px; margin-top:30px;">
      <strong>Security Tip:</strong> Never share this link with anyone. Our team will never ask for your password.
    </p>
  </div>
  `;

  return { 
    subject: 'Reset your password - Debisi', 
    text, 
    html 
  };
}