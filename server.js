const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

// Import routes (v1)

const v1tools = require('./routes/v1/tools');



const app = express();
const PORT = 3000;

// Middleware to serve static files (HTML, CSS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Body parser middleware
app.use(bodyParser.json());

// Global API request counter
let apiRequestCount = 0;

// Middleware to count API requests
function apiRequestCounter(req, res, next) {
  if (req.path.startsWith('/v1/') || req.path.startsWith('/v2/') ) {
    apiRequestCount++;
  }
  next();
}

// Use the counter middleware for API routes
app.use(apiRequestCounter);


app.use('/v1/tools', v1tools);



// Endpoint to get the API request count
app.get('/api/request-count', (req, res) => {
  res.json({ count: apiRequestCount });
});

// Endpoint to claim a prize
app.post('/claim', (req, res) => {
  const { key } = req.body;

  // Read keys.json to check for the key
  fs.readFile('keys.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Could not read keys file.' });
    }

    const keys = JSON.parse(data);

    if (keys.includes(key)) {
      // If key exists, remove it from the array
      const updatedKeys = keys.filter(existingKey => existingKey !== key);

      // Update the keys.json file
      fs.writeFile('keys.json', JSON.stringify(updatedKeys, null, 2), (writeErr) => {
        if (writeErr) {
          return res.status(500).json({ error: 'Failed to update keys file.' });
        }

        // Generate WhatsApp message API link
        const whatsappMessage = `https://wa.me/27717311486?text=I%20just%20claimed%20my%20prize%20with%20the%20*key*%3A%20${key}%0A%0ACODERX%20SOCIAL%20SERVICE`;

        // Send the response with the WhatsApp link
        res.json({ success: true, whatsappLink: whatsappMessage });
      });
    } else {
      res.status(400).json({ error: 'Invalid or used key.' });
    }
  });
});

// Catch-all route for any other requests (fallback to your HTML file)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

