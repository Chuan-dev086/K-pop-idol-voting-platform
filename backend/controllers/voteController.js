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
      // the time that user check in last time
      const lastCheckInTime = new Date(user.lastCheckIn);
      // calculate the time different
      const timeDiff = now.getTime() - lastCheckInTime.getTime();
      // calculate the milisecond of one day/ 24 hour
      const twentyFourHours = 24 * 60 * 60 * 1000;

      /*  compare the time if the time not enough 24hours then user cannot checkin and convert the time back to hours then return the time */
      if (timeDiff < twentyFourHours) {
        const remainingMs = twentyFourHours - timeDiff;
        const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));

        return res.status(400).json({
          message: `You have already checked in. Please try again in ${remainingHours} hour(s)`,
        });
      }
    }

    // renew the heartBalance and create heartLog when user checkIn
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

    // make sure all field is fill in
    if (!pollId || !idolId || votesSpent === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // convert the vote to the number and check the vote format and vote cannot be less than 1
    const parsedVotes = parseInt(votesSpent, 10);
    if (isNaN(parsedVotes) || parsedVotes < 1) {
      return res.status(400).json({ message: "Invalid vote count" });
    }

    // find the poll in database with poll Id
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    // check the status
    if (getPollStatus(poll) !== "active") {
      return res.status(400).json({ message: "This poll is not active" });
    }

    // find the idol inside candidates list
    const candidate = poll.candidates.find(
      (c) => c.idolId.toString() === idolId,
    );
    if (!candidate) {
      return res.status(400).json({ message: "This idol is not in this poll" });
    }

    // make sure the heartBalance is enough to vote
    if (user.heartBalance < parsedVotes) {
      return res.status(400).json({ message: "Not enough hearts" });
    }

    // deduct the heart balance of user
    user.heartBalance -= parsedVotes;
    await user.save();

    // add the vote count of candidates
    candidate.voteCount += parsedVotes;
    await poll.save();

    // find the idol with idol Id and update the total vote of idol
    // $inc means increment
    await Idol.findByIdAndUpdate(idolId, {
      $inc: { totalVotes: parsedVotes },
    });

    // create the vote transaction to record the vote info
    await VoteTransaction.create({
      userId: user._id,
      pollId,
      idolId,
      votesSpent: parsedVotes,
      message: message || "",
    });

    // create the heart log to record where the heart spent
    //  -parsedVotes means minus the hearts for vote
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

    // find the vote history with user Id and populate the poll Id and idol Id and sort the record (the newest first)
    const votes = await VoteTransaction.find({ userId: user._id })
      .populate("pollId", "title")
      .populate("idolId", "name avatarUrl")
      .sort({ createdAt: -1 });

    // find the heart log and sort the record (the newest first )
    const heartLogs = await HeartLog.find({ userId: user._id }).sort({
      createdAt: -1,
    });

    // return the current heart balance, votes and heartLog records
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
