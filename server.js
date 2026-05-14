const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Disable caching for HTML so users always get the latest build after deploy.
// Static assets (images, JS, CSS) can still be cached normally.
app.use((req, res, next) => {
  if (req.path === '/' || req.path.endsWith('.html')) {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
});

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'lucky-stone.html'));
});

app.get('/healthz', (req, res) => {
  res.status(200).send('ok');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Lucky Stone app listening on port ${PORT}`);
});
