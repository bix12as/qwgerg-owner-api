const express = require('express');
const fs = require('fs');
const path = require('path'); // Added path module for better file handling

const router = express.Router();


// Path to store inventory (file-based or could be database)
const inventoryFilePath = path.join(__dirname, 'inventory.json');

// Read inventory from file
const readInventory = () => {
    try {
        const data = fs.readFileSync(inventoryFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading inventory:', error);
        return []; // If error occurs, return empty inventory
    }
};

// Write updated inventory back to file
const writeInventory = (inventory) => {
    try {
        fs.writeFileSync(inventoryFilePath, JSON.stringify(inventory, null, 2));
    } catch (error) {
        console.error('Error writing inventory:', error);
    }
};

// API route to add an item to inventory
// /v2/inv/coderx/inv?cost=300&description=thisis%20for%20protection
router.get('/coderx/inv', (req, res) => {
    const { cost, description } = req.query;

    // Validate query parameters
    if (!cost || !description) {
        return res.status(400).json({ error: "Missing required parameters: cost and description." });
    }

    // Validate that cost is a number
    const costNumber = parseInt(cost, 10);
    if (isNaN(costNumber) || costNumber <= 0) {
        return res.status(400).json({ error: "Cost must be a positive number." });
    }

    // Create the new item object
    const newItem = {
        id: `item${Date.now()}`, // Use timestamp as unique ID for the item
        name: description.split(' ')[0], // Use the first word of the description as the name (just an example)
        price: costNumber,
        description: description
    };

    // Get the current inventory
    const inventory = readInventory();

    // Add the new item to the inventory
    inventory.push(newItem);

    // Save the updated inventory
    writeInventory(inventory);

    // Return the created item as a response
    return res.status(200).json({
        message: "Item added to inventory",
        item: newItem
    });
});



// API route to handle purchase and remove the item
// /v2/inv//coderx/purchase?itemName=thisis
router.get('/coderx/purchase', (req, res) => {
    const { itemName } = req.query;

    // Validate query parameter
    if (!itemName) {
        return res.status(400).json({ error: "Missing required parameter: itemName." });
    }

    // Get the current inventory
    const inventory = readInventory();

    // Find the item in the inventory by name
    const itemIndex = inventory.findIndex(item => item.name.toLowerCase() === itemName.toLowerCase());

    if (itemIndex === -1) {
        return res.status(404).json({ error: "Item not found in inventory." });
    }

    // Remove the item from the inventory
    const purchasedItem = inventory.splice(itemIndex, 1)[0];

    // Save the updated inventory
    writeInventory(inventory);

    // Return a success response with the details of the purchased item
    return res.status(200).json({
        message: "Purchase successful!",
        purchasedItem
    });
});

module.exports = router;