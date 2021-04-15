const passport = require("passport");

// Utilizes Custom Callback of passport.js to register users
module.exports = async (req, res, next) => {
  passport.authenticate("register", { session: false }, (err, user, info) => {
    if (err) return next(err);
    // If user attempts to register with an empty username and/or password
    if (info.message === "Missing credentials") {
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
