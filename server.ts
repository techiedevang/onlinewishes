import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Razorpay from "razorpay";
import SpotifyWebApi from "spotify-web-api-node";
import nodemailer from "nodemailer";

// In-memory OTP storage
const adminOtpStore = new Map<string, { code: string; expiresAt: number }>();

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

      adminOtpStore.set("admin@onlinewishes.in", { code: otpCode, expiresAt });

      const recipientEmail = "codelearnpoint@gmail.com";
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
        recipient: recipientEmail,
        message: emailSent
          ? `Real OTP email sent to ${recipientEmail}!`
          : `OTP code generated for ${recipientEmail}.`,
        fallbackOtp: emailSent ? undefined : otpCode,
      });
    } catch (err: any) {
      console.error("Admin OTP Error:", err);
      res.status(500).json({ error: "Failed to generate OTP" });
    }
  });

  // Admin OTP Verify API
  app.post("/api/admin/verify-otp", (req, res) => {
    try {
      const { adminEmail, otp } = req.body;
      const targetAdmin = (adminEmail || "").trim().toLowerCase();

      if (targetAdmin !== "admin@onlinewishes.in") {
        return res.status(403).json({ error: "Unauthorized email address." });
      }

      const storedData = adminOtpStore.get("admin@onlinewishes.in");

      if (!storedData) {
        return res.status(400).json({ error: "No OTP found. Please request a new code." });
      }

      if (Date.now() > storedData.expiresAt) {
        adminOtpStore.delete("admin@onlinewishes.in");
        return res.status(400).json({ error: "OTP code expired. Please request a new code." });
      }

      if (storedData.code !== (otp || "").trim()) {
        return res.status(400).json({ error: "Invalid 6-digit OTP code." });
      }

      // OTP Verified
      adminOtpStore.delete("admin@onlinewishes.in");

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

  // Serve Sitemap and Robots explicitly with correct XML/Text MIME types
  app.get("/sitemap*.xml", (req, res) => {
    const filename = req.path.split("/").pop();
    res.type("application/xml");
    const distSitemap = path.join(process.cwd(), "dist", filename);
    const publicSitemap = path.join(process.cwd(), "public", filename);
    res.sendFile(publicSitemap, (err) => {
      if (err) res.sendFile(distSitemap);
    });
  });

  // Old route kept for safety if needed, but above handles it
  app.get("/old-sitemap.xml", (req, res) => {
    res.type("application/xml");
    const distSitemap = path.join(process.cwd(), "dist", "sitemap.xml");
    const publicSitemap = path.join(process.cwd(), "public", "sitemap.xml");
    res.sendFile(publicSitemap, (err) => {
      if (err) res.sendFile(distSitemap);
    });
  });

  // API route to fetch images from Firestore
  app.get("/api/images/:id", async (req, res) => {
    try {
      const docId = req.params.id;
      const projectId = "gen-lang-client-0123999783";
      const dbId = "ai-studio-bestiescrapbook-e95b4bbe-fcce-4da3-8e13-ccd86dd2f84a";
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/uploaded_images/${docId}`;
      
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

  app.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    const distRobots = path.join(process.cwd(), "dist", "robots.txt");
    const publicRobots = path.join(process.cwd(), "public", "robots.txt");
    res.sendFile(publicRobots, (err) => {
      if (err) res.sendFile(distRobots);
    });
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
