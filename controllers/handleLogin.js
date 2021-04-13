const passport = require("passport");

module.exports = async (req, res, next) => {
  passport.authenticate("login", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ success: false, message: info.message });
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res
        .status(200)
        .json({ success: true, username: user, message: info.message });
    });
  })(req, res, next);
};
