const express = require('express');
const fs = require('fs');
const axios = require('axios');
const path = require('path'); // Added path module for better file handling

const router = express.Router();

// Helper function to fetch random Pokémon data
const getRandomPokemon = async () => {
    const randomId = Math.floor(Math.random() * 898) + 1; // Random number between 1 and 898 (total Pokémon available)
    const url = `https://pokeapi.co/api/v2/pokemon/${randomId}`;
    try {
        const response = await axios.get(url);
        const pokemon = response.data;

        // Constructing Pokémon data object with name, ID, image, and stats
        return {
            name: pokemon.name,
            id: pokemon.id,
            image: pokemon.sprites.front_default, // You can also use other sprites based on your needs
            stats: pokemon.stats.map((stat) => ({
                name: stat.stat.name,
                value: stat.base_stat
            })) // Pokémon stats (HP, Attack, Defense, etc.)
        };
    } catch (error) {
        console.error('Error fetching Pokémon data:', error);
        throw new Error('Failed to fetch Pokémon data');
    }
};

// Define your endpoint
router.get('/coderx/pokemon', async (req, res) => {
    try {
        const randomPokemon = await getRandomPokemon();
        res.json(randomPokemon); // Sends the random Pokémon data as a JSON response
    } catch (error) {
        res.status(500).json({ message: 'Error fetching Pokémon', error: error.message });
    }
});

module.exports = router;