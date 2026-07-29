import nodemailer from "nodemailer";

// Note: In Vercel serverless, global variables may not persist between requests.
// For true persistence, you should store the OTP in Firestore.
// We are exporting this globally for a best-effort cache in a hot container.
global.adminOtpStore = global.adminOtpStore || new Map();

function getTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER || "codelearnpoint@gmail.com";
  const pass = process.env.SMTP_PASS;
  
  if (pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { adminEmail } = req.body;
    const targetAdmin = (adminEmail || "").trim().toLowerCase();
    
    if (targetAdmin !== "admin@onlinewishes.in") {
      return res.status(403).json({
        error: "Unauthorized email address. Only admin@onlinewishes.in is permitted.",
      });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    global.adminOtpStore.set("admin@onlinewishes.in", { code: otpCode, expiresAt });

    const recipientEmail = "codelearnpoint@gmail.com";
    const transporter = getTransporter();
    
    let emailSent = false;
    let emailError = null;

    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"OnlineWishes Admin" <${process.env.SMTP_USER || "codelearnpoint@gmail.com"}>`,
          to: recipientEmail,
          subject: "🔐 Admin Portal Verification Code: " + otpCode,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #0f172a; color: #ffffff; border-radius: 16px; max-width: 500px; border: 1px solid #334155;">
              <h2 style="color: #f59e0b; margin-top: 0; font-size: 20px;">OnlineWishes.com Master Admin Portal</h2>
              <p style="color: #94a3b8; font-size: 14px;">An admin access OTP was requested for <strong>admin@onlinewishes.in</strong>.</p>
              <div style="background-color: #1e293b; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0; border: 1px solid #f59e0b;">
                <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #10b981;">${otpCode}</span>
              </div>
              <p style="color: #cbd5e1; font-size: 13px;">Use this 6-digit verification code to complete sign-in. This code expires in 10 minutes.</p>
              <hr style="border-color: #334155; margin-top: 24px; margin-bottom: 16px;"/>
              <p style="font-size: 11px; color: #64748b;">Delivered securely to: <strong>${recipientEmail}</strong></p>
            </div>
          `,
        });
        emailSent = true;
      } catch (mailErr) {
        console.error("Failed to send OTP email via SMTP:", mailErr);
        emailError = mailErr.message || "SMTP dispatch error";
      }
    }

    res.json({
      success: true,
      emailSent,
      emailError,
      recipient: recipientEmail,
      message: emailSent
        ? `Real OTP email sent to ${recipientEmail}!`
        : `OTP code generated for ${recipientEmail}.`,
      fallbackOtp: emailSent ? undefined : otpCode,
    });
  } catch (err) {
    console.error("Admin OTP Error:", err);
    res.status(500).json({ error: "Failed to generate OTP" });
  }
}
