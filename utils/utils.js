// Middleware to check if a user is authenticated
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect("/");
};

module.exports = { ensureAuthenticated };
