const fs = require('fs');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Update req.body parsing to be safe
  content = content.replace(
    /const { adminEmail(, otp)? } = req\.body;/g,
    `let bodyData = req.body || {};
    if (typeof req.body === 'string') {
      try { bodyData = JSON.parse(req.body); } catch(e) {}
    }
    const { adminEmail$1 } = bodyData;`
  );

  // Return the actual error message
  content = content.replace(
    /res\.status\(500\)\.json\({ error: "Failed to generate OTP" }\);/g,
    'res.status(500).json({ error: "Failed to generate OTP: " + (err.message || String(err)) });'
  );
  content = content.replace(
    /res\.status\(500\)\.json\({ error: "Failed to verify OTP" }\);/g,
    'res.status(500).json({ error: "Failed to verify OTP: " + (err.message || String(err)) });'
  );

  fs.writeFileSync(filePath, content);
}

updateFile('api/admin/send-otp.js');
updateFile('api/admin/verify-otp.js');
