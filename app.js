var express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    passport = require('passport'),
    bodyParser = require('body-parser'),
    localStrategy = require('passport-local'),
    passportLocalMongoose = require('passport-local-mongoose'),
    user = require('./models/user'),
    session = require('express-session');

mongoose.connect('mongodb://localhost/authenticationDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

passport.use(new localStrategy(user.authenticate()));
app.set("view engine", "ejs");
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.set('trust proxy', 1); // trust first proxy
app.use(session({
    secret: 'this is used to encode and decode the sessions',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: true
    }
}));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

//route for the home page
app.get("/", function (req, res) {
    res.render("home");
});

//route for secret
app.get("/secret", isLoggedIn, function (req, res) {
    res.render("secret");
});

//route to show form for sign up
app.get("/register", function (req, res) {
    res.render("register");
});

//route to sign up
app.post("/register", function (req, res) {
    user.register(new user({
        username: req.body.username
    }), req.body.password, function (err, user) {
        if (!err) {
            passport.authenticate('local')(req, res, function () {
                res.redirect("/secret");
            });
        } else {
            console.log("error while sign up");
            res.render("register");
        }
    });
});

//route to show login form
app.get("/login", function (req, res) {
    res.render("login");
});

//login middleware
app.post("/login", passport.authenticate('local', {
    successRedirect: "/secret",
    failureRedirect: "/login"
}), function (req, res) {

});

//logout route
app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

//to check if the user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

app.listen(3000, function () {
    console.log("server started on port 3000");
});