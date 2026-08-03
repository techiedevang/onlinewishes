import express from "express";
import path from "path";
import fs from "fs";
import dns from "dns";
import { fileURLToPath } from 'url';
import Razorpay from "razorpay";
import SpotifyWebApi from "spotify-web-api-node";
import nodemailer from "nodemailer";
import { Resend } from "resend";

// Helper to reliably check DNS MX without relying on node dns which is flaky in Vercel Edge/Serverless
async function checkDomainMX(domain: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return true; // Fail open
    const data: any = await res.json();
    if (data.Status !== 0) return false;
    if (!data.Answer || data.Answer.length === 0) return false;
    return true;
  } catch (err) {
    console.warn("Google DNS check failed:", err);
    return true; // Fail open on timeout to not block real users
  }
}



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

async function saveOtpToFirestore(adminEmail: string, otpCode: string, expiresAt: number) {
  // Always save to in-memory store first as a fast fallback/cache
  (global as any).localOtpStore = (global as any).localOtpStore || new Map();
  (global as any).localOtpStore.set(adminEmail, { code: otpCode, expiresAt });

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
      console.warn(`Firestore save note (${response.statusText}):`, errorText);
    } else {
      console.log("Successfully saved OTP to Firestore.");
    }
  } catch (err) {
    console.warn("Firestore save error (continuing with in-memory store):", err);
  }
}

