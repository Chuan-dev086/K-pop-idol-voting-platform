const HeartLog = require("../models/HeartLog");
const User = require("../models/User");

exports.checkIn = async (req, res) => {
  try {
    const user = req.user;
    const now = new Date();

    if (user.lastCheckIn) {
      const lastCheckInTime = new Date(user.lastCheckIn);
      const timeDiff = now.getTime() - lastCheckInTime.getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (timeDiff < twentyFourHours) {
        const remainingMs = twentyFourHours - timeDiff;
        const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));

        return res.status(400).json({
          message: `You have already checked in. Please try again in ${remainingHours} hour(s)`,
        });
      }
    }

    const rewardAmount = 50;
    user.heartBalance += rewardAmount;
    user.lastCheckIn = now;
    await user.save();

    await HeartLog.create({
      userId: user._id,
      type: "CHECK_IN",
      amount: rewardAmount,
    });

    return res.status(200).json({
      message: "Check-in successful",
      heartBalance: user.heartBalance,
      lastCheckIn: user.lastCheckIn,
    });
  } catch (error) {
    console.log("CHECK IN ERROR:", error);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};
