const User = require("../models/User");

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }
    const user = await User.create({ username, email, password });

    return res.status(201).json({
      message: "User registered successfully ",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        heartBalance: user.heartBalance,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error,Please try again ",
    });
  }
};

module.exports = { register };