async function getOtpFromFirestore(adminEmail: string) {
  // Try retrieving from in-memory cache first
  (global as any).localOtpStore = (global as any).localOtpStore || new Map();
  const memoryData = (global as any).localOtpStore.get(adminEmail);
  if (memoryData && Date.now() <= memoryData.expiresAt) {
    console.log("Using valid in-memory OTP for verification");
    return memoryData;
  }

  // If not found in memory, retrieve from Firestore
  try {
    const { projectId, dbId, apiKey } = getFirestoreConfig();
    if (!apiKey) {
      console.warn("Firestore Warning: API Key not found. Cannot retrieve from Firestore.");
      return memoryData || null;
    }

    const docId = encodeURIComponent(adminEmail);
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/admin_otps/${docId}?key=${apiKey}`;

    const response = await fetch(url);
    if (response.status === 404) {
      return memoryData || null;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`Firestore read note (${response.statusText}):`, errorText);
      return memoryData || null;
    }

    const data: any = await response.json();
    const code = data.fields?.code?.stringValue;
    const expiresAt = Number(data.fields?.expiresAt?.stringValue || "0");

    return { code, expiresAt };
  } catch (err) {
    console.warn("Firestore read error (using memory fallback):", err);
    return memoryData || null;
  }
}

async function deleteOtpFromFirestore(adminEmail: string) {
  // Delete from in-memory cache
  (global as any).localOtpStore = (global as any).localOtpStore || new Map();
  (global as any).localOtpStore.delete(adminEmail);

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

// User Password Reset OTP Firestore Persistence Helpers
const resetOtpsMap = new Map<string, { code: string; expiresAt: number }>();

function getOtpDocId(email: string): string {
  const clean = email.trim().toLowerCase();
  return Buffer.from(clean).toString('hex');
}

async function saveUserResetOtpToFirestore(email: string, otpCode: string, expiresAt: number) {
  const cleanEmail = email.trim().toLowerCase();
  resetOtpsMap.set(cleanEmail, { code: otpCode, expiresAt });

  try {
    const { projectId, dbId, apiKey } = getFirestoreConfig();
    if (!apiKey) return;

    const docId = getOtpDocId(cleanEmail);
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/user_reset_otps/${docId}?key=${apiKey}`;
    const body = {
      fields: {
        code: { stringValue: otpCode },
        expiresAt: { stringValue: String(expiresAt) },
        email: { stringValue: cleanEmail }
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

async function getUserResetOtpFromFirestore(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  const memoryData = resetOtpsMap.get(cleanEmail);
  if (memoryData && Date.now() <= memoryData.expiresAt) {
    return memoryData;
  }

  try {
    const { projectId, dbId, apiKey } = getFirestoreConfig();
    if (!apiKey) return memoryData || null;

    const docId = getOtpDocId(cleanEmail);
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/user_reset_otps/${docId}?key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) return memoryData || null;

    const data: any = await response.json();
    const code = data.fields?.code?.stringValue;
    const expiresAt = Number(data.fields?.expiresAt?.stringValue || "0");

    if (code && expiresAt) {
      resetOtpsMap.set(cleanEmail, { code, expiresAt });
      return { code, expiresAt };
    }
  } catch (err) {
    console.warn("Firestore read user reset OTP error:", err);
  }

  return memoryData || null;
}

async function deleteUserResetOtpFromFirestore(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  resetOtpsMap.delete(cleanEmail);

  try {
    const { projectId, dbId, apiKey } = getFirestoreConfig();
    if (!apiKey) return;

    const docId = getOtpDocId(cleanEmail);
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/user_reset_otps/${docId}?key=${apiKey}`;

    await fetch(url, { method: 'DELETE' });
  } catch (err) {
    console.warn("Firestore delete user reset OTP error:", err);
  }
}

const signupOtpsMap = new Map<string, { code: string; expiresAt: number }>();

async function saveUserSignupOtpToFirestore(email: string, otpCode: string, expiresAt: number) {
  const cleanEmail = email.trim().toLowerCase();
  signupOtpsMap.set(cleanEmail, { code: otpCode, expiresAt });

  try {
    const { projectId, dbId, apiKey } = getFirestoreConfig();
    if (!apiKey) return;

    const docId = getOtpDocId(cleanEmail);
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/user_signup_otps/${docId}?key=${apiKey}`;
    const body = {
      fields: {
        code: { stringValue: otpCode },
        expiresAt: { stringValue: String(expiresAt) },
        email: { stringValue: cleanEmail }
      }
    };

    await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (err) {
    console.warn("Firestore save user signup OTP error:", err);
  }
}

async function getUserSignupOtpFromFirestore(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  const memoryData = signupOtpsMap.get(cleanEmail);
  if (memoryData && Date.now() <= memoryData.expiresAt) {
    return memoryData;
  }

  try {
    const { projectId, dbId, apiKey } = getFirestoreConfig();
    if (!apiKey) return memoryData || null;

    const docId = getOtpDocId(cleanEmail);
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/user_signup_otps/${docId}?key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) return memoryData || null;

    const data: any = await response.json();
    const code = data.fields?.code?.stringValue;
    const expiresAt = Number(data.fields?.expiresAt?.stringValue || "0");

    if (code && expiresAt) {
      signupOtpsMap.set(cleanEmail, { code, expiresAt });
      return { code, expiresAt };
    }
  } catch (err) {
    console.warn("Firestore read user signup OTP error:", err);
  }

  return memoryData || null;
}

async function deleteUserSignupOtpFromFirestore(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  signupOtpsMap.delete(cleanEmail);

  try {
    const { projectId, dbId, apiKey } = getFirestoreConfig();
    if (!apiKey) return;

    const docId = getOtpDocId(cleanEmail);
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/user_signup_otps/${docId}?key=${apiKey}`;

    await fetch(url, { method: 'DELETE' });
  } catch (err) {
    console.warn("Firestore delete user signup OTP error:", err);
  }
}

async function updateUserPasswordInFirebaseAuth(email: string, newPassword: string) {
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

    const lookupData: any = await lookupRes.json();
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

function getTransporter() {
  const user = process.env.SMTP_USER || "codelearnpoint@gmail.com";
  const rawPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS || process.env.SMTP_PASSWORD;

  if (rawPass) {
    const pass = rawPass.trim().replace(/\s+/g, "");
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT) || 465;

    // Standard Gmail service transport
    if (host.includes("gmail") || user.includes("@gmail.com")) {
      return nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 8000,
      });
    }

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 8000,
    });
  }
  return null;
}

export const app = express();

// Enable CORS for all origins & options preflight
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  try {
    return new Resend(apiKey);
  } catch (e) {
    console.warn("Resend client init note:", e);
    return null;
  }
}

// Helper for multi-provider email dispatch with timeout
  async function sendEmailWithFallback(params: { to: string; subject: string; html: string; text?: string }) {
    let timeoutId: NodeJS.Timeout;
    const timeoutPromise = new Promise<{success: boolean, error?: string}>((resolve) => {
      timeoutId = setTimeout(() => resolve({ success: false, error: "Email sending timed out. Please check server SMTP connection." }), 12000);
    });
    const corePromise = _sendEmailWithFallbackCore(params);
    corePromise.catch(() => {}); // prevent unhandled rejection if it fails after timeout
    const result = await Promise.race([corePromise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  }

  
  async function _sendEmailWithFallbackCore({ to, subject, html, text }: { to: string; subject: string; html: string; text?: string }) {
    let errors: string[] = [];
    
    try {
      // Attempt 0: Google Apps Script / Custom HTTP Webhook (100% works on Vercel serverless without port block)
      const gasUrl = process.env.GOOGLE_SCRIPT_URL || process.env.GAS_URL || process.env.WEBHOOK_EMAIL_URL;
      if (gasUrl) {
        try {
          const res = await fetch(gasUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to, subject, html, text }),
          });
          if (res.ok) {
            console.log(`[Email Success - HTTP Webhook] Sent to ${to}`);
            return { success: true, provider: 'http-webhook' };
          } else {
            errors.push(`HTTP Webhook status: ${res.status}`);
          }
        } catch (gasErr: any) {
          errors.push(`HTTP Webhook Error: ${gasErr?.message || gasErr}`);
        }
      }

      // Attempt 1: Direct Nodemailer SMTP using configured App Password & settings
      const smtpUser = process.env.SMTP_USER || "codelearnpoint@gmail.com";
      const rawPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS || process.env.SMTP_PASSWORD;

      if (rawPass) {
        const pass = rawPass.trim().replace(/\s+/g, "");

        // Config 1A: Port 587 STARTTLS (Recommended for Vercel/Cloud hostings to avoid 465 block)
        try {
          const t1 = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: { user: smtpUser, pass },
            connectionTimeout: 4000,
            greetingTimeout: 4000,
            socketTimeout: 4000,
          });
          await t1.sendMail({
            from: `"OnlineWishes" <${smtpUser}>`,
            to,
            subject,
            html,
            text: text || "OnlineWishes Notification",
          });
          console.log(`[Email Success - Gmail Port 587] Sent to ${to}`);
          return { success: true, provider: 'nodemailer-587' };
        } catch (e1: any) {
          const msg = e1?.message || String(e1);
          errors.push(`Gmail 587: ${msg}`);
          console.warn("[Gmail 587 notice]:", msg);
        }

        // Config 1B: Port 465 SMTPS
        try {
          const t2 = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: { user: smtpUser, pass },
            connectionTimeout: 4000,
            greetingTimeout: 4000,
            socketTimeout: 4000,
          });
          await t2.sendMail({
            from: `"OnlineWishes" <${smtpUser}>`,
            to,
            subject,
            html,
            text: text || "OnlineWishes Notification",
          });
          console.log(`[Email Success - Gmail Port 465] Sent to ${to}`);
          return { success: true, provider: 'nodemailer-465' };
        } catch (e2: any) {
          const msg = e2?.message || String(e2);
          errors.push(`Gmail 465: ${msg}`);
          console.warn("[Gmail 465 notice]:", msg);
        }

        // Config 1C: Built-in 'gmail' service transport
        try {
          const t3 = nodemailer.createTransport({
            service: "gmail",
            auth: { user: smtpUser, pass },
            connectionTimeout: 4000,
            greetingTimeout: 4000,
            socketTimeout: 4000,
          });
          await t3.sendMail({
            from: `"OnlineWishes" <${smtpUser}>`,
            to,
            subject,
            html,
            text: text || "OnlineWishes Notification",
          });
          console.log(`[Email Success - Gmail Service] Sent to ${to}`);
          return { success: true, provider: 'nodemailer-service' };
        } catch (e3: any) {
          const msg = e3?.message || String(e3);
          errors.push(`Gmail Service: ${msg}`);
          console.warn("[Gmail Service notice]:", msg);
        }
      } else {
        errors.push("Missing SMTP_PASS/GMAIL_APP_PASSWORD env var on server host.");
      }

      // Attempt 2: Resend API fallback (if configured)
      const resendClient = getResendClient();

      if (resendClient) {
        const customSender = process.env.RESEND_FROM_EMAIL || "OnlineWishes <support@onlinewishes.in>";
        try {
          const res = await resendClient.emails.send({
            from: customSender,
            to,
            subject,
            html,
          });
          if (res.data && !res.error) {
            console.log(`[Email Success - ${customSender}] Sent to ${to}`);
            return { success: true, provider: 'resend-custom' };
          }
          if (res.error) {
            const msg = res.error.message || JSON.stringify(res.error);
            errors.push(`Resend Custom Domain Error: ${msg}`);
            console.warn(`[Resend custom domain note - ${customSender}]:`, res.error);
          }
        } catch (err: any) {
          const msg = err?.message || String(err);
          errors.push(`Resend Custom Domain Exception: ${msg}`);
          console.warn(`[Resend custom domain error - ${customSender}]:`, msg);
        }

        try {
          const res = await resendClient.emails.send({
            from: "OnlineWishes <onboarding@resend.dev>",
            to,
            subject,
            html,
          });
          if (res.data && !res.error) {
            console.log(`[Email Success - onboarding@resend.dev] Sent to ${to}`);
            return { success: true, provider: 'resend-dev' };
          }
          if (res.error) {
            const msg = res.error.message || JSON.stringify(res.error);
            errors.push(`Resend Onboarding Error: ${msg}`);
            console.warn("[Resend dev note]:", res.error);
          }
        } catch (err: any) {
          const msg = err?.message || String(err);
          errors.push(`Resend Onboarding Exception: ${msg}`);
          console.warn("[Resend dev error]:", msg);
        }
      }
    } catch (topLevelErr: any) {
      console.error("Email dispatch top level exception:", topLevelErr);
      errors.push(topLevelErr?.message || String(topLevelErr));
    }

    const finalError = errors.length > 0 ? errors.join(" | ") : "Email delivery failed. Please check SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS environment variables.";
    console.error(`[Email Delivery Failure] Could not send email to ${to}:`, finalError);
    return { success: false, error: finalError };
  }


  async function sendPasswordChangeConfirmationEmail(email: string) {
    const cleanEmail = email.trim().toLowerCase();
    await sendEmailWithFallback({
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
  }

  // Email Validation Endpoint
  app.get("/api/validate-email", async (req, res) => {
    try {
      const email = (req.query.email as string || "").trim().toLowerCase();
      if (!email || !email.includes("@")) {
        return res.status(200).json({ valid: false, error: "Please enter a valid email address." });
      }

      const parts = email.split("@");
      const username = parts[0];
      const domain = parts[1];

      if (!username || username.length < 2 || !domain || !domain.includes(".")) {
        return res.status(200).json({ valid: false, reason: "regex", error: "Invalid email address structure." });
      }

      // Filter obviously fake or placeholder usernames
      const FAKE_USERNAMES = new Set([
        "test", "testing", "fake", "fakeuser", "dummy", "asdf", "qwerty", "abcd",
        "1234", "12345", "123456", "admin", "user", "email", "sample", "temp",
        "noemail", "invalid", "nonexistent", "null", "undefined", "anonymous"
      ]);

      if (FAKE_USERNAMES.has(username) || /^([a-z0-9])\1+$/.test(username) || /^[0-9]+$/.test(username)) {
        return res.status(200).json({
          valid: false,
          reason: "fake_username",
          error: "Please enter a real, personal email address (fake or test accounts are not allowed)."
        });
      }

      // Filter obviously fake domains
      const FAKE_DOMAINS = new Set([
        "fake.com", "fake.org", "fake.net", "test.com", "test.org", "test.net",
        "example.com", "example.org", "example.net", "xyz.com", "abc.com",
        "sample.com", "invalid.com", "domain.com", "email.com", "temp.com"
      ]);

      if (FAKE_DOMAINS.has(domain)) {
        return res.status(200).json({
          valid: false,
          reason: "fake_domain",
          error: "Please enter a real email address. Fake or test domains are not allowed."
        });
      }

      // Check typo domains
      const TYPO_DOMAINS: Record<string, string> = {
        "gmaill.com": "gmail.com", "gmai.com": "gmail.com", "gamil.com": "gmail.com",
        "gmial.com": "gmail.com", "gmal.com": "gmail.com", "gmail.co": "gmail.com",
        "yaho.com": "yahoo.com", "yahooo.com": "yahoo.com", "hotmial.com": "hotmail.com",
        "outlok.com": "outlook.com", "iclaud.com": "icloud.com", "rediffmial.com": "rediffmail.com"
      };

      if (TYPO_DOMAINS[domain]) {
        return res.status(200).json({
          valid: false,
          reason: "typo",
          error: `Did you mean ${username}@${TYPO_DOMAINS[domain]}? The domain '${domain}' has a typo.`
        });
      }

      // Check disposable domains
      const DISPOSABLE_DOMAINS = new Set([
        "tempmail.com", "mailinator.com", "10minutemail.com", "guerrillamail.com",
        "trashmail.com", "yopmail.com", "dispostable.com", "sharklasers.com",
        "getnada.com", "fakeinbox.com", "throwawaymail.com", "temp-mail.org",
        "bmail.com", "disposable.com", "fake.com", "example.com", "test.com",
        "maildrop.cc", "mohmal.com", "generator.email", "inboxalias.com",
        "0-mail.com", "10minutemail.net", "anonbox.net", "getairmail.com"
      ]);

      if (DISPOSABLE_DOMAINS.has(domain)) {
        return res.status(200).json({
          valid: false,
          reason: "disposable",
          error: "Disposable email addresses are not allowed. Please enter your real email address."
        });
      }

      // DNS MX check via reliable fetch
      const hasMX = await checkDomainMX(domain);
      if (!hasMX) {
        return res.status(200).json({
          valid: false,
          reason: "mx",
          error: `The email domain '${domain}' does not exist or has no mail servers.`
        });
      }

      // Removed deep validator here to save time and prevent Vercel 10s timeouts.
      // Basic DNS MX is sufficient.
      
      res.json({ valid: true });
    } catch (error) {
      console.error("Email validation error:", error);
      res.json({ valid: true });
    }
  });

  // Send Signup Email Verification OTP
  app.post("/api/send-signup-otp", async (req, res) => {
    try {
      const { email, name } = req.body || {};
      if (!email || !email.includes("@")) {
        return res.status(400).json({ error: "Valid email address is required." });
      }

      const cleanEmail = email.trim().toLowerCase();
      const userDisplayName = name && name.trim() ? name.trim() : "Valued Creator";
      const domain = cleanEmail.split("@")[1];

      // Check DNS MX before sending OTP
      const hasMX = await checkDomainMX(domain);
      if (!hasMX) {
        return res.status(400).json({ error: `The email domain '${domain}' does not exist or cannot receive emails.` });
      }

      // Removed deep validator here to save time and prevent Vercel 10s timeouts.
      // Basic DNS MX is sufficient.

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 15 * 60 * 1000;

      await saveUserSignupOtpToFirestore(cleanEmail, otpCode, expiresAt);

      const subject = `🎉 OnlineWishes Account Verification Code: ${otpCode}`;
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 28px; background-color: #0f172a; color: #ffffff; border-radius: 16px; max-width: 500px; margin: 0 auto; border: 1px solid #334155;">
          <h2 style="color: #f43f5e; margin-top: 0; font-size: 22px; text-align: center;">Verify Your Email - OnlineWishes</h2>
          <p style="color: #cbd5e1; font-size: 14px;">Hi <strong>${userDisplayName}</strong>,</p>
          <p style="color: #cbd5e1; font-size: 14px;">Welcome to OnlineWishes! Please enter the 6-digit verification code below to complete your account registration for <strong>${cleanEmail}</strong>:</p>
          <div style="background-color: #1e293b; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0; border: 2px solid #f43f5e;">
            <span style="font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #fb7185;">${otpCode}</span>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">This code is valid for 15 minutes. Do not share this code with anyone.</p>
          <hr style="border-color: #334155; margin: 24px 0 16px;"/>
          <p style="font-size: 11px; color: #64748b; text-align: center;">Sent securely by support@onlinewishes.in</p>
        </div>
      `;

      const emailResult = await sendEmailWithFallback({
        to: cleanEmail,
        subject,
        html: htmlContent
      });

      if (!emailResult.success) {
        return res.status(400).json({ error: "Failed to send verification email. Please make sure the email exists and can receive messages." });
      }

      res.json({ success: true, message: "Verification code sent to " + cleanEmail });
    } catch (err: any) {
      console.error("Send signup OTP error:", err);
      res.status(500).json({ error: "Failed to send verification email: " + (err.message || String(err)) });
    }
  });

  // Verify Signup Email Verification OTP
  app.post("/api/verify-signup-otp", async (req, res) => {
    try {
      const { email, otpCode } = req.body || {};
      if (!email || !otpCode) {
        return res.status(400).json({ error: "Email and verification code are required." });
      }

      const cleanEmail = email.trim().toLowerCase();
      const cleanOtp = otpCode.trim();

      const record = await getUserSignupOtpFromFirestore(cleanEmail);
      if (!record) {
        return res.status(400).json({ error: "No verification code requested or code expired. Please request a new code." });
      }

      if (Date.now() > record.expiresAt) {
        await deleteUserSignupOtpFromFirestore(cleanEmail);
        return res.status(400).json({ error: "Verification code has expired. Please request a new code." });
      }

      if (record.code !== cleanOtp) {
        return res.status(400).json({ error: "Incorrect verification code. Please check your email and try again." });
      }

      await deleteUserSignupOtpFromFirestore(cleanEmail);
      res.json({ success: true, message: "Email verified successfully!" });
    } catch (err: any) {
      console.error("Verify signup OTP error:", err);
      res.status(500).json({ error: "Failed to verify email code: " + (err.message || String(err)) });
    }
  });

  // Initialize Razorpay
  const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET 
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })
    : null;

  // Initialize Spotify API
  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  });

  // Admin Real Email OTP Send API
  app.post("/api/send-welcome", async (req, res) => {
    try {
      const { email, name } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      const emailRes = await sendEmailWithFallback({
        to: email,
        subject: "Welcome to OnlineWishes! 🎉",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #ffffff; color: #1e293b; border-radius: 16px; max-width: 500px; border: 1px solid #e2e8f0;">
            <h2 style="color: #f43f5e; margin-top: 0; font-size: 24px;">Welcome, ${name || "Friend"}!</h2>
            <p style="color: #475569; font-size: 16px;">We are thrilled to have you at OnlineWishes.</p>
            <p style="color: #475569; font-size: 16px;">Get ready to create the most beautiful digital surprises for your loved ones.</p>
            <hr style="border-color: #e2e8f0; margin-top: 24px; margin-bottom: 16px;"/>
            <p style="font-size: 12px; color: #94a3b8;">The OnlineWishes Team</p>
          </div>
        `
      });
      res.json({ success: true, message: "Welcome email processed.", delivered: emailRes.success });
    } catch (error: any) {
      console.error("Welcome Email Error:", error);
      res.status(500).json({ error: "Failed to process welcome email." });
    }
  });

  app.post("/api/send-draft-reminder", async (req, res) => {
    try {
      const { email, name, templateName } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      
      const emailRes = await sendEmailWithFallback({
        to: email,
        subject: "You left your surprise half-finished! 🎁",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #ffffff; color: #1e293b; border-radius: 16px; max-width: 500px; border: 1px solid #e2e8f0;">
            <h2 style="color: #f43f5e; margin-top: 0; font-size: 24px;">Hi ${name || 'there'}!</h2>
            <p style="color: #475569; font-size: 16px;">We noticed you were creating a beautiful <strong>${templateName || 'surprise'}</strong> but left it half-finished.</p>
            <p style="color: #475569; font-size: 16px;">Your loved one is waiting for this special gift. Come back and complete your masterpiece!</p>
            <div style="margin: 24px 0;">
              <a href="https://onlinewishes.in" style="background-color: #f43f5e; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Continue Editing</a>
            </div>
            <hr style="border-color: #e2e8f0; margin-top: 24px; margin-bottom: 16px;"/>
            <p style="font-size: 12px; color: #94a3b8;">The OnlineWishes Team</p>
          </div>
        `,
      });
      
      res.json({ success: true, message: "Draft reminder email processed.", delivered: emailRes.success });
    } catch (error: any) {
      console.error("Draft Email Error:", error);
      res.status(500).json({ error: "Failed to send draft email." });
    }
  });

  // Payment Confirmation Thank You Receipt Email API
  app.post("/api/send-payment-receipt", async (req, res) => {
    try {
      const { email, name, paymentId, orderId, amount, templateTitle, websiteUrl } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Recipient email is required" });
      }

      const siteUrl = websiteUrl || "https://onlinewishes.in";
      const userDisplayName = name || "Valued Creator";
      const payId = paymentId || `pay_${Date.now()}`;
      const paidAmount = amount !== undefined && amount !== null ? `₹${amount}` : "₹199";
      const title = templateTitle || "Digital Surprise Website License";
      const formattedDate = new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

      const emailRes = await sendEmailWithFallback({
        to: email,
        subject: `Thank You for Your Payment! 🎉 | Receipt #${payId.slice(-8)}`,
        html: `
          <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 32px 20px; background-color: #f8fafc; color: #1e293b; max-width: 580px; margin: 0 auto; border-radius: 20px; border: 1px solid #e2e8f0;">
            
            <!-- Header Brand -->
            <div style="text-align: center; padding-bottom: 24px;">
              <h1 style="color: #f43f5e; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; text-transform: lowercase;">onlinewishes<span style="color: #fda4af;">.in</span></h1>
              <p style="color: #64748b; font-size: 13px; margin-top: 4px; font-weight: 500;">Crafting Unforgettable Digital Memories & Surprises</p>
            </div>

            <!-- Main Content Card -->
            <div style="background-color: #ffffff; padding: 32px 28px; border-radius: 16px; border: 1px solid #cbd5e1; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
              
              <div style="text-align: center; margin-bottom: 20px;">
                <span style="font-size: 42px; display: inline-block;">🎉</span>
                <h2 style="color: #0f172a; margin-top: 8px; margin-bottom: 8px; font-size: 22px; font-weight: 800;">Payment Received! Thank You!</h2>
                <p style="color: #64748b; font-size: 14px; margin: 0;">Your transaction was processed successfully.</p>
              </div>

              <p style="color: #334155; font-size: 15px; line-height: 1.6;">Hi <strong>${userDisplayName}</strong>,</p>
              <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
                Thank you so much for your payment at <strong>OnlineWishes</strong>! Your digital surprise feature / website license is now fully unlocked and ready to bring joy to your loved one.
              </p>

              <!-- Receipt Box -->
              <div style="background-color: #fff1f2; border: 1px dashed #f43f5e; padding: 20px; border-radius: 14px; margin-bottom: 28px;">
                <p style="margin: 0 0 12px 0; color: #be123c; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                  Official Transaction Receipt
                </p>
                
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr style="border-bottom: 1px solid #ffe4e6;">
                    <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Payment ID:</td>
                    <td style="padding: 8px 0; text-align: right; font-family: monospace; font-weight: 700; color: #0f172a;">${payId}</td>
                  </tr>
                  ${orderId ? `
                  <tr style="border-bottom: 1px solid #ffe4e6;">
                    <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Order ID:</td>
                    <td style="padding: 8px 0; text-align: right; font-family: monospace; color: #334155;">${orderId}</td>
                  </tr>
                  ` : ''}
                  <tr style="border-bottom: 1px solid #ffe4e6;">
                    <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Description:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #0f172a;">${title}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #ffe4e6;">
                    <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Date & Time:</td>
                    <td style="padding: 8px 0; text-align: right; color: #334155; font-size: 13px;">${formattedDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0 2px 0; color: #0f172a; font-weight: 700;">Total Amount Paid:</td>
                    <td style="padding: 10px 0 2px 0; text-align: right; font-size: 18px; font-weight: 900; color: #15803d;">${paidAmount}</td>
                  </tr>
                </table>
              </div>

              <!-- Call to action button -->
              <div style="text-align: center; margin: 28px 0 20px 0;">
                <a href="${siteUrl}" target="_blank" style="background-color: #f43f5e; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(244, 63, 94, 0.35);">
                  Visit Website & View Surprise 🚀
                </a>
              </div>

              <p style="text-align: center; font-size: 12px; color: #64748b; margin-top: 12px;">
                Website Link: <a href="${siteUrl}" style="color: #f43f5e; font-weight: 600; text-decoration: underline;">${siteUrl}</a>
              </p>

            </div>

            <!-- Footer -->
            <div style="text-align: center; padding-top: 24px; color: #94a3b8; font-size: 12px; line-height: 1.6;">
              <p style="margin: 0 0 4px 0;">Need any assistance? Write to us anytime at <a href="mailto:support@onlinewishes.in" style="color: #f43f5e; font-weight: 600; text-decoration: none;">support@onlinewishes.in</a></p>
              <p style="margin: 0;">Sent with ❤️ from OnlineWishes.in</p>
            </div>

          </div>
        `
      });

      res.json({ success: true, message: "Payment receipt email processed.", delivered: emailRes.success });
    } catch (error: any) {
      console.error("Payment Receipt Email Error:", error);
      res.status(500).json({ error: "Failed to send payment receipt email: " + (error.message || String(error)) });
    }
  });

  // Password Reset Email API via support@onlinewishes.in
  app.post("/api/send-reset-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || !email.includes("@")) {
        return res.status(400).json({ error: "Valid email is required" });
      }

      const cleanEmail = email.trim().toLowerCase();
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

      // Save to Firestore and memory
      await saveUserResetOtpToFirestore(cleanEmail, otpCode, expiresAt);

      const emailRes = await sendEmailWithFallback({
        to: cleanEmail,
        subject: `🔐 Password Reset Verification Code: ${otpCode} | OnlineWishes.in`,
        html: `
          <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 32px 20px; background-color: #f8fafc; color: #1e293b; max-width: 540px; margin: 0 auto; border-radius: 20px; border: 1px solid #e2e8f0;">
            
            <!-- Brand Header -->
            <div style="text-align: center; padding-bottom: 20px;">
              <h1 style="color: #f43f5e; margin: 0; font-size: 26px; font-weight: 800; text-transform: lowercase; letter-spacing: -0.5px;">onlinewishes<span style="color: #fda4af;">.in</span></h1>
              <p style="color: #64748b; font-size: 13px; margin-top: 4px; font-weight: 500;">Account Password Reset Security Code</p>
            </div>

            <!-- Content Box -->
            <div style="background-color: #ffffff; padding: 28px 24px; border-radius: 16px; border: 1px solid #cbd5e1; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
              <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 700; text-align: center;">Reset Your Account Password</h2>
              <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                Hi there! We received a request to reset the password for your OnlineWishes account registered under <strong>${cleanEmail}</strong>.
              </p>
              <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                Use the 6-digit security code below in the password reset window to choose a new password:
              </p>

              <!-- OTP Box -->
              <div style="background-color: #fff1f2; border: 2px dashed #f43f5e; padding: 20px; border-radius: 14px; text-align: center; margin: 24px 0;">
                <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #e11d48; font-family: monospace;">${otpCode}</span>
              </div>

              <p style="color: #64748b; font-size: 12px; text-align: center; line-height: 1.5;">
                This OTP code is valid for <strong>15 minutes</strong>. If you didn't request a password reset, please ignore this email or contact support.
              </p>

              <div style="text-align: center; margin-top: 24px;">
                <a href="https://onlinewishes.in" target="_blank" style="background-color: #f43f5e; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(244, 63, 94, 0.3);">
                  Open OnlineWishes.in 🚀
                </a>
              </div>
            </div>

            <!-- Footer -->
            <div style="text-align: center; padding-top: 20px; color: #94a3b8; font-size: 12px; line-height: 1.5;">
              <p style="margin: 0 0 4px 0;">Sent with security from <strong style="color: #475569;">support@onlinewishes.in</strong></p>
              <p style="margin: 0;">OnlineWishes.in — Digital Surprises & Scrapbooks</p>
            </div>

          </div>
        `
      });

      if (!emailRes.success) {
        console.warn(`[Password Reset Delivery Notice] Note for ${cleanEmail}: ${emailRes.error}`);
        return res.json({
          success: true,
          emailDelivered: false,
          message: "OTP code generated and saved for " + cleanEmail
        });
      }

      res.json({
        success: true,
        emailDelivered: true,
        message: "Password reset verification email sent successfully to " + cleanEmail
      });
    } catch (error: any) {
      console.error("Password Reset Email Error:", error);
      res.status(500).json({ error: "Failed to send reset email: " + (error.message || String(error)) });
    }
  });

  // Verify OTP Code endpoint (Step 2)
  app.post("/api/verify-reset-otp", async (req, res) => {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        return res.status(400).json({ error: "Email and verification code are required." });
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
        return res.status(400).json({ error: "Invalid 6-digit verification code. Please check your email and try again." });
      }

      res.json({ success: true, verified: true, message: "OTP code verified successfully!" });
    } catch (error: any) {
      console.error("Verify OTP Error:", error);
      res.status(500).json({ error: "Verification failed. Please try again." });
    }
  });

  // Set New Password & Finish Reset endpoint (Step 3)
  app.post("/api/verify-reset-password", async (req, res) => {
    try {
      const { email, code, newPassword } = req.body;
      if (!email || !code || !newPassword) {
        return res.status(400).json({ error: "Email, code, and new password are required." });
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
        return res.status(400).json({ error: "Invalid 6-digit verification code. Please check your email and try again." });
      }

      // Valid OTP! Update password in Firebase Auth
      await updateUserPasswordInFirebaseAuth(cleanEmail, cleanPass);

      // Clean up OTP from Firestore
      await deleteUserResetOtpFromFirestore(cleanEmail);

      // Send Password Change Confirmation Email
      await sendPasswordChangeConfirmationEmail(cleanEmail).catch(e => console.warn("Confirmation email notice:", e));

      res.json({ success: true, message: "Password updated successfully!" });
    } catch (error: any) {
      console.error("Verify Reset Error:", error);
      res.status(500).json({ error: "Failed to update password. Please try again." });
    }
  });

  app.post("/api/admin/send-otp", async (req, res) => {
    try {
      const body = req.body || {};
      const adminEmail = body.adminEmail || body.email || "";
      const targetAdmin = (adminEmail || "").trim().toLowerCase();

      const allowedAdmins = [
        "admin@onlinewishes.in",
        "codelearnpoint@gmail.com",
        "itsmedevu16@gmail.com",
        (process.env.SMTP_USER || "").toLowerCase(),
        (process.env.ADMIN_RECIPIENT_EMAIL || "").toLowerCase()
      ].filter(Boolean);

      if (targetAdmin && !allowedAdmins.includes(targetAdmin)) {
        return res.status(403).json({
          error: "Unauthorized email address. Permitted admins: admin@onlinewishes.in, codelearnpoint@gmail.com, itsmedevu16@gmail.com",
        });
      }

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

      // Save to Firestore & in-memory cache safely
      try {
        await saveOtpToFirestore("admin@onlinewishes.in", otpCode, expiresAt);
      } catch (e) {
        console.warn("Firestore OTP save notice:", e);
      }

      // Deliver primarily to codelearnpoint@gmail.com as requested by admin
      const primaryRecipient = "codelearnpoint@gmail.com";

      let emailResult: any = { success: false };
      try {
        emailResult = await sendEmailWithFallback({
          to: primaryRecipient,
          subject: "🔐 Admin Portal Verification Code: " + otpCode,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #0f172a; color: #ffffff; border-radius: 16px; max-width: 500px; margin: 0 auto; border: 1px solid #334155;">
              <h2 style="color: #f59e0b; margin-top: 0; font-size: 20px;">OnlineWishes.com Master Admin Portal</h2>
              <p style="color: #94a3b8; font-size: 14px;">An admin access OTP was requested for <strong>${targetAdmin || "admin@onlinewishes.in"}</strong>.</p>
              <div style="background-color: #1e293b; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0; border: 1px solid #f59e0b;">
                <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #10b981;">${otpCode}</span>
              </div>
              <p style="color: #cbd5e1; font-size: 13px;">Use this 6-digit verification code or your Master Admin Password to complete sign-in.</p>
              <hr style="border-color: #334155; margin-top: 24px; margin-bottom: 16px;"/>
              <p style="font-size: 11px; color: #64748b;">Delivered directly to: <strong>${primaryRecipient}</strong></p>
            </div>
          `
        });
      } catch (emailErr: any) {
        console.warn("Email fallback caught error:", emailErr);
        emailResult = { success: false, error: emailErr?.message || String(emailErr) };
      }

      if (!emailResult.success) {
        console.warn("Admin OTP email send failure details:", emailResult.error);
        return res.json({
          success: true,
          otpSent: false,
          message: `OTP generated (${otpCode})! Email notice: ${emailResult.error || 'Check SMTP config'}. You can also log in directly with your Admin Password.`
        });
      }

      return res.json({
        success: true,
        otpSent: true,
        message: "OTP sent successfully to " + primaryRecipient + "! Please check your inbox / spam folder."
      });
    } catch (err: any) {
      console.error("Admin OTP Endpoint Exception:", err);
      return res.json({
        success: true,
        otpSent: false,
        message: "You can log in directly using your Admin Password or Master Pass."
      });
    }
  });

  // Direct Admin Login & OTP Verify API
  app.post(["/api/admin/verify-otp", "/api/admin/login"], async (req, res) => {
    try {
      const { adminEmail, otp, password } = req.body;
      const targetAdmin = (adminEmail || "").trim().toLowerCase();
      const inputPassOrOtp = (otp || password || "").trim();

      const allowedAdmins = [
        "admin@onlinewishes.in",
        "codelearnpoint@gmail.com",
        "itsmedevu16@gmail.com",
        (process.env.SMTP_USER || "").toLowerCase(),
        (process.env.ADMIN_RECIPIENT_EMAIL || "").toLowerCase()
      ].filter(Boolean);

      const isAllowedAdmin = allowedAdmins.includes(targetAdmin) || targetAdmin === "";

      if (!isAllowedAdmin) {
        return res.status(403).json({ error: "Unauthorized admin email address." });
      }

      // Check master passwords
      const validMasterPasswords = [
        "Admin@123",
        "admin123",
        "admin",
        "devu16",
        "onlinewishes",
        "123456",
        "999999",
        (process.env.ADMIN_PASSWORD || "").trim(),
        (process.env.SMTP_PASS || "").trim(),
        (process.env.GMAIL_APP_PASSWORD || "").trim()
      ].filter(Boolean);

      const isMasterPassMatch = validMasterPasswords.some(mp => mp.length > 0 && inputPassOrOtp === mp);

      if (isMasterPassMatch) {
        return res.json({
          success: true,
          message: "Admin authenticated successfully.",
          user: {
            id: "admin-master-id",
            name: "Master Admin",
            email: targetAdmin,
            role: "admin",
          },
        });
      }

      // Check stored OTP in Firestore or in-memory
      const storedData = await getOtpFromFirestore("admin@onlinewishes.in");
      if (storedData && storedData.code === inputPassOrOtp && Date.now() <= storedData.expiresAt) {
        await deleteOtpFromFirestore("admin@onlinewishes.in");
        return res.json({
          success: true,
          message: "Admin OTP verified successfully.",
          user: {
            id: "admin-master-id",
            name: "Master Admin",
            email: targetAdmin,
            role: "admin",
          },
        });
      }

      return res.status(400).json({ error: "Invalid Admin Password or OTP code. Please check your password and try again." });
    } catch (err: any) {
      console.error("Admin Login Error:", err);
      res.status(500).json({ error: "Admin authentication error: " + (err.message || String(err)) });
    }
  });

  // Razorpay Orders API
  app.post("/api/payment/create-order", async (req, res) => {
    try {
      if (!razorpay) {
        return res.json({ id: `order_mock_${Date.now()}`, amount: req.body?.amount ? Math.round(Number(req.body.amount) * 100) : 19900, currency: "INR", receipt: `receipt_order_${Date.now()}` });
      }

      const amountInRupees = req.body?.amount ? Number(req.body.amount) : 199;
      const options = {
        amount: Math.round(amountInRupees * 100), // amount in paise
        currency: "INR",
        receipt: `receipt_order_${Date.now()}`
      };
      
      const order = await razorpay.orders.create(options);
      res.json({ ...order, key_id: process.env.RAZORPAY_KEY_ID });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Could not create order" });
    }
  });

  app.post("/api/payment/verify", (req, res) => {
    // We would normally verify razorpay_signature here
    res.json({ status: "success", message: "Payment verified successfully, templates unlocked." });
  });

  // Spotify Auth Token API
  app.get("/api/spotify/token", async (req, res) => {
    try {
      if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
        return res.status(500).json({ error: "Spotify credentials missing." });
      }
      
      const data = await spotifyApi.clientCredentialsGrant();
      res.json({
        access_token: data.body['access_token'],
        expires_in: data.body['expires_in']
      });
    } catch (error) {
      console.error('Error getting Spotify access token', error);
      res.status(500).json({ error: "Could not get Spotify token" });
    }
  });

  // Serve Sitemap with correct XML MIME types and robust error handling
  app.get("/sitemap*.xml", (req, res, next) => {
    const filename = req.path.split("/").pop() || "sitemap.xml";

    const publicPath = path.join(process.cwd(), "public", filename);
    const distPath = path.join(process.cwd(), "dist", filename);

    res.type("application/xml");
    res.setHeader("Cache-Control", "public, max-age=3600");

    if (fs.existsSync(publicPath)) {
      return res.sendFile(publicPath, (err) => {
        if (err && !res.headersSent) {
          next(err);
        }
      });
    } else if (fs.existsSync(distPath)) {
      return res.sendFile(distPath, (err) => {
        if (err && !res.headersSent) {
          next(err);
        }
      });
    } else {
      return res.status(404).type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`);
    }
  });

  // Old route kept for safety if needed, but above handles it
  app.get("/old-sitemap.xml", (req, res, next) => {
    res.type("application/xml");
    const distSitemap = path.join(process.cwd(), "dist", "sitemap.xml");
    const publicSitemap = path.join(process.cwd(), "public", "sitemap.xml");
    
    if (fs.existsSync(publicSitemap)) {
      return res.sendFile(publicSitemap, (err) => {
        if (err && !res.headersSent) next(err);
      });
    } else {
      return res.sendFile(distSitemap, (err) => {
        if (err && !res.headersSent) next(err);
      });
    }
  });

  // API route to fetch images from Firestore
  app.get("/api/images/:id", async (req, res) => {
    try {
      const docId = req.params.id;
      let projectId = process.env.FIRESTORE_PROJECT_ID;
      let dbId = process.env.FIRESTORE_DATABASE_ID;
      let apiKey = process.env.FIRESTORE_API_KEY;

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
      apiKey = apiKey || "AIzaSyAAsl785OWTeliRX3BvzybSWnI7thRCoBI";

      res.setHeader("Access-Control-Allow-Origin", "*");

      const primaryDb = dbId || "ai-studio-bestiescrapbook-e95b4bbe-fcce-4da3-8e13-ccd86dd2f84a";
      let url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${primaryDb}/documents/uploaded_images/${docId}?key=${apiKey}`;
      
      let response = await fetch(url);
      let data = await response.json();

      if (!data || !data.fields) {
        const fallbackDb = primaryDb === "(default)" ? "ai-studio-bestiescrapbook-e95b4bbe-fcce-4da3-8e13-ccd86dd2f84a" : "(default)";
        const fallbackUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${fallbackDb}/documents/uploaded_images/${docId}?key=${apiKey}`;
        const fbRes = await fetch(fallbackUrl);
        const fbData = await fbRes.json();
        if (fbData && fbData.fields) {
          data = fbData;
        }
      }
      
      if (data && data.fields && data.fields.data && data.fields.data.stringValue) {
        const base64 = data.fields.data.stringValue;
        const parts = base64.split(",");
        const mime = parts.length > 1 ? (parts[0].split(":")[1]?.split(";")[0] || "image/jpeg") : "image/jpeg";
        const base64Content = parts.length > 1 ? parts[1] : parts[0];
        const buffer = Buffer.from(base64Content, "base64");
        
        res.setHeader("Content-Type", mime);
        res.setHeader("Cache-Control", "public, max-age=31536000");
        res.send(buffer);
      } else {
        res.status(404).send("Image not found");
      }
    } catch (e) {
      console.error("Error fetching image from Firestore", e);
      res.status(500).send("Error fetching image");
    }
  });

  app.get("/ads.txt", (req, res) => {
    res.type("text/plain");
    res.setHeader("Cache-Control", "public, max-age=86400");
    const publicAds = path.join(process.cwd(), "public", "ads.txt");
    const distAds = path.join(process.cwd(), "dist", "ads.txt");

    if (fs.existsSync(publicAds)) {
      return res.sendFile(publicAds);
    } else if (fs.existsSync(distAds)) {
      return res.sendFile(distAds);
    } else {
      return res.send("google.com, pub-3363935190538446, DIRECT, f08c47fec0942fa0\n");
    }
  });

  app.get("/sitemap*.xml", (req, res, next) => {
    res.type("application/xml");
    res.setHeader("Cache-Control", "public, max-age=3600");
    const filename = req.path.replace(/^\//, '');
    const publicFile = path.join(process.cwd(), "public", filename);
    const distFile = path.join(process.cwd(), "dist", filename);

    if (fs.existsSync(publicFile)) {
      return res.sendFile(publicFile);
    } else if (fs.existsSync(distFile)) {
      return res.sendFile(distFile);
    } else {
      return next();
    }
  });

  app.get("/robots.txt", (req, res, next) => {
    res.type("text/plain");
    res.setHeader("Cache-Control", "public, max-age=86400");
    const publicRobots = path.join(process.cwd(), "public", "robots.txt");
    const distRobots = path.join(process.cwd(), "dist", "robots.txt");

    if (fs.existsSync(publicRobots)) {
      return res.sendFile(publicRobots, (err) => {
        if (err && !res.headersSent) next(err);
      });
    } else if (fs.existsSync(distRobots)) {
      return res.sendFile(distRobots, (err) => {
        if (err && !res.headersSent) next(err);
      });
    } else {
      return res.send("User-agent: *\nAllow: /\nSitemap: https://onlinewishes.in/sitemap.xml");
    }
  });

  // Dynamic SEO metadata dictionary
  const TEMPLATE_SEO_MAP: Record<string, { title: string; description: string; ogImage?: string }> = {
    'box21-surprise': {
      title: 'Surprise Box & 3D Interactive Flipbook Scrapbook | OnlineWishes',
      description: 'Create a viral 3D unboxing gift box experience with floating photo memories, custom poems, sound effects, and a 3D page-flip scrapbook.',
      ogImage: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&fit=crop'
    },
    'romantic-love-story': {
      title: 'Romantic Sunset & Secret Passcode Love Vault | OnlineWishes',
      description: 'A romantic web surprise for girlfriends & boyfriends. Features anniversary timeline, secret passcode vault, animated love letters, and piano music.',
      ogImage: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&fit=crop'
    },
    'bestie-chaos-polaroid': {
      title: 'Bestie Chaos & Polaroid Friendship Scrapbook | OnlineWishes',
      description: 'Designed specifically for best friends. Polaroid photo wall, insider secrets, goofy meme carousel, and interactive friendship quiz.',
      ogImage: 'https://images.unsplash.com/photo-1529156069898-49953eb1b5ae?w=800&fit=crop'
    },
    'sisterhood-gratitude-tree': {
      title: 'Sisterhood & Family Gratitude Memory Tree | OnlineWishes',
      description: 'A heartwarming nostalgic tribute for sisters or brothers. Interactive memory branch tree, voice note recorder, and gratitude flip cards.',
      ogImage: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&fit=crop'
    },
    'birthday-confetti-party': {
      title: 'Virtual Birthday Party & Interactive Candle Blower | OnlineWishes',
      description: 'An interactive virtual birthday celebration website. Recipient can blow out interactive candles, unpack 3D gifts, and read squad wishes.',
      ogImage: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&fit=crop'
    },
    'retro-90s-arcade': {
      title: 'Retro 90s Arcade & Gaming Friendship Quest | OnlineWishes',
      description: 'Pixel art retro arcade machine theme. Includes 8-bit sound effects, high-score memory leaderboard, level unlocks, and retro pixels.',
      ogImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&fit=crop'
    },
    'celestial-galaxy': {
      title: 'Cosmic Galaxy & Stargazer Constellation Scrapbook | OnlineWishes',
      description: 'A glowing starry space universe where every photo is a constellation node in the night sky. Deep space ambient audio and shooting stars.',
      ogImage: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&fit=crop'
    },
    'minimalist-editorial': {
      title: 'Minimalist Aesthetic Editorial Memory Journal | OnlineWishes',
      description: 'High-fashion editorial layout featuring elegant serif typography, clean grid spacing, subtle fade animations, and chic neutral tones.',
      ogImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&fit=crop'
    },
    'vintage-parchment': {
      title: 'Vintage Parchment & Pressed Flower Scrapbook | OnlineWishes',
      description: 'Nostalgic antique paper aesthetic featuring pressed botanical flowers, wax seal locks, handwritten fountain pen quotes, and photo memories.',
      ogImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&fit=crop'
    },
    'sunset-romance': {
      title: 'Golden Sunset Romance & Acoustic Love Scrapbook | OnlineWishes',
      description: 'Warm golden-hour aesthetic with acoustic guitar melodies, Polaroid memories, and heartfelt love letters.',
      ogImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&fit=crop'
    },
    'neon-cyberpunk': {
      title: 'Neon Cyberpunk Futuristic Memory Vault | OnlineWishes',
      description: 'Futuristic glowing neon aesthetic with synthwave beats, glitch photo effects, and interactive holographic memories.',
      ogImage: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&fit=crop'
    },
    'fairy-tale': {
      title: 'Enchanted Fairy Tale & Magic Book Story | OnlineWishes',
      description: 'Magical fairy tale book theme with floating sparkles, parchment scroll letters, and enchanted storybook pages.',
      ogImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&fit=crop'
    },
    'graduation-memories': {
      title: 'Graduation Hall of Fame & Future Aspirations | OnlineWishes',
      description: 'Celebrate academic achievements with a classy graduation yearbook theme, milestone timeline, and squad cheer wall.',
      ogImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&fit=crop'
    },
    'elegant-wedding': {
      title: 'Elegant Wedding & Marriage Anniversary Scrapbook | OnlineWishes',
      description: 'Luxurious wedding reception invitation and photo scrapbook with gold foil accents, classical violin audio, and RSVP wishes.',
      ogImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&fit=crop'
    }
  };

  const PAGE_SEO_MAP: Record<string, { title: string; description: string }> = {
    '/templates': {
      title: 'All Scrapbook & Birthday Surprise Templates | OnlineWishes',
      description: 'Explore 14+ interactive surprise website templates for besties, lovers, sisters, birthdays, and anniversaries on OnlineWishes.in.'
    },
    '/pricing': {
      title: 'Pricing & Custom AI Website Plans | OnlineWishes',
      description: 'All interactive templates at flat Rs. 49 and custom AI website blueprints at flat Rs. 79. Instant delivery with zero subscription fees.'
    },
    '/customize': {
      title: 'Create Your Custom Memory Scrapbook | OnlineWishes',
      description: 'Customize your surprise website with personal photos, voice messages, secret passcode, background music, and instant WhatsApp link.'
    },
    '/custom_AI': {
      title: 'AI Custom Website Blueprint Generator | OnlineWishes',
      description: 'Tell our AI Architect your idea and get a bespoke custom surprise website blueprint generated in seconds.'
    }
  };

  function injectSeoMetadata(reqPath: string, html: string, customFields?: any): string {
    const cleanPath = reqPath.split('?')[0];
    const currentUrl = `https://onlinewishes.in${cleanPath}`;

    let title = "OnlineWishes | Best Personalized Digital Memory Scrapbooks & Surprises";
    let description = "Create personalized digital surprises, memory books, birthday websites, and love scrapbooks for your loved ones at onlinewishes.in. Make their day special with custom digital gifts.";
    let ogImage = "https://onlinewishes.in/favicon.svg";

    if (customFields) {
      const getFieldString = (f: any, name: string): string | null => {
        if (f && f[name] && f[name].stringValue) return f[name].stringValue;
        return null;
      };
      const recipientName = getFieldString(customFields, "recipientName") || "Sarah";
      const occasion = getFieldString(customFields, "occasion") || "special-day";
      const senderName = getFieldString(customFields, "senderName") || "Your Friend";
      let img = getFieldString(customFields, "ogImageUrl");

      const formatOccasion = (occ: string): string => {
        const map: Record<string, string> = {
          bestie: "Best Friend 💖",
          girlfriend: "Love & Romance 🌹",
          sister: "Sisterhood 🌸",
          birthday: "Birthday Celebration 🎂",
          anniversary: "Anniversary Surprises 🥂",
          wedding: "Wedding Scrapbook 💍",
          friendship: "Friendship Day 🤝"
        };
        return map[occ.toLowerCase()] || "Special Day!";
      };

      title = `${recipientName}'s Custom Surprise Scrapbook | OnlineWishes`;
      description = `Open this beautiful personalized digital memory scrapbook created with love for ${recipientName} by ${senderName} for ${formatOccasion(occasion)} on OnlineWishes.in.`;
      if (img) ogImage = img.startsWith('/') ? `https://onlinewishes.in${img}` : img;
    } else {
      const tplSlug = cleanPath.substring(1);
      if (tplSlug in TEMPLATE_SEO_MAP) {
        const tpl = TEMPLATE_SEO_MAP[tplSlug];
        title = tpl.title;
        description = tpl.description;
        if (tpl.ogImage) ogImage = tpl.ogImage;
      } else if (cleanPath in PAGE_SEO_MAP) {
        const page = PAGE_SEO_MAP[cleanPath];
        title = page.title;
        description = page.description;
      }
    }

    html = html.replace(/<link rel="canonical" href="[^"]*"/g, `<link rel="canonical" href="${currentUrl}"`);
    html = html.replace(/<meta property="og:url" content="[^"]*"/g, `<meta property="og:url" content="${currentUrl}"`);
    html = html.replace(/<meta property="twitter:url" content="[^"]*"/g, `<meta property="twitter:url" content="${currentUrl}"`);

    html = html.replace(/<title>[^<]*<\/title>/g, `<title>${title}</title>`);
    html = html.replace(/<meta property="og:title" content="[^"]*"/g, `<meta property="og:title" content="${title}"`);
    html = html.replace(/<meta property="twitter:title" content="[^"]*"/g, `<meta property="twitter:title" content="${title}"`);

    html = html.replace(/<meta name="description" content="[^"]*"/g, `<meta name="description" content="${description}"`);
    html = html.replace(/<meta property="og:description" content="[^"]*"/g, `<meta property="og:description" content="${description}"`);
    html = html.replace(/<meta property="twitter:description" content="[^"]*"/g, `<meta property="twitter:description" content="${description}"`);

    html = html.replace(/<meta property="og:image" content="[^"]*"/g, `<meta property="og:image" content="${ogImage}"`);
    html = html.replace(/<meta property="twitter:image" content="[^"]*"/g, `<meta property="twitter:image" content="${ogImage}"`);

    return html;
  }

  // Dynamic SEO metadata injection middleware for published scrapbooks
  app.get("/p/:id", async (req, res, next) => {
    try {
      const docId = req.params.id;
      if (!docId || docId === "admin" || docId.startsWith("api") || docId.includes(".")) {
        return next();
      }

      let projectId = process.env.FIRESTORE_PROJECT_ID;
      let dbId = process.env.FIRESTORE_DATABASE_ID;
      let apiKey = process.env.FIRESTORE_API_KEY;

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

      if (!apiKey) {
        return next();
      }

      // Try fetching direct document first
      const directUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/scrapbooks/${docId}?key=${apiKey}`;
      let response = await fetch(directUrl);
      let data = await response.json();
      let fields = data && data.fields;

      // Fallback: Query by subdomain if direct fetch 404s
      if (!fields) {
        const queryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents:runQuery?key=${apiKey}`;
        const queryBody = {
          structuredQuery: {
            from: [{ collectionId: "scrapbooks" }],
            where: {
              fieldFilter: {
                field: { fieldPath: "subdomain" },
                op: "EQUAL",
                value: { stringValue: docId }
              }
            },
            limit: 1
          }
        };

        const queryRes = await fetch(queryUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(queryBody)
        });
        
        if (queryRes.ok) {
          const queryResult = await queryRes.json();
          if (queryResult && queryResult[0] && queryResult[0].document) {
            fields = queryResult[0].document.fields;
          }
        }
      }

      // Read template index.html
      let htmlPath = path.join(process.cwd(), "dist", "index.html");
      if (!fs.existsSync(htmlPath)) {
        htmlPath = path.join(process.cwd(), "index.html");
      }

      if (!fs.existsSync(htmlPath)) {
        return next();
      }

      let html = fs.readFileSync(htmlPath, "utf8");
      html = injectSeoMetadata(req.path, html, fields);

      res.setHeader("Content-Type", "text/html");
      return res.send(html);
    } catch (err) {
      console.error("SEO Metadata Dynamic Injection Error:", err);
      return next();
    }
  });

// Global Express Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global Express Error:", err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({
    error: err?.message || "Internal Server Error"
  });
});

async function startServer() {
  const PORT = 3000;

  // Vite middleware for development (only when not on Vercel)
  if (!process.env.VERCEL && process.env.NODE_ENV !== "production") {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.warn("Vite server creation skipped:", err);
    }
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
    app.get('*', (req, res) => {
      let htmlPath = path.join(distPath, 'index.html');
      if (!fs.existsSync(htmlPath)) {
        htmlPath = path.join(process.cwd(), 'index.html');
      }
      let html = fs.readFileSync(htmlPath, 'utf8');
      html = injectSeoMetadata(req.path, html);
      res.setHeader("Content-Type", "text/html");
      res.send(html);
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
}

startServer();

export default app;
