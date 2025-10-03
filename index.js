require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const urlParser = require('url');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// In-memory storage for URLs
let urls = [];
let id = 1;

// POST endpoint to shorten URL
app.post('/api/shorturl', (req, res) => {
  const original_url = req.body.url;
  let hostname;

  try {
    hostname = urlParser.parse(original_url).hostname;
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }

  // Validate URL using dns.lookup and check protocol
  dns.lookup(hostname, (err) => {
    if (err || !/^https?:\/\//.test(original_url)) {
      return res.json({ error: 'invalid url' });
    } else {
      // Save and return short URL
      urls.push({ original_url, short_url: id });
      res.json({ original_url, short_url: id });
      id++;
    }
  });
});

// GET endpoint to redirect to original URL
app.get('/api/shorturl/:short_url', (req, res) => {
  const short_url = parseInt(req.params.short_url);
  const entry = urls.find(u => u.short_url === short_url);
  if (entry) {
    res.redirect(entry.original_url);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});