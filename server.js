const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

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


// Catch-all route for any other requests (fallback to your HTML file)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

