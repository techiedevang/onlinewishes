import fetch from "node-fetch";

async function test() {
  const projectId = "gen-lang-client-0123999783";
  const dbId = "ai-studio-bestiescrapbook-e95b4bbe-fcce-4da3-8e13-ccd86dd2f84a";
  const apiKey = process.env.GEMINI_API_KEY || "AIzaSy_FAKE_KEY_FOR_TESTING_123456789";
  
  const docId = "admin_test";
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents:commit?key=${apiKey}`;
  
  const body = {
    writes: [
      {
        update: {
          name: `projects/${projectId}/databases/${dbId}/documents/admin_otps/${docId}`,
          fields: {
            code: { stringValue: "123456" }
          }
        }
      }
    ]
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
