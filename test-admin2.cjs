const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const app = initializeApp({
  projectId: "gen-lang-client-0123999783"
});
getAuth(app).listUsers(1)
  .then((res) => {
    console.log("Success", res.users.length);
  })
  .catch((err) => {
    console.log("Error:", err.message);
  });
