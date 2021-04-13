const express = require("express");
const router = express.Router();
const utils = require("../utils/utils");
const handleRegister = require("../controllers/handleRegister");
const handleLogin = require("../controllers/handleLogin");

// Register route
router.post("/register", handleRegister);

// Login route
router.post("/login", handleLogin);

// Logout route
router.get("/logout", (req, res) => {
  req.logout();
  res.status(200).json({ message: "Unauthenticated." });
});

// Only allow authenticated users to access protected route
router.get("/home", utils.ensureAuthenticated, (req, res) => {
  res.status(200).json({
    message: "Authenticated!",
    sessionPassportId: req.session.passport.user,
    username: req.user.username,
  });
});

module.exports = router;
