import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

function getFirestoreConfig() {
  let projectId = process.env.FIRESTORE_PROJECT_ID;
  let dbId = process.env.FIRESTORE_DATABASE_ID;
  let apiKey = process.env.FIRESTORE_API_KEY || process.env.GEMINI_API_KEY;

  try {
    const pathsToTry = [
      path.join(process.cwd(), "firebase-applet-config.json"),
      path.join(path.dirname(fileURLToPath(import.meta.url)), "../../firebase-applet-config.json"),
      path.join(path.dirname(fileURLToPath(import.meta.url)), "../firebase-applet-config.json")
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

async function saveOtpToFirestore(adminEmail, otpCode, expiresAt) {
  // Always save to in-memory store first as a fast fallback/cache
  global.localOtpStore = global.localOtpStore || new Map();
  global.localOtpStore.set(adminEmail, { code: otpCode, expiresAt });

  try {
    const { projectId, dbId, apiKey } = getFirestoreConfig();
    if (!apiKey) {
      console.warn("Firestore Warning: API Key not found. Proceeding with in-memory storage.");
      return;
    }

    const docId = encodeURIComponent(adminEmail);
    // CRITICAL: Must append updateMask parameters so Firestore REST API actually writes/overwrites these specific fields!
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/admin_otps/${docId}?key=${apiKey}&updateMask.fieldPaths=code&updateMask.fieldPaths=expiresAt`;

    const body = {
      fields: {
        code: { stringValue: otpCode },
        expiresAt: { stringValue: String(expiresAt) }
      }
    };

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Firestore save failed: ${response.statusText} - ${errorText}`);
    } else {
      console.log("Successfully saved OTP to Firestore.");
    }
  } catch (err) {
    console.error("Firestore save error:", err);
    throw err;
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
    const { adminEmail } = req.body;
    const targetAdmin = (adminEmail || "").trim().toLowerCase();
    
    if (targetAdmin !== "admin@onlinewishes.in") {
      return res.status(403).json({
        error: "Unauthorized email address. Only admin@onlinewishes.in is permitted.",
      });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    // Save to Firestore for multi-container and serverless persistence
    await saveOtpToFirestore("admin@onlinewishes.in", otpCode, expiresAt);

    const recipientEmail = process.env.ADMIN_RECIPIENT_EMAIL || process.env.SMTP_USER || "itsmedevu16@gmail.com";
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
        ? "Verification code sent successfully to your authorized email address."
        : "Verification code generated successfully.",
      fallbackOtp: emailSent ? undefined : otpCode,
    });
  } catch (err) {
    console.error("Admin OTP Error:", err);
    res.status(500).json({ error: "Failed to generate OTP" });
  }
}
