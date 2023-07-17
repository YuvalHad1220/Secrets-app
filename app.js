require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


mongoose.connect("mongodb+srv://Yuval:Test-123@cluster0.dcwwtsq.mongodb.net/secretDB");

const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
  }));
  
app.use(passport.initialize());
app.use(passport.session());

const userSchema = new mongoose.Schema ({
    email: String,
    password: String,
  });

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
passport.deserializeUser(function(id, done) {
User.findById(id, function(err, user) {
    done(err, user);
});
});



app.get('/sign_up', (req, res) => {
    res.render('sign-up');
});

app.post('/sign_up', (req, res) => {
    console.log(req.body);

    User.register({username: req.body.email}, req.body.password)
    .then((user) => {
        console.log("sign up successful, but user isnt authenticated yet");
        res.redirect('/sign_in');
    })
    .catch(err => {
        console.log(err);
        res.redirect('/sign_up');
    });
});

app.get('/sign_in', (req, res) => {
    res.render('sign-in');
});

app.post('/sign_in', (req, res) => {
    console.log(req.body);
    passport.authenticate("local")(req, res, (err) => {
        if (err) {
            console.log(err);
            res.redirect('/sign_in');
        }

        else {
            console.log("everytime I sign in, the email should be called username because this is what we set.");
            res.redirect('/secrets');
        }
    })});

app.get('/secrets', (req, res) => {
    res.render('secrets');

});

app.listen('3000', () => console.log('listening on 3000'));