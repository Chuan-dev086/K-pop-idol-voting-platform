const User = require("../models/User");

exports.getAllUsers = async (req, res) => {
  try {
    const { role, username, email } = req.query;
    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (username) {
      filter.username = { $regex: username, $options: "i" };
    }

    if (email) {
      filter.email = email;
    }

    const users = await User.find(filter).select("-password");

    return res.status(200).json({ count: users.length, users });
  } catch (error) {
    console.log("GET ALL USERS ERROR:", error);
    return res.status(500).json({ message: "Server error, please try again " });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.log("GET USER BY ID ERROR :", error);
    if (error.name == "CastError") {
      return res.status(400).json({ message: "Invalid User ID format" });
    }
    return res
      .status(500)
      .json({ message: "Server error,  Please try again " });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, heartBalance } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isSelf = req.user._id.toString() === id;
    if (isSelf && role !== undefined) {
      return res
        .status(400)
        .json({ message: "You cannot change your own role" });
    }

    if (username && username !== user.username) {
      const existingUsername = await User.findOne({
        username,
        _id: { $ne: id },
      });
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exist" });
      }
    }
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: id } });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }
    if (username !== undefined) user.username = username;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (heartBalance !== undefined) {
      const parsed = parseInt(heartBalance, 10);
      if (isNaN(parsed) || parsed < 0) {
        return res.status(400).json({ message: "Invalid heartBalance format" });
      }
      user.heartBalance = parsed;
    }

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({
      message: "User updated successfully",
      user: {
        id: user._id,
        username: username.email,
        role: user.role,
        heartBalance: user.heartBalance,
      },
    });
  } catch (error) {
    console.log("UPDATE USER ERROR:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid User ID format" });
    }
    return res.status(500).json({ message: "Server error, please try again" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // check is it yourself (cannot delete yourself )
    const isSelf = req.user._id.toString() === id;
    if (isSelf) {
      return res.status(400).json({ message: "Cannot delete yourself" });
    }
    // check the role (cannot delete another admin)
    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot delete another admin" });
    }
    // 3. deleteOne
    await user.deleteOne();
    // return success message
    return res.status(200).json({ message: "User deleted successfully " });
  } catch (error) {
    console.log("DELETE USER ERROR:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid User ID format" });
    }
    return res.status(500).json({ message: "Server error, please try again" });
  }
};
