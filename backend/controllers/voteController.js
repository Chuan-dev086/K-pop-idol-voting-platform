const HeartLog = require("../models/HeartLog");
const User = require("../models/User");
const Poll = require("../models/Poll");
const Idol = require("../models/Idol");
const VoteTransaction = require("../models/VoteTransaction");
const getPollStatus = require("../utils/pollStatus");
const mongoose = require("mongoose");

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

exports.castVote = async (req, res) => {
  try {
    const { pollId, idolId, votesSpent, message } = req.body;
    const user = req.user;

    if (!pollId || !idolId || votesSpent === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const parsedVotes = parseInt(votesSpent, 10);
    if (isNaN(parsedVotes) || parsedVotes < 1) {
      return res.status(400).json({ message: "Invalid vote count" });
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    if (getPollStatus(poll) !== "active") {
      return res.status(400).json({ message: "This poll is not active" });
    }

    const candidate = poll.candidates.find(
      (c) => c.idolId.toString() === idolId,
    );
    if (!candidate) {
      return res.status(400).json({ message: "This idol is not in this poll" });
    }

    if (user.heartBalance < parsedVotes) {
      return res.status(400).json({ message: "Not enough hearts" });
    }

    user.heartBalance -= parsedVotes;
    await user.save();

    candidate.voteCount += parsedVotes;
    await poll.save();

    await Idol.findByIdAndUpdate(idolId, {
      $inc: { totalVotes: parsedVotes },
    });

    await VoteTransaction.create({
      userId: user._id,
      pollId,
      idolId,
      votesSpent: parsedVotes,
      message: message || "",
    });

    await HeartLog.create({
      userId: user._id,
      type: "VOTE_SPENT",
      amount: -parsedVotes,
    });

    return res.status(200).json({
      message: "Vote cast successfully",
      heartBalance: user.heartBalance,
      votesSpent: parsedVotes,
    });
  } catch (error) {
    console.log("CAST VOTE ERROR:", error);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const user = req.user;

    const votes = await VoteTransaction.find({ userId: user._id })
      .populate("pollId", "title")
      .populate("idolId", "name avatarUrl")
      .sort({ createdAt: -1 });

    const heartLogs = await HeartLog.find({ userId: user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      heartBalance: user.heartBalance,
      votes,
      heartLogs,
    });
  } catch (error) {
    console.log("GET HISTORY ERROR:", error);
    return res.status(500).json({ message: "Server error, please try again" });
  }
};
