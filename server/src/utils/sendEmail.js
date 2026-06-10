import nodemailer from 'nodemailer';

const createTestTransporter = async () => {
  // Generate a test Ethereal account
  const testAccount = await nodemailer.createTestAccount();

  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

export const sendVerificationEmail = async (email, token) => {
  try {
    const transporter = process.env.NODE_ENV === 'production'
      ? /* Implement production SMTP config */ null
      : await createTestTransporter();

    if (!transporter) throw new Error("Production SMTP not configured");

    const verifyUrl = `http://localhost:5173/verify-email/${token}`;

    const info = await transporter.sendMail({
      from: '"BookMyVenue Support" <noreply@bookmyvenue.com>',
      to: email,
      subject: 'Verify Your Email - BookMyVenue',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f5f7; color: #1a1c1c;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f5f7; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                  <!-- Header -->
                  <tr>
                    <td align="center" style="background-color: #DC0016; padding: 32px 20px;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: -0.5px; font-weight: 700;">BookMyVenue</h1>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td align="center" style="padding: 48px 32px;">
                      <h2 style="margin: 0 0 16px 0; font-size: 24px; color: #1a1c1c;">Welcome aboard!</h2>
                      <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 24px; color: #575e70;">
                        You're just one step away from discovering premium venues. Please verify your email address to activate your account and secure your access.
                      </p>
                      
                      <!-- CTA Button -->
                      <table cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td align="center" style="border-radius: 8px;" bgcolor="#DC0016">
                            <a href="${verifyUrl}" target="_blank" style="font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; border: 1px solid #DC0016; display: inline-block;">Verify Email Address</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td align="center" style="background-color: #f9f9f9; padding: 24px; border-top: 1px solid #eeeeee;">
                      <p style="margin: 0; font-size: 12px; color: #916f6b; line-height: 18px;">
                        This verification link will expire in 15 minutes. <br>
                        If you didn't request this email, you can safely ignore it.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log('-----------------------------------------');
    console.log('📧 Verification email sent successfully!');
    console.log('🔗 VIEW EMAIL HERE: %s', nodemailer.getTestMessageUrl(info));
    console.log('-----------------------------------------');

    return true;
  } catch (error) {
    console.error('Email send failed:', error);
    return false;
  }
};

export const sendPasswordResetEmail = async (email, token) => {
  try {
    const transporter = process.env.NODE_ENV === 'production'
      ? /* Implement production SMTP config */ null
      : await createTestTransporter();

    if (!transporter) throw new Error("Production SMTP not configured");

    const resetUrl = `http://localhost:5173/reset-password/${token}`;

    const info = await transporter.sendMail({
      from: '"BookMyVenue Support" <noreply@bookmyvenue.com>',
      to: email,
      subject: 'Reset Your Password - BookMyVenue',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f5f7; color: #1a1c1c;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f5f7; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                  <!-- Header -->
                  <tr>
                    <td align="center" style="background-color: #DC0016; padding: 32px 20px;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: -0.5px; font-weight: 700;">BookMyVenue</h1>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td align="center" style="padding: 48px 32px;">
                      <h2 style="margin: 0 0 16px 0; font-size: 24px; color: #1a1c1c;">Password Reset Request</h2>
                      <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 24px; color: #575e70;">
                        We received a request to reset your password. Click the button below to choose a new one.
                      </p>
                      
                      <!-- CTA Button -->
                      <table cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td align="center" style="border-radius: 8px;" bgcolor="#DC0016">
                            <a href="${resetUrl}" target="_blank" style="font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; border: 1px solid #DC0016; display: inline-block;">Reset Password</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td align="center" style="background-color: #f9f9f9; padding: 24px; border-top: 1px solid #eeeeee;">
                      <p style="margin: 0; font-size: 12px; color: #916f6b; line-height: 18px;">
                        This reset link will expire in 15 minutes. <br>
                        If you didn't request a password reset, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log('-----------------------------------------');
    console.log('🔑 Password Reset email sent successfully!');
    console.log('🔗 VIEW EMAIL HERE: %s', nodemailer.getTestMessageUrl(info));
    console.log('-----------------------------------------');

    return true;
  } catch (error) {
    console.error('Email send failed:', error);
    return false;
  }
};
