const express = require('express');
const bodyParser = require('body-parser');
const mongoDB = require('./config/mongodb');
const orderRoutes = require('./routes/orderRoute');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());

// Database Connection
mongoDB();

// Routes
app.use('/api/orders', orderRoutes);

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
