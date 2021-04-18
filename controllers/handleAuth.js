const passport = require("passport");

// Utilizes Custom Callback of passport.js to register users
const register = async (req, res, next) => {
  passport.authenticate("register", { session: false }, (err, user, info) => {
    if (err) return next(err);
    // If user attempts to register with an empty username and/or password
    if (info.message === "Missing credentials") {
      return res.status(422).json({ success: false, message: info.message });
    }
    if (info.message === "Username must not contain profanity.") {
      return res.status(400).json({ success: false, message: info.message });
    }
    // If no user object is returned, the user already exists
    if (!user) {
      return res.status(409).json({ success: false, message: info.message });
    }
    return res.status(201).json({
      success: true,
      message: info.message,
      userId: user._id,
    });
  })(req, res, next);
};

// Login handler
const login = async (req, res, next) => {
  passport.authenticate("login", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ success: false, message: info.message });
    }
    // If there is a user object then the credentials match
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.status(200).json({
        success: true,
        message: info.message,
        userId: user._id,
      });
    });
  })(req, res, next);
};

// Differentiate on outcome of logout handler by response body instead of http status code
const logout = (req, res) => {
  if (!req.user) {
    // Could return a status code of 404 but depends what the client prefers
    return res
      .status(200)
      .json({ message: "No user session to unauthenticate." });
  }
  req.logout();
  res.status(200).json({ message: "Unauthenticated." });
};

// Respond with code 200 and specific response body if user session exists
const sessionExists = (req, res) => {
  res.status(200).json({
    message: "Authenticated!",
    sessionPassportId: req.session.passport.user,
    username: req.user.username,
  });
};

module.exports = { register, login, logout, sessionExists };
