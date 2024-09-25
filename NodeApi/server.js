const express = require('express');
const app = express();
const port = 3000;
const mysql = require('mysql');

// Database connection
const database = require('./database');
const { db, getProducts, getProductById, getRatings, getRatingById } = database;
// Parse JSON bodies
app.use(express.json());

app.get('/', (req, res) => {

  res.redirect('/index.html');

});
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});
// Create API routes
app.get('/products', async (req, res) => {
  try {
    const products = await getProducts(); // Call the getProducts function directly
    res.json(products);
  } catch (error) {
    console.error(`Error fetching products: ${error.message}`);
    console.error(error.stack);
    res.status(500).json({ message: 'Error fetching products' });
  }
});
app.post('/products', async (req, res) => {
  try {
    const { title, price, description, catergory, image } = req.body;
    const sql = 'INSERT INTO users (title,price,description,catergory,image) VALUES (?, ?)';
    const [result] = await db.execute(sql, [title, price, description, catergory, image]);
    res.status(201).json({ id: result.insertId, title, price, description, catergory, image });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.delete('/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const sql = 'DELETE FROM users WHERE id =? ';
    await db.execute(sql, [id]);
    res.status(204).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, price, description, catergory, image } = req.body;
    const sql = 'UPDATE users SET title = ?, price = ?, description = ?, catergory = ?, image = ? WHERE id = ?';
    const [result] = await db.execute(sql, [title, price, description, catergory, image, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ id, title, price, description, catergory, image });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const product = await getProductById(id); // Call the getProductById function directly
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: 'Product not found' });
  }
});
app.get('/products', async (req, res) => {
  try {
    const products = await db.getProducts();
    res.json(products);
  } catch (error) {
  console.error(`Error fetching products: ${error.message}`);
  console.error(error.stack);
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

app.get('/users', async (req, res) => {
  try {

    const [rows, fields] = await db.execute('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});



// Get user by ID
app.get('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Execute a query to get the user by their ID
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);

    // If no user is found, return a 404 response
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the first matching user (since ID is unique)
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
});


app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  // Regular expression for validating an email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Check if the email format is valid
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    const [existingUser] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser && existingUser.length > 0) { // Check if the result is not empty
      return res.status(400).send({ error: 'User already exists' });
    }

    const sql = 'INSERT INTO users (email, password, is_admin) VALUES (?, ?, 0)';
    const [result] = await db.execute(sql, [email, password]);
    res.status(201).json({ id: result.insertId, email, password, is_admin: 0 });
  } catch (error) {
    console.error(error); // Log the error
    res.status(500).json({ error: error.message });
  }
});


app.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old password and new password are required.' });
    }

    const [user] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    if (!user || user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (oldPassword !== user[0].password) {
      return res.status(401).json({ error: 'Incorrect old password' });
    }

    const sql = 'UPDATE users SET password = ? WHERE id = ?';
    await db.execute(sql, [newPassword, id]);

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { email, password } = req.body;
    const sql = 'UPDATE users SET email =?, password =? WHERE id =?';
    await db.execute(sql, [email, password, userId]);
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const sql = 'DELETE FROM users WHERE id =? ';
    await db.execute(sql, [id]);
    res.status(204).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Start server
app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
app.get('/reviews', async (req, res) => {
  try {
    const reviews = await db.getReviews();
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});
app.post('/reviews', async (req, res) => {
  try {
    const { text, rating } = req.body;
    const sql = 'INSERT INTO users (text, rating) VALUES (?, ?)';
    const [result] = await db.execute(sql, [text, rating]);
    res.status(201).json({ id: result.insertId, text, rating });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.delete('/reviews/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const sql = 'DELETE FROM reviews WHERE id =? ';
    await db.execute(sql, [id]);
    res.status(204).json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});