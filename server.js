const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/products', (req, res) => {
    const products = [
        { id: 1, name: "Espresso Supreme", price: 4.50, image: "espresso.png", description: "Rich and dark roast." },
        { id: 2, name: "Latte Artistico", price: 5.00, image: "latte.png", description: "Creamy milk with a hint of vanilla." },
        { id: 3, name: "Cappuccino Classic", price: 4.75, image: "cappuccino.png", description: "Perfect balance of espresso and foam." },
        { id: 4, name: "Mocha Delight", price: 5.50, image: "mocha.png", description: "Chocolate infused coffee experience." }
    ];
    res.json(products);
});

app.post('/api/order', (req, res) => {
    const { items, total } = req.body;
    console.log("Order received:", items, "Total:", total);
    // Simulate order processing
    setTimeout(() => {
        res.json({ success: true, message: "Order placed successfully!", orderId: Math.floor(Math.random() * 10000) });
    }, 1000);
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Catch-all to serve index.html for any other requests (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
