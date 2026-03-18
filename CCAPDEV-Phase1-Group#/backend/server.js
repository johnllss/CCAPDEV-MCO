const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { engine } = require('express-handlebars');
const path = require('path');

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
app.use('/posts', require('./routes/posts'));

// start server
const PORT = 3000;
app.listen(PORT, () => console.log('Listening on port 3000'));

app.engine('hbs', engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use('/assets', express.static(path.join(__dirname, '../frontend/src/assets')));
app.use('../../pages', express.static(path.join(__dirname, '../frontend/src/pages')));
app.use('/', express.static(path.join(__dirname, '../frontend/src/pages/static-html')));