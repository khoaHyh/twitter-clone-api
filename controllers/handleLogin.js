const passport = require("passport");

module.exports = async (req, res, next) => {
  passport.authenticate("login", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      console.log("info.message:", info);
      return res.status(403).json({ success: false, message: info.message });
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      console.log("local req:", req.user);
      console.log("local sesh:", req.session);
      return res.status(200).json({ username: user, message: info.message });
    });
  })(req, res, next);
};
