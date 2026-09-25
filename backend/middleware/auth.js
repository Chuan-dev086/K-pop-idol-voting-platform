const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticate = async (req, res, next) => {
  try {
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer")
    ) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No valid token provided." });
    }
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ message: "User not found. Authentication failed." });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token has expired or is unauthorized ",
    });
  }
};

module.exports = authenticate;
