require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const hbs = require('hbs');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const cookieParser = require('cookie-parser');

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

app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET || 'ducky_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        // no max age will be set in login
    }
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views', 'pages')));
app.use(cors());
app.use(fileUpload({ createParentPath: true, limits: { fileSize: 10 * 1024 * 1024 } })); // 10MB upload limit

// database connection
// uses LOCAL DB by default, switches to ATLAS when NODE_ENV=production
const mongoUri =
    process.env.NODE_ENV === 'production'
        ? process.env.MONGODB_URI_ATLAS
        : process.env.MONGODB_URI_LOCAL;

if (!mongoUri) {
    console.error('Missing MONGODB_URI. Add it to .env file before starting the server.');
    process.exit(1);
}

// database connection
mongoose
    .connect(mongoUri)
    .then(() => console.log(`MongoDB connected (${process.env.NODE_ENV || 'development'})`))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

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