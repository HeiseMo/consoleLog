const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const passport = require("passport");

router.post("/signup", (req, res) => {
  console.log(req.body);
  const {
    username,
    password,
    name,
    surname,
    role,
    description,
    specialization,
    imageUrl,
  } = req.body;

  if (!password || password.length < 4) {
    return res
      .status(400)
      .json({ message: "Your password must be 4 char. min." });
  }
  if (!username) {
    return res.status(400).json({ message: "Your mail cannot be empty" });
  }

  User.findOne({ username: username })
    .then((found) => {
      if (found) {
        return res.status(400).json({ message: "This mail is already taken" });
      }

      const salt = bcrypt.genSaltSync();
      const hash = bcrypt.hashSync(password, salt);

      return User.create({
        username: username,
        password: hash,
        name: name,
        surname: surname,
        role: role,
        description: description,
        specialization: specialization,
        imageUrl: imageUrl,
      }).then((dbUser) => {
        console.log(dbUser);
        req.login(dbUser, (err) => {
          if (err) {
            return res
              .status(500)
              .json({ message: "Error while attempting to login" });
          }
          res.json(dbUser);
        });
      });
    })
    .catch((err) => {
      res.json(err);
    });
});

router.post("/login", (req, res) => {
  passport.authenticate("local", (err, user) => {
    if (err) {
      return res.status(500).json({ message: "Error while authenticating" });
    }
    if (!user) {
      return res.status(400).json({ message: "Wrong credentials" });
    }
    req.login(user, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error while attempting to login" });
      }
      return res.json(user);
    });
  })(req, res);
});

router.delete("/logout", (req, res) => {
  req.logout();
  res.json({ message: "Successful logout" });
});

// returns the logged in user
router.get("/loggedin", (req, res) => {
  res.json(req.user);
});

module.exports = router;
