const express = require("express");
const router = express.Router();
const utils = require("../utils/utils");
const handleRegister = require("../controllers/handleRegister");
const handleLogin = require("../controllers/handleLogin");
const handleLogout = require("../controllers/handleLogout");

// Register route
router.post("/register", handleRegister);

// Login route
router.post("/login", handleLogin);

// Logout route
router.get("/logout", handleLogout);

// Only allow authenticated users to access protected route
router.get("/home", utils.ensureAuthenticated, (req, res) => {
  res.status(200).json({
    message: "Authenticated!",
    sessionPassportId: req.session.passport.user,
    username: req.user.username,
  });
});

module.exports = router;
