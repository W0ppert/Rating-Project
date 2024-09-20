const mysql = require('mysql');

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'Project_croatia'
});

db.connect((error) => {
  if (error) {
    console.error('Error connecting to database:', error);
    return;
  }
  console.log('Connected to database');
});

// Get all products
async function getProducts() {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM products', (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

// Get product by ID
async function getProductById(id) {
  return new Promise((resolve, reject) => {
    db.query(`SELECT * FROM products WHERE id = ${id}`, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results[0]);
      }
    });
  });
}

// Get all ratings
async function getRatings() {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM ratings', (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

// Get rating by ID
async function getRatingById(id) {
  return new Promise((resolve, reject) => {
    db.query(`SELECT * FROM ratings WHERE id = ${id}`, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results[0]);
      }
    });
  });
}

module.exports = {
  getProducts,
  getProductById,
  getRatings,
  getRatingById
};