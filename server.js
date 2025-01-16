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


app.post('/claim', (req, res) => {
  const { key } = req.body;

  // Read keys.json to check for the key
  fs.readFile('keys.json', 'utf8', (err, keysData) => {
    if (err) {
      return res.status(500).json({ error: 'Could not read keys file.' });
    }

    const keys = JSON.parse(keysData);

    // Check if the key exists in the keys array
    if (keys.includes(key)) {
      // If key exists, remove it from the array
      const updatedKeys = keys.filter(existingKey => existingKey !== key);

      // Update the keys.json file
      fs.writeFile('keys.json', JSON.stringify(updatedKeys, null, 2), (writeErr) => {
        if (writeErr) {
          return res.status(500).json({ error: 'Failed to update keys file.' });
        }

        // Read rewards.json to find the matching reward and get its description
        fs.readFile('rewards.json', 'utf8', (rewardErr, rewardsData) => {
          if (rewardErr) {
            return res.status(500).json({ error: 'Could not read rewards file.' });
          }

          const rewards = JSON.parse(rewardsData);

          // Get the first reward (or modify to match a particular reward logic)
          const reward = rewards[0];  // Assuming we need the first reward as per your example

          if (!reward) {
            return res.status(400).json({ error: 'Reward not found.' });
          }

          // Generate WhatsApp message API link with the reward details
          const whatsappMessage = `https://wa.me/27717311486?text=Congratulations%20you%20just%20claimed%20your%20reward!%0A%0AUsed%20Key%3A%20*${key}*%0AAPI%20Key%3A%20*${reward.keys}*%0ADescription%3A%20${encodeURIComponent(reward.description)}%0A%0AThank%20you%20for%20using%20Nebula%20Bot!`;

          // Send the response with the reward details, key, and WhatsApp link
          res.json({ 
            success: true, 
            reward: `API REWARDS key: ${key} - ${reward.description}`, 
            whatsappLink: whatsappMessage 
          });
        });
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

