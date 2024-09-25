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



app.get('/ratings', async (req, res) => {
  try {
    const ratings = await getRatings();
    res.json(ratings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching ratings' });
  }
});

app.get('/ratings/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const rating = await getRatingById(id);
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




app.get('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);

    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
});


app.post('/register', async (req, res) => {
  const { email, password } = req.body;

 
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    const [existingUser] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser && existingUser.length > 0) { 
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


app.post('/ratings/:id', async (req, res) => {
  try {
    const ratingId = req.params.id;
    const newRating = parseFloat(req.body.rate);

    if (isNaN(newRating) || newRating < 0 || newRating > 5) {
      return res.status(400).json({ error: 'Invalid rating value. Please provide a rating between 0 and 5.' });
    }

    // Fetch the current rating and count from the database
    const [existingRating] = await db.execute('SELECT rate, count FROM ratings WHERE id = ?', [ratingId]);

    if (existingRating.length === 0) {
      return res.status(404).json({ error: 'Rating not found' });
    }

    const currentRating = parseFloat(existingRating[0].rate);
    const currentCount = parseInt(existingRating[0].count, 10);

    // Calculate the new average rating
    const updatedCount = currentCount + 1;
    const updatedRating = ((currentRating * currentCount) + newRating) / updatedCount;

    // Update the rating and count in the database
    await db.execute('UPDATE ratings SET rate = ?, count = ? WHERE id = ?', [updatedRating.toFixed(2), updatedCount, ratingId]);

    res.json({
      message: 'Rating updated successfully',
      rate: updatedRating.toFixed(2),
      count: updatedCount
    });
  } catch (error) {
    console.error(error);
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