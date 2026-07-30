const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  content = content.replace(
    /const url = `https:\/\/firestore\.googleapis\.com\/v1\/projects\/\$\{projectId\}\/databases\/\$\{dbId\}\/documents:commit\?key=\$\{apiKey\}`;[\s\S]*?const response = await fetch\(url, {\s*method: 'POST',[\s\S]*?body: JSON\.stringify\(body\)\s*}\);/,
    `const url = \`https://firestore.googleapis.com/v1/projects/\${projectId}/databases/\${dbId}/documents/admin_otps/\${docId}?key=\${apiKey}&updateMask.fieldPaths=code&updateMask.fieldPaths=expiresAt\`;
    const body = {
      fields: {
        code: { stringValue: otpCode },
        expiresAt: { stringValue: String(expiresAt) }
      }
    };
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });`
  );

  fs.writeFileSync(filePath, content);
}

fixFile('server.ts');
