const mysql = require('mysql');

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'croatia_project'
});

db.connect((error) => {
  if (error) {
    console.error('Error connecting to database:', error);
    return;
  }
  console.log('Connected to database');
});

// Execute a query and return the results as an array of rows
db.execute = function(query, params) {
  return new Promise((resolve, reject) => {
    db.query(query, params, (error, results, fields) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};


// Get all products
async function getProducts() {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM products', (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results); // Return the results array directly
      }
    });
  });
}

// Get product by ID
async function getProductById(id) {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM products WHERE id = ?', [id], (error, results) => {
      if (error) {
        console.error(error); // Log the error
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
    db.query('SELECT * FROM ratings WHERE id = ?', [id], (error, results) => {
      if (error) {
        console.error(error); // Log the error
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
  getRatingById,
  
};
