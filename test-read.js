import fetch from "node-fetch";
async function test() {
  const projectId = "gen-lang-client-0123999783";
  const dbId = "ai-studio-bestiescrapbook-e95b4bbe-fcce-4da3-8e13-ccd86dd2f84a";
  const apiKey = "AIzaSyAAsl785OWTeliRX3BvzybSWnI7thRCoBI";
  
  const docId = encodeURIComponent("admin@onlinewishes.in");
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/admin_otps/${docId}?key=${apiKey}`;
  
  const res = await fetch(url);
  console.log(res.status);
  console.log(await res.text());
}
test();
