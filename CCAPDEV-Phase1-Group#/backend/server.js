const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// middleware
app.use(express.json());
app.use(cors());

// database connection
mongoose
    .connect("mongodb://127.0.0.1:27017/userDB")
    .then(() => console.log('MongoDB connected'))
    .catch(console.error);

// routes
app.use('/users', require('./routes/users'));
app.use('/auth', require('./routes/auth'));
app.use('/activity', require('./routes/activity'));

// start server
const PORT = 3000;
app.listen(PORT, () => console.log('Listening on port 3000'));