// Middleware to check if a user is authenticated
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Please log in to access this route." });
};

// success callback function for socket.io
const onAuthorizeSuccess = (data, accept) => {
  console.log("successful connection to socket.io");
  accept(null, true);
};

// fail callback function for socket.io
const onAuthorizeFail = (data, message, error, accept) => {
  if (error) throw new Error(message);
  console.log("failed connection to socket.io:", message);
  accept(null, false);
};

module.exports = {
  ensureAuthenticated,
  onAuthorizeSuccess,
  onAuthorizeFail,
};
