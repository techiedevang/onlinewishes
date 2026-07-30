import fetch from "node-fetch";

async function test() {
  const projectId = "gen-lang-client-0123999783";
  const dbId = "ai-studio-bestiescrapbook-e95b4bbe-fcce-4da3-8e13-ccd86dd2f84a";
  const apiKey = "AIzaSyAAsl785OWTeliRX3BvzybSWnI7thRCoBI";
  
  const docId = "admin_test";
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/admin_otps?documentId=${docId}&key=${apiKey}`;
  
  const body = {
    fields: {
      code: { stringValue: "123456" },
      expiresAt: { stringValue: "99999" }
    }
  };
  
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  console.log(res.status);
  console.log(await res.text());
}
test();
