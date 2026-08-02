const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const app = initializeApp({
  projectId: "gen-lang-client-0123999783"
});

async function run() {
  try {
    const user = await getAuth(app).getUserByEmail("itsmedevu16@gmail.com");
    console.log("User UID:", user.uid);
  } catch (err) {
    console.log("Error:", err.message);
  }
}
run();
