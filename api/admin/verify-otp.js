import fs from "fs";
import path from "path";

function getFirestoreConfig() {
  let projectId = process.env.FIRESTORE_PROJECT_ID;
  let dbId = process.env.FIRESTORE_DATABASE_ID;
  let apiKey = process.env.FIRESTORE_API_KEY || process.env.GEMINI_API_KEY;

  try {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      if (!projectId) projectId = config.projectId;
      if (!dbId) dbId = config.firestoreDatabaseId;
      if (!apiKey) apiKey = config.apiKey;
    }
  } catch (err) {
    console.error("Failed to read firebase config file", err);
  }

  projectId = projectId || "gen-lang-client-0123999783";
  dbId = dbId || "ai-studio-bestiescrapbook-e95b4bbe-fcce-4da3-8e13-ccd86dd2f84a";

  return { projectId, dbId, apiKey };
}

async function getOtpFromFirestore(adminEmail) {
  const { projectId, dbId, apiKey } = getFirestoreConfig();
  if (!apiKey) {
    throw new Error("Configuration Error: API Key not found");
  }

  const docId = encodeURIComponent(adminEmail);
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/admin_otps/${docId}?key=${apiKey}`;

  const response = await fetch(url);
  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Firestore read failed: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  const code = data.fields?.code?.stringValue;
  const expiresAt = Number(data.fields?.expiresAt?.stringValue || "0");

  return { code, expiresAt };
}

async function deleteOtpFromFirestore(adminEmail) {
  const { projectId, dbId, apiKey } = getFirestoreConfig();
  if (!apiKey) {
    throw new Error("Configuration Error: API Key not found");
  }

  const docId = encodeURIComponent(adminEmail);
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/admin_otps/${docId}?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'DELETE'
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Firestore delete failed: ${response.statusText} - ${errorText}`);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { adminEmail, otp } = req.body;
    const targetAdmin = (adminEmail || "").trim().toLowerCase();
    
    if (targetAdmin !== "admin@onlinewishes.in") {
      return res.status(403).json({ error: "Unauthorized email address." });
    }

    // Retrieve from Firestore
    const storedData = await getOtpFromFirestore("admin@onlinewishes.in");
    
    if (!storedData) {
      return res.status(400).json({ error: "No OTP found or container reset. Please request a new code." });
    }

    if (Date.now() > storedData.expiresAt) {
      await deleteOtpFromFirestore("admin@onlinewishes.in");
      return res.status(400).json({ error: "OTP code expired. Please request a new code." });
    }

    if (storedData.code !== (otp || "").trim()) {
      return res.status(400).json({ error: "Invalid 6-digit OTP code." });
    }

    // OTP Verified
    await deleteOtpFromFirestore("admin@onlinewishes.in");
    
    res.json({
      success: true,
      message: "Admin OTP verified successfully.",
      user: {
        id: "admin-master-id",
        name: "Master Admin",
        email: "admin@onlinewishes.in",
        role: "admin",
      },
    });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
}
