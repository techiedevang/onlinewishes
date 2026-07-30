const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Replace the PATCH block
  content = content.replace(
    /const url = `https:\/\/firestore\.googleapis\.com\/v1\/projects\/\$\{projectId\}\/databases\/\$\{dbId\}\/documents\/admin_otps\/\$\{docId\}\?key=\$\{apiKey\}&updateMask\.fieldPaths=code&updateMask\.fieldPaths=expiresAt`;\s+const body = \{\s+fields: \{\s+code: \{ stringValue: otpCode \},\s+expiresAt: \{ stringValue: String\(expiresAt\) \}\s+\}\s+\};\s+const response = await fetch\(url, \{\s+method: 'PATCH',\s+headers: \{\s+'Content-Type': 'application\/json'\s+\},\s+body: JSON\.stringify\(body\)\s+\}\);/g,
    `const url = \`https://firestore.googleapis.com/v1/projects/\${projectId}/databases/\${dbId}/documents:commit?key=\${apiKey}\`;
    const body = {
      writes: [
        {
          update: {
            name: \`projects/\${projectId}/databases/\${dbId}/documents/admin_otps/\${docId}\`,
            fields: {
              code: { stringValue: otpCode },
              expiresAt: { stringValue: String(expiresAt) }
            }
          }
        }
      ]
    };
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });`
  );

  fs.writeFileSync(filePath, content);
}

fixFile('server.ts');
fixFile('api/admin/send-otp.js');
