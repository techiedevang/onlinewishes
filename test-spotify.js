const url = 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT';
const match = url.match(/(track|playlist|album|episode|show|artist)\/([a-zA-Z0-9]+)/);
console.log(match ? `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0&autoplay=1` : 'no match');
