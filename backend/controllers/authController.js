const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    // get the three field from req.body
    // check those three fields is fill in
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }
    // check the username exist or not and check it from database
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // check the email existing or not
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }
    // when it is all OK and create the user in database
    // and the password is not return
    const user = await User.create({ username, email, password });

    // return the success message and renew the user message
    return res.status(201).json({
      message: "User registered successfully ",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        heartBalance: user.heartBalance,
        lastCheckIn: user.lastCheckIn,
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
    // get the email and password from req.body
    const { email, password } = req.body;
    // check the field to make sure user fill in
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }
    // check the database to find the user link with this email
    // it will return invalid email and password to make sure attacker don't know email exist or not
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email and password" });
    }
    // to compare the password with the hashed password in database

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email and password" });
    }
    // JWT sign take 3 parameters and create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );
    // the token will return to the user
    // and will return the user message
    return res.status(200).json({
      message: "Login successfull",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        heartBalance: user.heartBalance,
        lastCheckIn: user.lastCheckIn,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error,Please try again ",
    });
  }
};

// get the current user message
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
        lastCheckIn: req.user.lastCheckIn,
      },
    });
  } catch (err) {
    console.log("GETME ERROR :", err);
    res.status(500).json({
      message: "Server error,Please try again",
    });
  }
};
