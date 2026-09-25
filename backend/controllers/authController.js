const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
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
    console.log("REGISTER ERROR:", err);
    res.status(500).json({
      message: "Server error,Please try again ",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email and password" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email and password" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );
    return res.status(200).json({
      message: "Login successfull",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        heartBalance: user.heartBalance,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error,Please try again ",
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({
      message: "Fetch User profile successfully",
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        heartBalance: req.user.heartBalance,
      },
    });
  } catch (err) {
    console.log("GETME ERROR :", err);
    res.status(500).json({
      message: "Server error,Please try again",
    });
  }
};
