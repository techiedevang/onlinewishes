const config = require('./firebase-applet-config.json');

async function test() {
  const apiKey = config.apiKey;
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requestType: 'PASSWORD_RESET',
      email: 'itsmedevu16@gmail.com'
    })
  });
  const data = await response.json();
  console.log(data);
}
test();
