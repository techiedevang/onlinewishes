const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Add import
if (!content.includes('import { Resend }')) {
  content = content.replace('import nodemailer from "nodemailer";', 'import nodemailer from "nodemailer";\nimport { Resend } from "resend";');
}

// Add Resend instance
if (!content.includes('const resend = new Resend')) {
  content = content.replace('const app = express();', 'const resend = new Resend(process.env.RESEND_API_KEY || "re_L9Ltr58p_Q7Vy9FYQHMhMwVUt2HrX6Txv");\n\n  const app = express();');
}

// Modify send-otp route
content = content.replace(
  /if \(transporter\) \{[\s\S]*?res\.json\(\{/m,
  `
      try {
        await resend.emails.send({
          from: "OnlineWishes Admin <onboarding@resend.dev>",
          to: recipientEmail,
          subject: "🔐 Admin Portal Verification Code: " + otpCode,
          html: \`
            <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #0f172a; color: #ffffff; border-radius: 16px; max-width: 500px; border: 1px solid #334155;">
              <h2 style="color: #f59e0b; margin-top: 0; font-size: 20px;">OnlineWishes.com Master Admin Portal</h2>
              <p style="color: #94a3b8; font-size: 14px;">An admin access OTP was requested for <strong>admin@onlinewishes.in</strong>.</p>
              <div style="background-color: #1e293b; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0; border: 1px solid #f59e0b;">
                <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #10b981;">\${otpCode}</span>
              </div>
              <p style="color: #cbd5e1; font-size: 13px;">Use this 6-digit verification code to complete sign-in. This code expires in 10 minutes.</p>
              <hr style="border-color: #334155; margin-top: 24px; margin-bottom: 16px;"/>
              <p style="font-size: 11px; color: #64748b;">Delivered securely to: <strong>\${recipientEmail}</strong></p>
            </div>
          \`,
        });
        emailSent = true;
      } catch (mailErr: any) {
        console.error("Failed to send OTP email via Resend:", mailErr);
        emailError = mailErr.message || "Resend API error";
      }

      res.json({`
);

// Add /api/send-welcome endpoint
if (!content.includes('/api/send-welcome')) {
  const welcomeCode = 
  '  app.post("/api/send-welcome", async (req, res) => {\n' +
  '    try {\n' +
  '      const { email, name } = req.body;\n' +
  '      if (!email) {\n' +
  '        return res.status(400).json({ error: "Email is required" });\n' +
  '      }\n' +
  '      await resend.emails.send({\n' +
  '        from: "OnlineWishes <onboarding@resend.dev>",\n' +
  '        to: email,\n' +
  '        subject: "Welcome to OnlineWishes! 🎉",\n' +
  '        html: `\n' +
  '          <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #ffffff; color: #1e293b; border-radius: 16px; max-width: 500px; border: 1px solid #e2e8f0;">\n' +
  '            <h2 style="color: #f43f5e; margin-top: 0; font-size: 24px;">Welcome, ${name || "Friend"}!</h2>\n' +
  '            <p style="color: #475569; font-size: 16px;">We are thrilled to have you at OnlineWishes.</p>\n' +
  '            <p style="color: #475569; font-size: 16px;">Get ready to create the most beautiful digital surprises for your loved ones.</p>\n' +
  '            <hr style="border-color: #e2e8f0; margin-top: 24px; margin-bottom: 16px;"/>\n' +
  '            <p style="font-size: 12px; color: #94a3b8;">The OnlineWishes Team</p>\n' +
  '          </div>\n' +
  '        `\n' +
  '      });\n' +
  '      res.json({ success: true, message: "Welcome email sent successfully." });\n' +
  '    } catch (error: any) {\n' +
  '      console.error("Welcome Email Error:", error);\n' +
  '      res.status(500).json({ error: "Failed to send welcome email." });\n' +
  '    }\n' +
  '  });\n\n';
  
  content = content.replace('  app.post("/api/admin/send-otp"', welcomeCode + '  app.post("/api/admin/send-otp"');
}

fs.writeFileSync('server.ts', content);
