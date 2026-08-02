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

function getOtpDocId(email) {
  const clean = email.trim().toLowerCase();
  return Buffer.from(clean).toString('hex');
}

async function getUserSignupOtpFromFirestore(email) {
  try {
    const { projectId, dbId, apiKey } = getFirestoreConfig();
    if (!apiKey) return null;

    const docId = getOtpDocId(email);
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/user_signup_otps/${docId}?key=${apiKey}`;
    
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.fields) return null;

    return {
      code: data.fields.code?.stringValue,
      expiresAt: Number(data.fields.expiresAt?.stringValue || 0),
      email: data.fields.email?.stringValue
    };
  } catch (err) {
    console.warn("Firestore read signup OTP error:", err);
    return null;
  }
}

async function deleteUserSignupOtpFromFirestore(email) {
  try {
    const { projectId, dbId, apiKey } = getFirestoreConfig();
    if (!apiKey) return;

    const docId = getOtpDocId(email);
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/user_signup_otps/${docId}?key=${apiKey}`;
    
    await fetch(url, { method: 'DELETE' });
  } catch (err) {
    console.warn("Firestore delete signup OTP error:", err);
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

    const { email, otpCode } = bodyData;
    if (!email || !otpCode) {
      return res.status(400).json({ error: "Email and verification OTP code are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otpCode.trim();

    const record = await getUserSignupOtpFromFirestore(cleanEmail);

    if (!record) {
      return res.status(400).json({ error: "No verification code requested for this email, or code has expired. Please request a new code." });
    }

    if (Date.now() > record.expiresAt) {
      await deleteUserSignupOtpFromFirestore(cleanEmail);
      return res.status(400).json({ error: "Verification code has expired. Please request a new code." });
    }

    if (record.code !== cleanOtp) {
      return res.status(400).json({ error: "Incorrect verification code. Please check your email and try again." });
    }

    // Successfully verified -> clean up OTP record
    await deleteUserSignupOtpFromFirestore(cleanEmail);

    res.json({
      success: true,
      message: "Email address verified successfully!"
    });
  } catch (error) {
    console.error("Verify Signup OTP Error:", error);
    res.status(500).json({ error: "Failed to verify email OTP: " + (error.message || String(error)) });
  }
}
