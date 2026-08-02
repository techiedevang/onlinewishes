const fs = require('fs');
const path = require('path');
const file = path.join(process.cwd(), 'src/lib/firebase.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace("import { getFirestore } from 'firebase/firestore';", "import { initializeFirestore } from 'firebase/firestore';");
content = content.replace(
  "export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);", 
  "export const db = initializeFirestore(app, { experimentalForceLongPolling: true }, firebaseConfig.firestoreDatabaseId);"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Firebase.ts updated');
