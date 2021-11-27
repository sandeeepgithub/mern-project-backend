const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');

const app = express();
app.use(express.json({ limit: "10kb" })); // read json data coming from req
app.use(cookieParser()); // sets cookie in browser

app.use(cors({
    origin: true, // used to allow all requests and prevent flag error
    credentials: true,
})); // prevent cors error

app.use('/public/img/users', express.static(path.join('public', 'img', 'users'))); // provides static images to react => only res, no req allowed

app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    });
});



app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

module.exports = app;
