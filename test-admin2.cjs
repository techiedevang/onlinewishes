const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
admin.initializeApp({
  projectId: config.projectId,
});
const db = getFirestore();
db.settings({ databaseId: config.firestoreDatabaseId });

async function test() {
  try {
    await db.collection('admin_otps').doc('admin_test_admin').set({
      code: '123456',
      expiresAt: Date.now() + 10000
    });
    console.log("Success");
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
