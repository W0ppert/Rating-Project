const express = require('express');
const app = express();
const port = 3469;
const mysql = require('mysql');
app.use(express.static('..\\Project'));

// Database connection
const db = require('./database');


// Parse JSON bodies
app.use(express.json());

// Create API routes
app.get('/products', async (req, res) => {
  try {
    const products = await db.getProducts();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const product = await db.getProductById(id);
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: 'Product not found' });
  }
});

app.get('/ratings', async (req, res) => {
  try {
    const ratings = await db.getRatings();
    res.json(ratings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching ratings' });
  }
});

app.get('/ratings/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const rating = await db.getRatingById(id);
    res.json(rating);
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: 'Rating not found' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});