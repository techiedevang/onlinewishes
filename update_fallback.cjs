const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetFunctionStart = "async function _sendEmailWithFallbackCore({ to, subject, html, text }: { to: string; subject: string; html: string; text?: string }) {";
const newFunctionBody = `
  async function _sendEmailWithFallbackCore({ to, subject, html, text }: { to: string; subject: string; html: string; text?: string }) {
    let errors: string[] = [];
    
    // Attempt 0: Google App Script API (if provided)
    const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL;
    if (googleScriptUrl) {
      if (!googleScriptUrl.endsWith("/exec")) {
         const warnMsg = "The GOOGLE_SCRIPT_URL does not end with '/exec'. You may have provided the editor URL instead of a deployed Web App URL.";
         console.warn("[Google App Script warning]:", warnMsg);
         errors.push(warnMsg);
      }
      try {
        const res = await fetch(googleScriptUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to, subject, html, text: text || "OnlineWishes Notification" })
        });
        
        const contentType = res.headers.get("content-type") || "";
        const bodyText = await res.text();
        
        if (res.ok && !bodyText.includes('<div id="drive-logo">') && !bodyText.includes('需要存取權') && !bodyText.includes('You need permission')) {
          console.log(\`[Email Success - Google App Script API] Sent to \${to}\`);
          return { success: true, provider: 'google-app-script' };
        } else {
          const err = \`Google Script API returned status \${res.status} or a Google Drive permission error page. Please ensure it is deployed as a Web App with 'Execute as: Me' and 'Who has access: Anyone'.\`;
          errors.push(err);
          console.warn("[Google App Script error/warning]:", err);
        }
      } catch (err: any) {
        const msg = err?.message || String(err);
        errors.push(\`Google Script Fetch Error: \${msg}\`);
        console.warn("[Google App Script fetch error]:", msg);
      }
    }

    const resendClient = getResendClient();

    if (resendClient) {
      // Attempt 1: Resend with custom domain or environment sender address
      const customSender = process.env.RESEND_FROM_EMAIL || "OnlineWishes <support@onlinewishes.in>";
      try {
        const res = await resendClient.emails.send({
          from: customSender,
          to,
          subject,
          html,
        });
        if (res.data && !res.error) {
          console.log(\`[Email Success - \${customSender}] Sent to \${to}\`);
          return { success: true, provider: 'resend-custom' };
        }
        if (res.error) {
          const msg = res.error.message || JSON.stringify(res.error);
          errors.push(\`Resend Custom Domain Error: \${msg}\`);
          console.warn(\`[Resend custom domain note - \${customSender}]:\`, res.error);
        }
      } catch (err: any) {
        const msg = err?.message || String(err);
        errors.push(\`Resend Custom Domain Exception: \${msg}\`);
        console.warn(\`[Resend custom domain error - \${customSender}]:\`, msg);
      }

      // Attempt 2: Resend with onboarding@resend.dev (default verified Resend domain)
      try {
        const res = await resendClient.emails.send({
          from: "OnlineWishes <onboarding@resend.dev>",
          to,
          subject,
          html,
        });
        if (res.data && !res.error) {
          console.log(\`[Email Success - onboarding@resend.dev] Sent to \${to}\`);
          return { success: true, provider: 'resend-dev' };
        }
        if (res.error) {
          const msg = res.error.message || JSON.stringify(res.error);
          errors.push(\`Resend Onboarding Error: \${msg}\`);
          console.warn("[Resend dev note]:", res.error);
        }
      } catch (err: any) {
        const msg = err?.message || String(err);
        errors.push(\`Resend Onboarding Exception: \${msg}\`);
        console.warn("[Resend dev error]:", msg);
      }
    }

    // Attempt 3: Nodemailer / SMTP fallback
    const transporter = getTransporter();
    if (transporter) {
      const smtpUser = process.env.SMTP_USER || "codelearnpoint@gmail.com";
      try {
        await transporter.sendMail({
          from: \`"OnlineWishes" <\${smtpUser}>\`,
          to,
          subject,
          html,
          text: text || "OnlineWishes Notification",
        });
        console.log(\`[Email Success - Nodemailer SMTP] Sent to \${to}\`);
        return { success: true, provider: 'nodemailer' };
      } catch (smtpErr: any) {
        const msg = smtpErr?.message || String(smtpErr);
        errors.push(\`Nodemailer SMTP Error: \${msg}\`);
        console.warn("[Nodemailer SMTP error]:", msg);
      }
    }

    const finalError = errors.length > 0 ? errors.join(" | ") : "Email delivery failed: No providers configured or all failed.";
    console.error(\`[Email Delivery Failure] Could not send email to \${to}:\`, finalError);
    return { success: false, error: finalError };
  }
`;

const startIndex = code.indexOf(targetFunctionStart);
const endIndex = code.indexOf("async function sendPasswordChangeConfirmationEmail", startIndex);
// Find the previous closing brace before sendPasswordChangeConfirmationEmail
const closingBraceIndex = code.lastIndexOf("}", endIndex);

if (startIndex !== -1 && closingBraceIndex !== -1) {
  const newCode = code.substring(0, startIndex) + newFunctionBody + code.substring(closingBraceIndex + 1);
  fs.writeFileSync('server.ts', newCode);
  console.log("Updated server.ts successfully.");
} else {
  console.log("Could not find boundaries.");
}
