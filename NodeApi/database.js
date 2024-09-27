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



async function getReviews() {
  const [rows] = await pool.query('SELECT * FROM reviews');
  return rows;
}


// Get reviws by ID
async function getReviewsById(product_id) {
  const [results] = await db.query('SELECT * FROM reviews WHERE product_id = ?', [product_id]);
  return results[0];
}

module.exports = {
  db,
  getProducts,
  getProductById,
  getReviews,
  getReviewsById                                    
};
