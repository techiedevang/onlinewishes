const https = require('https');
https.get('https://html.duckduckgo.com/html/?q=site:unsplash.com+sorry+apology', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const matches = data.match(/https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9-]+/g);
    console.log(matches ? [...new Set(matches)].slice(0, 5) : 'none');
  });
});
