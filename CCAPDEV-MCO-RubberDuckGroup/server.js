const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { engine } = require('express-handlebars');
const path = require('path');
const hbs = require('hbs');
const fs = require('fs');
const fileUpload = require('express-fileupload');

const app = express();

// middleware
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views', 'pages'));

// Register partials synchronously
const partialsDir = path.join(__dirname, 'views', 'partials');
fs.readdirSync(partialsDir).forEach(file => {
    const name = path.basename(file, '.hbs');
    const template = fs.readFileSync(path.join(partialsDir, file), 'utf8');
    hbs.registerPartial(name, template);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views', 'pages')));
app.use(cors());
app.use(fileUpload({ createParentPath: true, limits: { fileSize: 10 * 1024 * 1024 } })); // 10MB upload limit

// database connection
mongoose
    .connect("mongodb://127.0.0.1:27017/userDB")
    .then(() => console.log('MongoDB connected'))
    .catch(console.error);

app.use('/assets', express.static(path.join(__dirname, 'public')));

// routes
app.use('/', require('./routes/indexRoute'));
app.use('/auth', require('./routes/authRoute'));
app.use('/users', require('./routes/userRoute'));
app.use('/posts', require('./routes/postRoute'));
app.use('/activity', require('./routes/activityRoute'));
app.use('/api/comments', require('./routes/commentRoute'));

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));