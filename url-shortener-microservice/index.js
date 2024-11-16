require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const app = express();


const port = process.env.PORT || 3000;


let urlDatabase = [];
let urlCounter = 1;


app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));


app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

const isValidUrl = (url) => {
  const urlPattern = /^(http|https):\/\/(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}.*$/;
  return urlPattern.test(url);
};

app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;
  
  if (!isValidUrl(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }
  
  const hostname = new URL(originalUrl).hostname;

  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    const shortUrl = urlCounter++;
    urlDatabase.push({ original_url: originalUrl, short_url: shortUrl });
    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url);

  const urlEntry = urlDatabase.find((entry) => entry.short_url === shortUrl);

  if (urlEntry) {
    res.redirect(urlEntry.original_url);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
