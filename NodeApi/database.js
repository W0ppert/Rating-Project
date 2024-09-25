const mysql = require('mysql2/promise');

// Database connection
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'croatia_project'
});

// Get all products
async function getProducts() {
  const [results] = await db.query('SELECT * FROM products');
  return results;
}

// Get product by ID
async function getProductById(id) {
  const [results] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
  return results[0];
}

// Get all ratings
async function getRatings() {
  const [results] = await db.query('SELECT * FROM ratings');
  return results;
}

async function getReviews() {
  const [rows] = await pool.query('SELECT * FROM reviews');
  return rows;
}


// Get rating by ID
async function getRatingById(id) {
  const [results] = await db.query('SELECT * FROM ratings WHERE id = ?', [id]);
  return results[0];
}

module.exports = {
  db,
  getProducts,
  getProductById,
  getRatings,
  getRatingById,
  getReviews
};
