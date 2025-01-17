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
// /v2/inv/coderx/inv?id=promo&cost=300&description=thisis%20for%20protection
router.get('/coderx/inv', (req, res) => {
    const { id, cost, description } = req.query;

    // Validate query parameters
    if (!id || !cost || !description) {
        return res.status(400).json({ error: "Missing required parameters: id, cost, and description." });
    }

    // Validate that cost is a number
    const costNumber = parseInt(cost, 10);
    if (isNaN(costNumber) || costNumber <= 0) {
        return res.status(400).json({ error: "Cost must be a positive number." });
    }

    // Create the new item object with the provided id, name, price, and description
    const newItem = {
        id: id, // Use the provided id
        name: description.split(' ').slice(0, 3).join(' '), // Take the first 3 words of the description as the name
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
        item: newItem
    });
});




// /v2/inv/coderx/check-inv
router.get('/coderx/check-inv', (req, res) => {
    // Read the current inventory
    const inventory = readInventory();

    // Check if inventory is empty
    if (!inventory || inventory.length === 0) {
        return res.status(404).json({ error: "No items found in the inventory." });
    }

    // Return the inventory as a response
    return res.status(200).json({
        inventory: inventory
    });
});



// API route to handle purchase and remove the item by ID
// /v2/inv/coderx/purchase?id=promo
router.get('/coderx/purchase', (req, res) => {
    const { id } = req.query;

    // Validate query parameter
    if (!id) {
        return res.status(400).json({ error: "Missing required parameter: id." });
    }

    // Get the current inventory
    const inventory = readInventory();

    // Find the item in the inventory by id
    const itemIndex = inventory.findIndex(item => item.id.toLowerCase() === id.toLowerCase());

    if (itemIndex === -1) {
        return res.status(404).json({ error: "Item not found in inventory." });
    }

    // Remove the item from the inventory
    const purchasedItem = inventory.splice(itemIndex, 1)[0];

    // Save the updated inventory
    writeInventory(inventory);

    // Return a success response with the details of the purchased item
    return res.status(200).json({
        purchasedItem
    });
});


module.exports = router;
