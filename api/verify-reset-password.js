import fetch from "node-fetch";
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

async function getUserResetOtpFromFirestore(email) {
  try {
    const { projectId, dbId, apiKey } = getFirestoreConfig();
    if (!apiKey) return null;

    const docId = getOtpDocId(email);
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/user_reset_otps/${docId}?key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    const code = data.fields?.code?.stringValue;
    const expiresAt = Number(data.fields?.expiresAt?.stringValue || "0");

    if (code && expiresAt) {
      return { code, expiresAt };
    }
  } catch (err) {
    console.warn("Firestore read user reset OTP error:", err);
  }

  return null;
}

async function deleteUserResetOtpFromFirestore(email) {
  try {
    const { projectId, dbId, apiKey } = getFirestoreConfig();
    if (!apiKey) return;

    const docId = getOtpDocId(email);
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/user_reset_otps/${docId}?key=${apiKey}`;

    await fetch(url, { method: 'DELETE' });
  } catch (err) {
    console.warn("Firestore delete user reset OTP error:", err);
  }
}

async function updateUserPasswordInFirebaseAuth(email, newPassword) {
  try {
    const { apiKey } = getFirestoreConfig();
    if (!apiKey) return false;

    // 1. Lookup user localId
    const lookupUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`;
    const lookupRes = await fetch(lookupUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: [email] })
    });

    if (!lookupRes.ok) return false;

    const lookupData = await lookupRes.json();
    const user = lookupData.users && lookupData.users[0];
    if (!user || !user.localId) return false;

    // 2. Update password
    const updateUrl = `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`;
    const updateRes = await fetch(updateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        localId: user.localId,
        password: newPassword,
        returnSecureToken: false
      })
    });

    return updateRes.ok;
  } catch (err) {
    console.warn("FirebaseAuth update password error:", err);
    return false;
  }
}

async function sendPasswordChangeConfirmationEmail(email) {
  const cleanEmail = email.trim().toLowerCase();
  const resendApiKey = process.env.RESEND_API_KEY || "re_bA1Ksk9b_K883yvR9JThgM7CqvhKq5K9T";

  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const customSender = process.env.RESEND_FROM_EMAIL || "OnlineWishes <support@onlinewishes.in>";

      await resend.emails.send({
        from: customSender,
        to: cleanEmail,
        subject: "🎉 Password Changed Successfully - OnlineWishes",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 28px; background-color: #0f172a; color: #ffffff; border-radius: 16px; max-width: 500px; margin: 0 auto; border: 1px solid #334155;">
            <h2 style="color: #10b981; margin-top: 0; font-size: 22px; text-align: center;">Password Updated Successfully!</h2>
            <p style="color: #cbd5e1; font-size: 14px;">Hello,</p>
            <p style="color: #cbd5e1; font-size: 14px;">The password for your OnlineWishes account registered under <strong>${cleanEmail}</strong> has been updated successfully.</p>
            <div style="background-color: #1e293b; padding: 16px; border-radius: 12px; text-align: center; margin: 20px 0; border: 1px solid #10b981;">
              <p style="color: #34d399; font-weight: bold; margin: 0; font-size: 15px;">You can now log in using your new password on OnlineWishes.in.</p>
            </div>
            <p style="color: #94a3b8; font-size: 12px;">If you did not make this change, please contact us immediately at support@onlinewishes.in.</p>
            <hr style="border-color: #334155; margin: 24px 0 16px;"/>
            <p style="font-size: 11px; color: #64748b; text-align: center;">Sent securely by support@onlinewishes.in</p>
          </div>
        `
      });
    } catch (err) {
      console.warn("Send password change confirmation email error:", err);
    }
  }
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

    const { email, code, newPassword } = bodyData;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = newPassword.trim();

    if (cleanPass.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters long." });
    }

    const record = await getUserResetOtpFromFirestore(cleanEmail);

    if (!record) {
      return res.status(400).json({ error: "No reset request found for this email or code expired. Please request a new code." });
    }

    if (Date.now() > record.expiresAt) {
      await deleteUserResetOtpFromFirestore(cleanEmail);
      return res.status(400).json({ error: "The verification code has expired. Please request a new code." });
    }

    if (record.code.trim() !== code.trim()) {
      return res.status(400).json({ error: "Invalid verification code. Please check the code sent to your email." });
    }

    // Valid OTP code! Update password in Firebase Auth
    await updateUserPasswordInFirebaseAuth(cleanEmail, cleanPass);

    // Clean up OTP from Firestore
    await deleteUserResetOtpFromFirestore(cleanEmail);

    // Send confirmation email to user
    sendPasswordChangeConfirmationEmail(cleanEmail).catch(e => console.warn("Confirmation notice:", e));

    res.json({
      success: true,
      message: "Password reset and updated successfully!"
    });
  } catch (error) {
    console.error("Vercel Verify Reset Error:", error);
    res.status(500).json({ error: "Failed to verify reset code: " + (error.message || String(error)) });
  }
}
