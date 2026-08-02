import nodemailer from "nodemailer";
import { Resend } from "resend";

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

    const { email, name, templateName, websiteUrl } = bodyData;
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Please enter a valid recipient email address." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const siteUrl = websiteUrl || "https://onlinewishes.in";
    const userDisplayName = name && name.trim() ? name.trim() : "Valued Creator";
    const title = templateName || "Digital Memory Scrapbook";

    const subject = `⚠️ You left your surprise website half-finished! Complete it now 🎁`;
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 32px 20px; background-color: #f8fafc; color: #1e293b; max-width: 580px; margin: 0 auto; border-radius: 20px; border: 1px solid #e2e8f0;">
        
        <!-- Header Brand -->
        <div style="text-align: center; padding-bottom: 24px;">
          <h1 style="color: #f43f5e; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; text-transform: lowercase;">onlinewishes<span style="color: #fda4af;">.in</span></h1>
          <p style="color: #64748b; font-size: 13px; margin-top: 4px; font-weight: 500;">Crafting Unforgettable Digital Memories & Surprises</p>
        </div>

        <!-- Main Content Card -->
        <div style="background-color: #ffffff; padding: 32px 28px; border-radius: 16px; border: 1px solid #cbd5e1; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="font-size: 42px; display: inline-block;">⏳</span>
            <h2 style="color: #0f172a; margin-top: 8px; margin-bottom: 8px; font-size: 22px; font-weight: 800;">Don't Leave Your Surprise Incomplete!</h2>
            <p style="color: #64748b; font-size: 14px; margin: 0;">Your draft is saved and waiting for you.</p>
          </div>

          <p style="color: #334155; font-size: 15px; line-height: 1.6;">Hi <strong>${userDisplayName}</strong>,</p>
          <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
            We noticed that you were customizing your <strong>${title}</strong>, but left before completing or publishing it!
          </p>

          <!-- Reminder Highlight Box -->
          <div style="background-color: #fff1f2; border: 1px solid #fecdd3; padding: 18px 20px; border-radius: 14px; margin-bottom: 24px; text-align: center;">
            <p style="color: #be123c; font-size: 14px; font-weight: 700; margin: 0 0 6px 0;">
              ✨ Good news: Your edits & draft are safely stored in your browser!
            </p>
            <p style="color: #881337; font-size: 13px; margin: 0;">
              Your loved one will be overjoyed when they see this special digital memory. Complete your transaction and publish it in just 1 click!
            </p>
          </div>

          <!-- Call to action button -->
          <div style="text-align: center; margin: 28px 0 20px 0;">
            <a href="${siteUrl}" target="_blank" style="background-color: #f43f5e; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(244, 63, 94, 0.35);">
              Complete Customization & Publish Now 🚀
            </a>
          </div>

          <p style="text-align: center; font-size: 12px; color: #64748b; margin-top: 12px;">
            Need help? Click the button above to return to your saved draft anytime.
          </p>

        </div>

        <!-- Footer -->
        <div style="text-align: center; padding-top: 24px; color: #94a3b8; font-size: 12px; line-height: 1.6;">
          <p style="margin: 0 0 4px 0;">Need any assistance? Write to us anytime at <a href="mailto:support@onlinewishes.in" style="color: #f43f5e; font-weight: 600; text-decoration: none;">support@onlinewishes.in</a></p>
          <p style="margin: 0;">Sent with ❤️ from OnlineWishes.in</p>
        </div>

      </div>
    `;

    let emailDelivered = false;

    // Resend API
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const customSender = process.env.RESEND_FROM_EMAIL || "OnlineWishes <support@onlinewishes.in>";
        
        let sendRes = await resend.emails.send({
          from: customSender,
          to: cleanEmail,
          subject,
          html: htmlContent
        });

        if (sendRes.data && !sendRes.error) {
          emailDelivered = true;
        } else if (sendRes.error) {
          sendRes = await resend.emails.send({
            from: "OnlineWishes <onboarding@resend.dev>",
            to: cleanEmail,
            subject,
            html: htmlContent
          });
          if (sendRes.data && !sendRes.error) {
            emailDelivered = true;
          }
        }
      } catch (err) {
        console.warn("Resend draft reminder email error:", err);
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
            subject,
            html: htmlContent
          });
          emailDelivered = true;
        } catch (smtpErr) {
          console.warn("SMTP draft reminder email error:", smtpErr);
        }
      }
    }

    res.json({
      success: true,
      emailDelivered,
      message: "Draft reminder email processed for " + cleanEmail
    });
  } catch (error) {
    console.error("Draft Reminder Email Error:", error);
    res.status(500).json({ error: "Failed to send draft reminder email: " + (error.message || String(error)) });
  }
}
