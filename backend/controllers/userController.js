const User = require("../models/User");
const HeartLog = require("../models/HeartLog");

exports.getAllUsers = async (req, res) => {
  try {
    // get role、username、email from req.query
    const { role, username, email } = req.query;
    // put filter as empty object to store the filter conditions
    const filter = {};

    // check the role exist or not
    if (role) {
      filter.role = role;
    }

    // check the username exist or not
    // $regex is use to find the everything that inculde username
    // $options: "i" is not care about the capital letter
    if (username) {
      filter.username = { $regex: username, $options: "i" };
    }

    // check the email exist
    if (email) {
      filter.email = email;
    }

    // find the user according the filter condition
    // .select("-password") will not return the password
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
    // find the user according ID and no return password
    const user = await User.findById(id).select("-password");

    // check user exist
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // it return whole user object
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

    // find the user want to update according the ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // check the user role and user cannot change own role
    const isSelf = req.user._id.toString() === id;
    if (isSelf && role !== undefined) {
      return res
        .status(400)
        .json({ message: "You cannot change your own role" });
    }

    // if got new username and the new username is not equal to current username
    // find the user with this username and not inculde user itself($ne means not equal )
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({
        username,
        _id: { $ne: id },
      });
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exist" });
      }
    }
    // check the email exist
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: id } });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    //renew the field when the field have changes
    // for the heart balance convert the string to the number and check the heart balance is not number or is negative number if not return error 400
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

    // save the changes to the database
    await user.save();

    // convert the user to the normal javascript object
    // and delete the password field so it will not return
    const userResponse = user.toObject();
    delete userResponse.password;

    // return the message and renew user message
    return res.status(200).json({
      message: "User updated successfully",
      user: {
        id: user._id,
        username: user.username,
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
    // wait the delete finish
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

exports.giveHearts = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    const parsedAmount = parseInt(amount, 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res
        .status(400)
        .json({ message: "Amount must be a positive number" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ message: "Cannot give hearts to admin" });
    }

    user.heartBalance += parsedAmount;
    await user.save();

    await HeartLog.create({
      userId: user._id,
      type: "ADMIN_GRANT",
      amount: parsedAmount,
    });

    return res.status(200).json({
      message: `Gave ${parsedAmount} hearts to ${user.username}`,
      user: {
        id: user._id,
        username: user.username,
        heartBalance: user.heartBalance,
      },
    });
  } catch (error) {
    console.log("GIVE HEARTS ERROR:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid User ID format" });
    }
    return res.status(500).json({ message: "Server error, please try again" });
  }
};
