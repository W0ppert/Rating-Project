Node API

Welcome to the Review Node API!

This API provides a set of endpoints for managing products, ratings, users, and reviews. It uses Express.js as the web framework and MySQL as the database.
Endpoints
Products

    GET /products: Retrieve a list of all products
    POST /products: Create a new product
    GET /products/:id: Retrieve a product by ID
    PUT /products/:id: Update a product by ID
    DELETE /products/:id: Delete a product by ID

Ratings

    GET /ratings: Retrieve a list of all ratings
    GET /ratings/:id: Retrieve a rating by ID
    POST /ratings/:id: Update a rating by ID

Users

    GET /users: Retrieve a list of all users
    GET /users/:id: Retrieve a user by ID
    POST /register: Register a new user
    PUT /users/:id: Update a user by ID
    DELETE /users/:id: Delete a user by ID

Reviews

    GET /reviews: Retrieve a list of all reviews
    POST /reviews: Create a new review
    DELETE /reviews/:id: Delete a review by ID

Database

The API uses a MySQL database to store data. The database connection is established using the mysql package.

Security

The API uses CORS to enable cross-origin resource sharing. It also uses JSON Web Tokens (JWT) for authentication and authorization.

Getting Started

To get started with the API, clone the repository and run npm install to install the dependencies. Then, create a MySQL database and update the database.js file with your database credentials. Finally, run node app.js to start the server.