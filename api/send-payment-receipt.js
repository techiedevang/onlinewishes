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

    const { email, name, paymentId, orderId, amount, templateTitle, websiteUrl } = bodyData;
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Please enter a valid recipient email address." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const siteUrl = websiteUrl || "https://onlinewishes.in";
    const userDisplayName = name && name.trim() ? name.trim() : "Valued Creator";
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

    const subject = `Thank You for Your Payment! 🎉 | Receipt #${payId.slice(-8)}`;
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
            <span style="font-size: 42px; display: inline-block;">🎉</span>
            <h2 style="color: #0f172a; margin-top: 8px; margin-bottom: 8px; font-size: 22px; font-weight: 800;">Payment Received! Thank You!</h2>
            <p style="color: #64748b; font-size: 14px; margin: 0;">Your transaction was processed successfully.</p>
          </div>

          <p style="color: #334155; font-size: 15px; line-height: 1.6;">Hi <strong>${userDisplayName}</strong>,</p>
          <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
            Thank you so much for your payment at <strong>OnlineWishes.in</strong>! Your digital surprise website feature is now fully unlocked and ready to bring joy to your loved one.
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
              Visit Customized Website & View Surprise 🚀
            </a>
          </div>

          <p style="text-align: center; font-size: 13px; color: #64748b; margin-top: 12px; word-break: break-all;">
            <strong>Your Customized Website Link:</strong><br/>
            <a href="${siteUrl}" target="_blank" style="color: #f43f5e; font-weight: 700; text-decoration: underline;">${siteUrl}</a>
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
        console.warn("Resend payment receipt email error:", err);
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
          console.warn("SMTP payment receipt email error:", smtpErr);
        }
      }
    }

    res.json({
      success: true,
      emailDelivered,
      message: "Payment receipt email processed for " + cleanEmail
    });
  } catch (error) {
    console.error("Payment Receipt Email Error:", error);
    res.status(500).json({ error: "Failed to send payment receipt email: " + (error.message || String(error)) });
  }
}
