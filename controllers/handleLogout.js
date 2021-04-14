module.exports = (req, res) => {
  if (!req.user) {
    // Could return a status code of 200 but depends what the client prefers
    return res
      .status(404)
      .json({ message: "No user session to unauthenticate." });
  }
  req.logout();
  res.status(200).json({ message: "Unauthenticated." });
};
