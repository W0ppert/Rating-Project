const express = require('express');
const app = express();
const cors = require('cors'); // Import cors
const port = 3000;
const mysql = require('mysql');

// Database connection
const database = require('./database');
const { db, getProducts, getProductById  } = database;
// Parse JSON bodies
app.use(express.json());

// Middleware to enable CORS
app.use(cors()); // Add this line

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
  let { email, password, first_name, last_name } = req.body;

  // If both first_name and last_name are empty, set first_name to "Anonymous"
  if (!first_name && !last_name) {
    first_name = "Anonymous";
  }

  // If first_name or last_name are undefined or empty, set them to null for SQL
  first_name = first_name || null;
  last_name = last_name || null;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    const [existingUser] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser && existingUser.length > 0) {
      return res.status(400).send({ error: 'User already exists' });
    }

    const sql = 'INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)';
    const [result] = await db.execute(sql, [email, password, first_name, last_name]);
    res.status(201).json({ id: result.insertId, email, password, first_name, last_name });
  } catch (error) {
    console.error(error); // Log the error
    res.status(500).json({ error: error.message });
  }
});




    if (user.length === 0) {
      // If no user is found with the given email
      return res.status(404).json({ error: 'User does not exist' });
    }

    // Check if the password matches
    const storedPassword = user[0].password; // assuming password is stored in plain text (not recommended, should use hashing)
    if (password !== storedPassword) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // If email and password are correct, return success response
    res.status(200).json({ message: 'Login successful', userId: user[0].id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});



app.post('/ratings/:id', async (req, res) => {
  try {
    const ratingId = req.params.id;
    const newRating = parseFloat(req.body.rate);

    if (isNaN(newRating) || newRating < 1 || newRating > 5) {
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

app.get('/reviews', async (req, res) => {
  try {

    const [rows, fields] = await db.execute('SELECT * FROM reviews');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching reviews', error: err.message });
  }
});

app.get('/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params; // Extract id from request parameters SELECT * FROM reviews WHEREc product_id = ?
    let sql = `SELECT text, rating, concat (first_name, " ", last_name) 
        FROM reviews 
        JOIN users ON user_id = users.id
        WHERE product_id = ?;`;
    const [rows, fields] = await db.execute(sql, [id]) // Pass the id as an argument
    res.json(rows)
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching reviews', error: err.message });
  }
})

app.get('/reviews/:id/average', async (req, res) => {
  try {
    const { id } = req.params; // Extract id from request parameters

    // SQL query to calculate the average rating for the given product_id
    const [rows] = await db.execute(
      'SELECT AVG(rating) AS averageRating FROM reviews WHERE product_id = ?',
      [id]
    );

    // Check if there is any rating available for this product_id
    if (rows.length === 0 || rows[0].averageRating === null) {
      return res.status(404).json({ message: 'No reviews found for this product' });
    }

    res.json({ averageRating: rows[0].averageRating });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching average rating', error: err.message });
  }
});


app.post('/reviews', async (req, res) => {
  try {
    const { user_id, text = '', rating, product_id } = req.body;

    if (!user_id || !rating || !product_id) {
      return res.status(400).json({ error: 'Fields (user_id, rating, product_id) are required.' });
    }

    const checkSql = 'SELECT * FROM reviews WHERE user_id = ? AND product_id = ?';
    const [existingReview] = await db.execute(checkSql, [user_id, product_id]);

    // If the review exists, block the user from submitting another review
    if (existingReview.length > 0) {
      return res.status(400).json({ error: 'You have already submitted a review for this product.' });
    }

    // Insert new review if no existing review was found
    const sql = 'INSERT INTO reviews (user_id, text, rating, product_id) VALUES (?, ?, ?, ?)';
    const [result] = await db.execute(sql, [user_id, text, rating, product_id]);

    res.status(201).json({ id: result.insertId, user_id, text, rating, product_id });
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


// Start server
app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
