const isAdmin = (req, res, next) => {
  if (req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({
    message: "Only admin can visit this page",
  });
};

module.exports = isAdmin;
