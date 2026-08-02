const admin = require("firebase-admin");
admin.initializeApp({
  projectId: "gen-lang-client-0123999783"
});
admin.auth().listUsers(1)
  .then((listUsersResult) => {
    console.log("Successfully fetched users list", listUsersResult.users.length);
  })
  .catch((error) => {
    console.log("Error fetching users list:", error.message);
  });
