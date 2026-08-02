import fetch from "node-fetch";
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

async function getUserResetOtpFromFirestore(email) {
  try {
    const { projectId, dbId, apiKey } = getFirestoreConfig();
    if (!apiKey) return null;

    const docId = encodeURIComponent(email);
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

    const docId = encodeURIComponent(email);
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/user_reset_otps/${docId}?key=${apiKey}`;

    await fetch(url, { method: 'DELETE' });
  } catch (err) {
    console.warn("Firestore delete user reset OTP error:", err);
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

    // Valid OTP code
    await deleteUserResetOtpFromFirestore(cleanEmail);

    res.json({
      success: true,
      message: "Password reset and updated successfully!"
    });
  } catch (error) {
    console.error("Vercel Verify Reset Error:", error);
    res.status(500).json({ error: "Failed to verify reset code: " + (error.message || String(error)) });
  }
}
