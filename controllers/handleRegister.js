const passport = require("passport");

// Utilizes Custom Callback of passport.js to register users
module.exports = async (req, res, next) => {
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
};
