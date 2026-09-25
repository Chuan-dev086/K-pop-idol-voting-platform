const notAdmin = (req, res, next) => {
  if (req.user.role === "admin") {
    return res.status(403).json({ message: "Only user can visit this page" });
  }
  return next();
};

module.exports = notAdmin
