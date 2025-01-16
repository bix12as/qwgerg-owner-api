const express = require('express');
const fs = require('fs');
const path = require('path'); // Added path module for better file handling

const router = express.Router();

// Helper function to read and write keys from/to a file
const readKeysFromFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContent) || [];
    }
    return []; // Return empty array if the file doesn't exist
  } catch (error) {
    console.error('Error reading file:', error);
    throw new Error('Could not read the keys file');
  }
};

const writeKeysToFile = (filePath, keys) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(keys, null, 2));
  } catch (error) {
    console.error('Error writing to file:', error);
    throw new Error('Could not write to the keys file');
  }
};

// Helper function to generate random keys
const generateRandomKeys = (numKeys) => {
  const keys = [];
  for (let i = 0; i < numKeys; i++) {
    const randomKey = Math.random().toString(36).substring(2, 10); // Ensures 8 characters
    keys.push(randomKey);
  }
  return keys;
};


// Admin Command to generate keys and save to keys.json
// /v1/tools/coderx/ad-keys?username=admin&password=wevbin&numKeys=5
router.get('/coderx/ad-keys', async (req, res) => {
  try {
    const { username, password, numKeys = 5, filePath } = req.query;

    // Validate credentials
    if (username !== 'admin' || password !== 'wevbin') {
      return res.status(403).json({ error: 'Invalid username or password.' });
    }

    // Default file path if not provided
    const keysFilePath = filePath || './keys.json';

    // Generate the random keys
    const keys = generateRandomKeys(Number(numKeys));

    // Read current keys from the file and append the new ones
    const currentKeys = readKeysFromFile(keysFilePath);
    currentKeys.push(...keys);

    // Save the updated keys back to the file
    writeKeysToFile(keysFilePath, currentKeys);

    res.json({
      success: true,
      message: `${numKeys} keys have been successfully generated and saved.`,
      keys: keys,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error, please try again later.' });
  }
});

// API to get the first key, remove it and return it
// /v1/tools/coderx/get-keys?getKeyKey=1
/*
router.get('/coderx/get-keys', async (req, res) => {
  try {
    const { getKeyKey } = req.query;

    // Validate the 'getKeyKey' parameter
    const numKeysToRemove = parseInt(getKeyKey, 10);
    if (isNaN(numKeysToRemove) || numKeysToRemove <= 0) {
      return res.status(400).json({ error: 'Invalid number of keys requested.' });
    }

    const keysFilePath = './keys.json';

    // Read the current keys from the file
    const currentKeys = readKeysFromFile(keysFilePath);

    // Check if there are enough keys to remove
    if (numKeysToRemove > currentKeys.length) {
      return res.status(400).json({ error: 'Not enough keys available to retrieve.' });
    }

    // Remove the specified number of keys from the beginning
    const removedKeys = currentKeys.splice(0, numKeysToRemove);

    // Save the updated keys back to the file
    writeKeysToFile(keysFilePath, currentKeys);

    res.json({
      success: true,
      message: `${numKeysToRemove} keys have been successfully retrieved.`,
      keys: removedKeys,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error, please try again later.' });
  }
});
*/
router.get('/coderx/get-keys', async (req, res) => {
  try {
    const { getKeyKey } = req.query;

    // Validate the 'getKeyKey' parameter
    const numKeysToRetrieve = parseInt(getKeyKey, 10);
    if (isNaN(numKeysToRetrieve) || numKeysToRetrieve <= 0) {
      return res.status(400).json({ error: 'Invalid number of keys requested.' });
    }

    const keysFilePath = './keys.json';

    // Read the current keys from the file
    const currentKeys = readKeysFromFile(keysFilePath);

    // Check if there are enough keys to retrieve
    if (numKeysToRetrieve > currentKeys.length) {
      return res.status(400).json({ error: 'Not enough keys available to retrieve.' });
    }

    // Select the specified number of keys without removing them
    const retrievedKeys = currentKeys.slice(0, numKeysToRetrieve);

    res.json({
      success: true,
      message: `${numKeysToRetrieve} keys have been successfully retrieved.`,
      keys: retrievedKeys,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error, please try again later.' });
  }
});





// /v1/tools/coderx/ad-rewards?username=admin&password=wevbin&Keys=1&description=Free
router.get('/coderx/ad-rewards', async (req, res) => {
  try {
    const { username, password, Keys, description, filePath } = req.query; // Changed keys to Keys

    // Validate credentials
    if (username !== 'admin' || password !== 'wevbin') {
      return res.status(403).json({ error: 'Invalid username or password.' });
    }

    // Validate input parameters
    if (!Keys || isNaN(Keys) || Keys <= 0) { // Changed keys to Keys
      return res.status(400).json({ error: 'Invalid or missing "Keys" parameter.' });
    }

    if (!description) {
      return res.status(400).json({ error: 'Description is required.' });
    }

    // Default file path if not provided
    const rewardsFilePath = filePath || './rewards.json';

    // Generate the random keys
    const generatedKeys = generateRandomKeys(Number(Keys)); // Changed keys to Keys

    // Read current rewards from the file
    const currentRewards = readKeysFromFile(rewardsFilePath);

    // Create rewards objects with descriptions and add to current rewards
    const newRewards = generatedKeys.map(keys => ({
      keys,
      description,
    }));
    currentRewards.push(...newRewards);

    // Save the updated rewards back to the file
    writeKeysToFile(rewardsFilePath, currentRewards);

    res.json({
      success: true,
      message: `${Keys} rewards have been successfully generated and saved.`,
      rewards: newRewards,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error, please try again later.' });
  }
});


// Endpoint to claim a reward (delete it from rewards.json)
// /v1/tools/coderx/claim-rewards?key=Abc123X
function readRewardsFromFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data); // Parse the JSON data into an object
  } catch (error) {
    throw new Error('Could not read rewards file');
  }
}

// Function to write updated rewards to the file
function writeRewardsToFile(filePath, rewards) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(rewards, null, 2), 'utf8');
  } catch (error) {
    throw new Error('Could not write to rewards file');
  }
}

