const express = require("express");
const router = express.Router();
const passport = require("passport");
const utils = require("../utils/utils");

// Register route
router.post("/register", async (req, res, next) => {
  passport.authenticate("register", { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      console.log("info:", info);
      return res.status(401).json({ success: false, message: info.message });
    }
    return res.status(201).json({
      success: true,
      message: "Register successful",
      user: user,
    });
  })(req, res, next);
});

// Login route
router.post(
  "/login",
  passport.authenticate("login", {
    failureRedirect: "/login",
  }),
  async (req, res, next) => {
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
