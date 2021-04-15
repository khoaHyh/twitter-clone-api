// Middleware to check if a user is authenticated
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Please log in to access this route." });
};

module.exports = {
  ensureAuthenticated,
};
