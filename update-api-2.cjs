const fs = require('fs');

function cleanFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  content = content.replace(/global\.localOtpStore = global\.localOtpStore \|\| new Map\(\);\n/g, '');
  content = content.replace(/global\.localOtpStore\.set\(adminEmail, \{ code: otpCode, expiresAt \}\);\n/g, '');
  
  content = content.replace(/global\.localOtpStore = global\.localOtpStore \|\| new Map\(\);\n/g, '');
  content = content.replace(/const memoryData = global\.localOtpStore\.get\(adminEmail\);\n/g, '');
  content = content.replace(/if \(memoryData && Date\.now\(\) <= memoryData\.expiresAt\) \{\n    console\.log\("Using valid in-memory OTP for verification"\);\n    return memoryData;\n  \}\n/g, '');
  
  content = content.replace(/global\.localOtpStore = global\.localOtpStore \|\| new Map\(\);\n/g, '');
  content = content.replace(/global\.localOtpStore\.delete\(adminEmail\);\n/g, '');

  fs.writeFileSync(filePath, content);
}

cleanFile('api/admin/send-otp.js');
cleanFile('api/admin/verify-otp.js');
