const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const draftCode = `  app.post("/api/send-draft-reminder", async (req, res) => {
    try {
      const { email, name, templateName } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      
      await resend.emails.send({
        from: "OnlineWishes <support@onlinewishes.in>",
        to: email,
        subject: "You left your surprise half-finished! 🎁",
        html: \`
          <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #ffffff; color: #1e293b; border-radius: 16px; max-width: 500px; border: 1px solid #e2e8f0;">
            <h2 style="color: #f43f5e; margin-top: 0; font-size: 24px;">Hi \${name || 'there'}!</h2>
            <p style="color: #475569; font-size: 16px;">We noticed you were creating a beautiful <strong>\${templateName || 'surprise'}</strong> but left it half-finished.</p>
            <p style="color: #475569; font-size: 16px;">Your loved one is waiting for this special gift. Come back and complete your masterpiece!</p>
            <div style="margin: 24px 0;">
              <a href="https://onlinewishes.in" style="background-color: #f43f5e; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Continue Editing</a>
            </div>
            <hr style="border-color: #e2e8f0; margin-top: 24px; margin-bottom: 16px;"/>
            <p style="font-size: 12px; color: #94a3b8;">The OnlineWishes Team</p>
          </div>
        \`,
      });
      
      res.json({ success: true, message: "Draft reminder email sent successfully." });
    } catch (error: any) {
      console.error("Draft Email Error:", error);
      res.status(500).json({ error: "Failed to send draft email." });
    }
  });\n\n`;

if (!content.includes('/api/send-draft-reminder')) {
  content = content.replace('  app.post("/api/admin/send-otp"', draftCode + '  app.post("/api/admin/send-otp"');
  fs.writeFileSync('server.ts', content);
}
