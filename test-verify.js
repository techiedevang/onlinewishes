import fetch from "node-fetch";

async function test() {
  const adminEmail = "admin@onlinewishes.in";
  const docId = encodeURIComponent(adminEmail);
  const projectId = "gen-lang-client-0123999783";
  const dbId = "ai-studio-bestiescrapbook-e95b4bbe-fcce-4da3-8e13-ccd86dd2f84a";
  const apiKey = "AIzaSyAAsl785OWTeliRX3BvzybSWnI7thRCoBI";

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/admin_otps/${docId}?key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  const code = data.fields?.code?.stringValue;
  const expiresAt = Number(data.fields?.expiresAt?.stringValue || "0");
  console.log("code:", code);
  console.log("expiresAt:", expiresAt);
  console.log("Date.now():", Date.now());
  console.log("isValid:", Date.now() <= expiresAt);
}
test();
