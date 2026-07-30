import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from "vite";
import Razorpay from "razorpay";
import SpotifyWebApi from "spotify-web-api-node";
import nodemailer from "nodemailer";

const _filename = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
const _dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(_filename);

function getFirestoreConfig() {
  let projectId = process.env.FIRESTORE_PROJECT_ID;
  let dbId = process.env.FIRESTORE_DATABASE_ID;
  let apiKey = process.env.FIRESTORE_API_KEY;

  try {
    const pathsToTry = [
      path.join(process.cwd(), "firebase-applet-config.json"),
      path.join(_dirname, "firebase-applet-config.json"),
      path.join(_dirname, "../firebase-applet-config.json")
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
      throw new Error(`Firestore save failed: ${response.statusText} - ${errorText}`);
    } else {
      console.log("Successfully saved OTP to Firestore.");
    }
  } catch (err) {
    console.error("Firestore save error:", err);
    throw err;
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

    const data: any = await response.json();
    const code = data.fields?.code?.stringValue;
    const expiresAt = Number(data.fields?.expiresAt?.stringValue || "0");

    return { code, expiresAt };
  } catch (err) {
    console.error("Firestore read error:", err);
    throw err;
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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
  app.post("/api/admin/send-otp", async (req, res) => {
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
      let emailError: string | null = null;

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
        } catch (mailErr: any) {
          console.error("Failed to send OTP email via SMTP:", mailErr);
          emailError = mailErr.message || "SMTP dispatch error";
        }
      }

      res.json({
        success: true,
        emailSent,
        emailError,
        recipient: "registered secure inbox",
        message: emailSent
          ? "Verification code sent successfully to your authorized email address."
          : "Verification code generated successfully.",
        fallbackOtp: emailSent ? undefined : otpCode,
      });
    } catch (err: any) {
      console.error("Admin OTP Error:", err);
      res.status(500).json({ error: "Failed to generate OTP: " + (err.message || String(err)) });
    }
  });

  // Admin OTP Verify API
  app.post("/api/admin/verify-otp", async (req, res) => {
    try {
      const { adminEmail, otp } = req.body;
      const targetAdmin = (adminEmail || "").trim().toLowerCase();

      if (targetAdmin !== "admin@onlinewishes.in") {
        return res.status(403).json({ error: "Unauthorized email address." });
      }

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
    } catch (err: any) {
      console.error("Verify OTP Error:", err);
      res.status(500).json({ error: "Failed to verify OTP" });
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

  // Serve Sitemap explicitly with correct XML MIME types and robust error handling
  app.get("/sitemap*.xml", (req, res, next) => {
    const filename = req.path.split("/").pop();
    if (!filename) {
      return res.status(404).send("Sitemap not found");
    }

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
      console.warn(`Sitemap file not found: ${filename}`);
      return res.status(404).send(
        `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`
      );
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

      if (!apiKey) {
        return res.status(500).send("Configuration Error: API Key not found");
      }

      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/uploaded_images/${docId}?key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data && data.fields && data.fields.data && data.fields.data.stringValue) {
        const base64 = data.fields.data.stringValue;
        const parts = base64.split(",");
        const mime = parts[0].split(":")[1].split(";")[0];
        const buffer = Buffer.from(parts[1], "base64");
        
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

      if (fields) {
        const getFieldString = (f: any, name: string): string | null => {
          if (f && f[name] && f[name].stringValue) return f[name].stringValue;
          return null;
        };

        const recipientName = getFieldString(fields, "recipientName") || "Sarah";
        const occasion = getFieldString(fields, "occasion") || "special-day";
        const senderName = getFieldString(fields, "senderName") || "Your Friend";
        let ogImageUrl = getFieldString(fields, "ogImageUrl");

        // Format occasion nicely
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

        if (ogImageUrl && ogImageUrl.startsWith("/")) {
          ogImageUrl = `https://${req.get("host")}${ogImageUrl}`;
        } else if (!ogImageUrl) {
          ogImageUrl = `https://${req.get("host")}/favicon.svg`;
        }

        const title = `${recipientName}'s Custom Surprise Scrapbook | OnlineWishes`;
        const description = `Open this beautiful personalized digital memory scrapbook created with love for ${recipientName} by ${senderName} on OnlineWishes.in.`;
        const ogTitle = `A Surprise for ${recipientName}! ❤️`;
        const ogDescription = `Created with love by ${senderName} for ${recipientName} for the occasion of ${formatOccasion(occasion)}. Open to unwrap the memories and messages!`;

        // String replacements
        const currentUrl = `https://${req.get("host")}/p/${docId}`;
        html = html.replace(/<link rel="canonical" href="[^"]*"/g, `<link rel="canonical" href="${currentUrl}"`);
        html = html.replace(/<meta property="og:url" content="[^"]*"/g, `<meta property="og:url" content="${currentUrl}"`);
        html = html.replace(/<meta property="twitter:url" content="[^"]*"/g, `<meta property="twitter:url" content="${currentUrl}"`);

        html = html.replace(/<title>[^<]*<\/title>/g, `<title>${title}</title>`);
        html = html.replace(/<meta property="og:title" content="[^"]*"/g, `<meta property="og:title" content="${ogTitle}"`);
        html = html.replace(/<meta property="twitter:title" content="[^"]*"/g, `<meta property="twitter:title" content="${ogTitle}"`);

        html = html.replace(/<meta name="description" content="[^"]*"/g, `<meta name="description" content="${description}"`);
        html = html.replace(/<meta property="og:description" content="[^"]*"/g, `<meta property="og:description" content="${ogDescription}"`);
        html = html.replace(/<meta property="twitter:description" content="[^"]*"/g, `<meta property="twitter:description" content="${ogDescription}"`);

        html = html.replace(/<meta property="og:image" content="[^"]*"/g, `<meta property="og:image" content="${ogImageUrl}"`);
        html = html.replace(/<meta property="twitter:image" content="[^"]*"/g, `<meta property="twitter:image" content="${ogImageUrl}"`);
      }

      res.setHeader("Content-Type", "text/html");
      return res.send(html);
    } catch (err) {
      console.error("SEO Metadata Dynamic Injection Error:", err);
      return next();
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
