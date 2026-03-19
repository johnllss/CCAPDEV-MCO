const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const hbs = require('hbs');
const fileUpload = require('express-fileupload');

const app = express();

// middleware
app.set('view engine', 'hbs');
app.use(express.json());
app.use(express.urlencoded( { extended: true} ));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views', 'pages')));
app.use(cors());
app.use(fileUpload());

// database connection
mongoose
    .connect("mongodb://127.0.0.1:27017/userDB")
    .then(() => console.log('MongoDB connected'))
    .catch(console.error);

// routes
app.use('/users', require('./routes/userRoute'));
app.use('/posts', require('./routes/postRoute'));
app.use('/auth', require('./routes/authRoute'));
app.use('/activity', require('./routes/activityRoute'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'pages', 'index.html'));
});
    
// start server
const PORT = 3000;
app.listen(PORT, console.log(`Listening on port ${PORT}`));
