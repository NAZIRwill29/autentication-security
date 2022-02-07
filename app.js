// require the environment variable
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// require mongose-encryption
const encrypt = require("mongoose-encryption");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB");

//user Schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

//get the value from environment variable
//console.log(process.env.SECRET);

// encrypt - use secret string instead of two keys
// prepare the plugin
// encrypt only certain field
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

// user model
const User = new mongoose.model("User", userSchema);

app.route("/")
.get(function (req, res){
  res.render("home");
});

app.route("/login")
.get(function (req, res){
  res.render("login");
})
.post(function (req, res){
  const username = req.body.username;
  const password = req.body.password;
  // find the username and password in database
  User.findOne({email: username}, function (err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser) { // check if username was existed
        if (foundUser.password === password) { // check if password was correct
          res.render("secrets");
        }
      }
    }
  });
});

app.route("/register")
.get(function (req, res){
  res.render("register");
})
.post(function (req, res){
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });
  // if user register will go to secret page
  newUser.save(function(err){
    if (err) {
      console.log(err);
    } else {
      // render the secret page
      res.render("secrets");
    }
  });
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
