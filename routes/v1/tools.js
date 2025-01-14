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
    const randomKey = Math.random().toString(36).substring(2, 8);
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

module.exports = router;
