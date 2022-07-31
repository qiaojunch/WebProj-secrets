//jshint esversion:6
//require("dotenv").config();   // configure your secret info
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();

// to serve static file such as css, html, images, js files
app.use(express.static("public"));
// setup using ejs
app.set("view engine", "ejs");
// setup using bodyParser
app.use(bodyParser.urlencoded({extended: true}));
// setup session before connect to mongoosedb
app.use(session({
    secret: "Our little secret.",
    resave:false,
    saveUninitialized: false
}));
// setup passport
app.use(passport.initialize());
app.use(passport.session());

// to connect to mongodb
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

// to use mongoose: create a model
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
// use PLM
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function(req, res){
    res.render("home");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/logout", function(req, res){
    req.logout(function(err){
        if(err){
            console.log(err);
        } else {
            res.redirect("/")
        }
    });
});

app.get("/secrets", function(req, res){
    if(req.isAuthenticated()){
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});

app.post("/register", function(req, res){
    // register user from passportLocalMongoose
    User.register({username: req.body.username}, req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.redirect("/register");
        } else {
            // authenticate user using passport
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    });

});

app.post("/login", function(req, res){
    // create the user
    const user = new User({
        username: req.body.username,
        password: req.body.password
    })
    // login user using passport function
    req.login(user, function(err){
        if(err){
            console.log(err);
        } else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            })
        }
    })
});




app.listen(3000, function(){
    console.log("Server starts on port 3000");
});
