const express = require("express");
const router = express.Router();
const passport = require("passport");
const utils = require("../utils/utils");

// Register route
router.post(
  "/register",
  passport.authenticate("register", { session: false }),
  (req, res) => {
    res.status(201).json({
      message: "Register successful",
      user: req.user,
      //user: req.user.username,
    });
  }
);

// Login route
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
  }),
  (req, res) => {
    res.status(200).json({ username: req.user.username });
    res.redirect("/home");
  }
);

// Logout route
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

// Only allow authenticated users to access protected route
router.get("/home", utils.ensureAuthenticated, (req, res) => {
  res.status(200).json({ message: "Authenticated!" });
});

// Middleware to check if a user is authenticated
//const ensureAuthenticated = (req, res, next) => {
//  if (req.isAuthenticated()) return next();
//  res.redirect("/");
//};

module.exports = router;
