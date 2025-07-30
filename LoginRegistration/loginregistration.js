const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const flash = require('connect-flash');
const app = express();

const db = mysql.createConnection({
    host:     'c237-all.mysql.database.azure.com',
    user:     'c237admin',
    password: 'c2372025!',
    database: 'c237_team03',
    port:     3306,
    ssl: { rejectUnauthorized: false }
});

//connecting
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});

app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

//session making
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 7} //a week
}));

app.use(flash());
app.set('view engine', 'ejs');

//registration
const validateRegistration = (req, res, next) => 
{
    const { username, email, password, address, contact, role } = req.body;

    if (!username || !email || !password || !address || !contact || !role) {
        return res.status(400).send('All fields are required.');
    }
    
    if (password.length < 6) {
        req.flash('error', 'Password should be at least 6 or more characters long');
        req.flash('formData', req.body);
        return res.redirect('/register');
    }
    next();
};

//register route
app.post('/register', validateRegistration, (req, res) => {
    const { username, email, password, address, contact, role} = req.body;

    const sql = 'INSERT INTO users (username, email, password, address, contact, role) VALUES (?, ?, SHA1(?), ?, ?, ?)';
    db.query(sql, [username, email, password, address, contact, role], (err, result) => {
        if (err) {
            throw err;
        }
        console.log(result);
        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/login');
    });
});

//login check
const checkAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    } else {
        req.flash('error', 'Please log in to view this resource');
        res.redirect('/login');
    }
};

//admin check
const checkAdmin = (req, res, next) => {
    if (req.session.user.role === 'admin') {
        return next();
    } else {
        req.flash('error', 'Access denied');
        res.redirect('/dashboard'); //!IMPORTANT! REPLACE WITH DASHBOARD.EJS NAME
    }
};

//routes
app.get('/', (req, res) => {
    res.render('index', { user: req.session.user, messages: req.flash('success')});
});

//register route
app.get('/register', (req, res) => {
    res.render('register', { messages: req.flash('error'), formData: req.flash('formData')[0] });
});

//login route
app.get('/login', (req, res) => {
    res.render('login', { 
        messages: req.flash('success'), 
        errors: req.flash('error') 
    });
});

//submit
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    //valid email and password
    if (!email || !password) {
        req.flash('error', 'All fields are required.');
        return res.redirect('/login');
    }

    const sql = 'SELECT * FROM users WHERE email = ? AND password = SHA1(?)';
    db.query(sql, [email, password], (err, results) => {
        if (err) {
            throw err;
        }

        if (results.length > 0) {
            //success
            req.session.user = results[0]; //store user in session
            req.flash('success', 'Login successful!');
            //redirect to dashboard
            res.redirect('/dashboard'); //!IMPORTANT! REPLACE WITH DASHBOARD.EJS NAME
        } else {
            //failure
            req.flash('error', 'Invalid email or password.');
            res.redirect('/login');
        }
    });
});

//user dashboard
app.get('/dashboard', checkAuthenticated, (req, res) => {
    res.render('dashboard', { user: req.session.user });
});
//admin dashboard
app.get('/admin', checkAuthenticated, checkAdmin, (req, res) => {
    res.render('admin', { user: req.session.user });
});

//logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Starting the server
app.listen(3306, () => {
    console.log('Server started on port 3306');
});
