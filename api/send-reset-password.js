import fetch from "node-fetch";
import nodemailer from "nodemailer";
import { Resend } from "resend";
import fs from "fs";
import path from "path";

function getFirestoreConfig() {
  let projectId = process.env.FIRESTORE_PROJECT_ID;
  let dbId = process.env.FIRESTORE_DATABASE_ID;
  let apiKey = process.env.FIRESTORE_API_KEY;

  try {
    const pathsToTry = [
      path.join(process.cwd(), "firebase-applet-config.json"),
      path.join(process.cwd(), "../firebase-applet-config.json")
    ];

    let configContent = null;
    for (const configPath of pathsToTry) {
      if (fs.existsSync(configPath)) {
        configContent = fs.readFileSync(configPath, "utf-8");
        break;
      }
    }

    if (configContent) {
      const config = JSON.parse(configContent);
      if (!projectId) projectId = config.projectId;
      if (!dbId) dbId = config.firestoreDatabaseId;
      if (!apiKey) apiKey = config.apiKey;
    }
  } catch (err) {
    console.error("Failed to read firebase config file", err);
  }

  projectId = projectId || "gen-lang-client-0123999783";
  dbId = dbId || "ai-studio-bestiescrapbook-e95b4bbe-fcce-4da3-8e13-ccd86dd2f84a";
  apiKey = apiKey || "AIzaSyAAsl785OWTeliRX3BvzybSWnI7thRCoBI";

  return { projectId, dbId, apiKey };
}

function getOtpDocId(email) {
  const clean = email.trim().toLowerCase();
  return Buffer.from(clean).toString('hex');
}

async function saveUserResetOtpToFirestore(email, otpCode, expiresAt) {
  try {
    const { projectId, dbId, apiKey } = getFirestoreConfig();
    if (!apiKey) return;

    const docId = getOtpDocId(email);
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/user_reset_otps/${docId}?key=${apiKey}`;
    const body = {
      fields: {
        code: { stringValue: otpCode },
        expiresAt: { stringValue: String(expiresAt) },
        email: { stringValue: email }
      }
    };

    await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (err) {
    console.warn("Firestore save user reset OTP error:", err);
  }
}

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
    let bodyData = req.body || {};
    if (typeof req.body === 'string') {
      try { bodyData = JSON.parse(req.body); } catch(e) {}
    }

    const { email } = bodyData;
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

    // Save to Firestore
    await saveUserResetOtpToFirestore(cleanEmail, otpCode, expiresAt);

    let emailDelivered = false;
    let deliveryError = null;

    // Resend attempt
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const customSender = process.env.RESEND_FROM_EMAIL || "OnlineWishes <support@onlinewishes.in>";
        
        let sendRes = await resend.emails.send({
          from: customSender,
          to: cleanEmail,
          subject: "🔐 OnlineWishes - Password Reset Verification Code: " + otpCode,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 28px; background-color: #0f172a; color: #ffffff; border-radius: 16px; max-width: 500px; margin: 0 auto; border: 1px solid #334155;">
              <h2 style="color: #ec4899; margin-top: 0; font-size: 22px; text-align: center;">OnlineWishes Password Reset</h2>
              <p style="color: #cbd5e1; font-size: 14px;">We received a request to reset the password for account: <strong>${cleanEmail}</strong></p>
              <p style="color: #cbd5e1; font-size: 14px;">Your 6-digit verification OTP code is:</p>
              <div style="background-color: #1e293b; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0; border: 2px solid #ec4899;">
                <span style="font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #f472b6;">${otpCode}</span>
              </div>
              <p style="color: #94a3b8; font-size: 13px;">Enter this verification code in the app to choose your new password. Valid for 15 minutes.</p>
              <hr style="border-color: #334155; margin: 24px 0 16px;"/>
              <p style="font-size: 11px; color: #64748b; text-align: center;">Sent securely by support@onlinewishes.in</p>
            </div>
          `
        });

        if (sendRes.data && !sendRes.error) {
          emailDelivered = true;
        } else if (sendRes.error) {
          sendRes = await resend.emails.send({
            from: "OnlineWishes <onboarding@resend.dev>",
            to: cleanEmail,
            subject: "🔐 OnlineWishes - Password Reset Code: " + otpCode,
            html: `<div style="font-family: sans-serif; padding:20px; background:#0f172a; color:#fff;"><h2>OTP Code: ${otpCode}</h2><p>Password reset code for ${cleanEmail}</p></div>`
          });
          if (sendRes.data && !sendRes.error) {
            emailDelivered = true;
          } else {
            deliveryError = sendRes.error?.message || "Resend delivery error";
          }
        }
      } catch (err) {
        console.warn("Vercel Resend error:", err);
        deliveryError = err?.message || String(err);
      }
    }

    // SMTP Fallback
    if (!emailDelivered) {
      const transporter = getTransporter();
      if (transporter) {
        try {
          await transporter.sendMail({
            from: `"OnlineWishes Support" <${process.env.SMTP_USER || "codelearnpoint@gmail.com"}>`,
            to: cleanEmail,
            subject: "🔐 OnlineWishes Password Reset Code: " + otpCode,
            html: `<div style="font-family: sans-serif; padding:20px; background:#0f172a; color:#fff;"><h2>OTP Code: ${otpCode}</h2><p>Password reset code for ${cleanEmail}</p></div>`
          });
          emailDelivered = true;
        } catch (smtpErr) {
          console.warn("Vercel SMTP error:", smtpErr);
        }
      }
    }

    res.json({
      success: true,
      emailDelivered,
      message: "Password reset verification email processed for " + cleanEmail
    });
  } catch (error) {
    console.error("Vercel Reset Email Error:", error);
    res.status(500).json({ error: "Failed to send reset email: " + (error.message || String(error)) });
  }
}