// Endpoint to claim a reward (delete it from rewards.json)
// /v1/tools/coderx/claim-rewards?key=m20po4p5
router.get('/coderx/claim-rewards', async (req, res) => {
  try {
    const { key, filePath } = req.query;

    // Default file path if not provided
    const rewardsFilePath = filePath || './rewards.json';

    // Read current rewards from the file
    const currentRewards = readRewardsFromFile(rewardsFilePath);

    // Find the index of the key in the rewards
    const keyIndex = currentRewards.findIndex(reward => reward.keys === key);

    if (keyIndex === -1) {
      return res.status(400).json({ error: 'Invalid or already claimed key.' });
    }

    // Remove the key from the rewards array
    const updatedRewards = currentRewards.filter(reward => reward.keys !== key);

    // Save the updated rewards back to the file
    writeRewardsToFile(rewardsFilePath, updatedRewards);

    // Send the success response
    res.json({
      success: true,
      message: `Reward with key ${key} has been successfully claimed. Contact Owner again to get ur reward.`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error, please try again later.' });
  }
});







////// group promo
// /v1/tools/coderx/gcpromo?link=https://example.com/promo123
router.get('/coderx/gcpromo', (req, res) => {
  const promoLink = req.query.link;

  // Validate the promo link
  if (!promoLink) {
      return res.status(400).json({ message: "⚠️ Please provide a valid promo link using ?link={your_link}" });
  }

  // Optionally, you can add further validation to check if the link is a valid URL.
  const isValidUrl = (url) => {
      try {
          new URL(url);
          return true;
      } catch (_) {
          return false;
      }
  };

  if (!isValidUrl(promoLink)) {
      return res.status(400).json({ message: "⚠️ The provided link is not a valid URL." });
  }

  // Respond with a success message
  return res.json({
      message: `🎉 Promo link successfully added! Your promotional link: ${promoLink}`,
      promo: { link: promoLink, createdAt: new Date() }
  });
});

module.exports = router;
