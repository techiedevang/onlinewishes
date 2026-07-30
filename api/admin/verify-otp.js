import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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

async function getOtpFromFirestore(adminEmail) {
  // Try retrieving from in-memory cache first
      
  // If not found in memory, retrieve from Firestore
  try {
    const { projectId, dbId, apiKey } = getFirestoreConfig();
    if (!apiKey) {
      console.warn("Firestore Warning: API Key not found. Cannot retrieve from Firestore.");
      return null;
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
  } catch (err) {
    console.error("Firestore read error:", err);
    throw err;
  }
}

async function deleteOtpFromFirestore(adminEmail) {
  // Delete from in-memory cache
    
  try {
    const { projectId, dbId, apiKey } = getFirestoreConfig();
    if (!apiKey) {
      return;
    }

    const docId = encodeURIComponent(adminEmail);
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/admin_otps/${docId}?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`Firestore delete warning: ${response.statusText} - ${errorText}`);
    }
  } catch (err) {
    console.warn("Firestore delete error:", err);
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
    const { adminEmail, otp } = bodyData;
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
    res.status(500).json({ error: "Failed to verify OTP: " + (err.message || String(err)) });
  }
}
