const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  content = content.replace(
    /if \(storedData\.code !== \(otp \|\| ""\)\.trim\(\)\) {\s*return res\.status\(400\)\.json\({ error: "Invalid 6-digit OTP code\." }\);\s*}/,
    `if (storedData.code !== (otp || "").trim()) {
        console.log(\`OTP mismatch for \${adminEmail}: expected \${storedData.code}, got \${(otp || "").trim()}\`);
        return res.status(400).json({ error: "Invalid 6-digit OTP code." });
      }`
  );
  fs.writeFileSync(filePath, content);
}

fixFile('server.ts');
fixFile('api/admin/verify-otp.js');
