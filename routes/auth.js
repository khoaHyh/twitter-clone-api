const express = require("express");
const router = express.Router();
const utils = require("../utils/utils");
const handleRegister = require("../controllers/handleRegister");
const handleLogin = require("../controllers/handleLogin");
const handleLogout = require("../controllers/handleLogout");
const handleAuth = require("../controllers/handleAuth");

// Register route
router.post("/register", handleAuth.register);

// Login route
router.post("/login", handleAuth.login);

// Logout route
router.get("/logout", handleAuth.logout);

// Only allow authenticated users to access protected route
router.get("/home", utils.ensureAuthenticated, (req, res) => {
  res.status(200).json({
    message: "Authenticated!",
    sessionPassportId: req.session.passport.user,
    username: req.user.username,
  });
});

module.exports = router;
