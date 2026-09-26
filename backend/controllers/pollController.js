const Poll = require("../models/Poll");
const Idol = require("../models/Idol");
const VoteTransaction = require("../models/VoteTransaction");
const getPollStatus = require("../utils/pollStatus");
const mongoose = require("mongoose");

exports.getAllPolls = async (req, res) => {
  try {
    const { status, from, to } = req.query;
    const polls = await Poll.find();

    let result = polls.map((poll) => {
      const obj = poll.toObject();
      obj.status = getPollStatus(obj);
      return obj;
    });

    if (status) {
      result = result.filter((poll) => poll.status === status);
    }

    if (from) {
      const fromDate = new Date(from);
      result = result.filter((poll) => poll.startDate >= fromDate);
    }

    if (to) {
      const toDate = new Date(to);
      result = result.filter((poll) => poll.endDate <= toDate);
    }

    return res.status(200).json({ count: result.length, polls: result });
  } catch (error) {
    console.log("GET ALL POLLS ERROR:", error);
    return res.status(500).json({ message: "Server error, Please try again " });
  }
};

exports.getPollById = async (req, res) => {
  try {
    const { id } = req.params;

    const poll = await Poll.findById(id).populate("candidates.idolId");

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    const pollObj = poll.toObject();

    pollObj.status = getPollStatus(pollObj);

    if (pollObj.candidates && Array.isArray(pollObj.candidates)) {
      pollObj.candidates.sort(
        (a, b) => (b.voteCount || 0) - (a.voteCount || 0),
      );
    }

    return res.status(200).json({
      poll: pollObj,
    });
  } catch (error) {
    console.log("GET POLL BY ID ERROR:", error);

    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid Poll ID format" });
    }

    return res.status(500).json({ message: "Server error, Please try again" });
  }
};

exports.createPoll = async (req, res) => {
  try {
    const { title, description, startDate, endDate, candidates } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Poll title is required" });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Both date are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return res
        .status(400)
        .json({ message: "startDate must be earlier than endDate" });
    }

    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return res
        .status(400)
        .json({ message: "Candidates must not be empty array" });
    }

    const idolIds = candidates.map((c) => c.idolId);

    for (const id of idolIds) {
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid Idol ID format " });
      }
    }

    const uniqueIdolIds = [...new Set(idolIds)];
    if (uniqueIdolIds.length !== idolIds.length) {
      return res
        .status(400)
        .json({ message: "Duplicate idols are not allowed in same poll" });
    }

    const existingIdols = await Idol.find({ _id: { $in: uniqueIdolIds } });
    if (existingIdols.length !== uniqueIdolIds.length) {
      return res.status(400).json({
        message: "One or more specified idols do not exist in database ",
      });
    }

    const formattedCandidates = candidates.map((c) => ({
      idolId: c.idolId,
    }));

    const newPoll = await Poll.create({
      title,
      description,
      startDate,
      endDate,
      candidates: formattedCandidates,
    });

    const populatedPoll = await Poll.findById(newPoll._id).populate(
      "candidates.idolId",
    );

    const pollObj = populatedPoll.toObject();
    pollObj.status = getPollStatus(pollObj);

    return res.status(201).json({
      message: "Poll created successfully",
      poll: pollObj,
    });
  } catch (error) {
    console.log("CREATE POLL ERROR:", error);

    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid poll ID format" });
    }

    return res.status(500).json({ message: "Server error, Please try again" });
  }
};

exports.updatePoll = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, startDate, endDate, candidates } = req.body;

    const poll = await Poll.findById(id);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    // title
    if (title !== undefined) {
      if (typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({ message: "Title cannot be empty" });
      }
      poll.title = title;
    }

    // description
    if (description !== undefined) {
      poll.description = description;
    }

    // dates
    if (startDate !== undefined || endDate !== undefined) {
      const finalStartDate =
        startDate !== undefined
          ? new Date(startDate)
          : new Date(poll.startDate);
      const finalEndDate =
        endDate !== undefined ? new Date(endDate) : new Date(poll.endDate);

      if (isNaN(finalStartDate.getTime()) || isNaN(finalEndDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      if (finalStartDate >= finalEndDate) {
        return res
          .status(400)
          .json({ message: "Start date must be before end date " });
      }

      if (startDate !== undefined) poll.startDate = finalStartDate;
      if (endDate !== undefined) poll.endDate = finalEndDate;
    }

    // candidates
    if (candidates !== undefined) {
      if (!Array.isArray(candidates) || candidates.length === 0) {
        return res
          .status(400)
          .json({ message: "Candidates must be a non empty array" });
      }

      const idolIds = [];
      for (const c of candidates) {
        if (!c.idolId) {
          return res.status(400).json({ message: "Invalid candidates format" });
        }
        if (!mongoose.Types.ObjectId.isValid(c.idolId)) {
          return res.status(400).json({ message: "Invalid Idol ID format" });
        }
        const idStr = c.idolId.toString();
        if (idolIds.includes(idStr)) {
          return res
            .status(400)
            .json({ message: "Duplicate candidates are not allowed" });
        }
        idolIds.push(idStr);
      }
      const existingIdols = await Idol.find({ _id: { $in: idolIds } });
      if (existingIdols.length !== idolIds.length) {
        return res
          .status(400)
          .json({ message: "One or more idols do not exist" });
      }
      poll.candidates = candidates.map((c) => ({ idolId: c.idolId }));
    }

    await poll.save();

    const populated = await Poll.findById(poll._id).populate(
      "candidates.idolId",
    );
    const obj = populated.toObject();
    obj.status = getPollStatus(obj);

    return res.status(200).json({
      message: "Poll updated successfully",
      poll: obj,
    });
  } catch (error) {
    console.log("UPDATE POLL ERROR:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    return res.status(500).json({ message: "Server error,Please try again" });
  }
};

exports.deletePoll = async (req, res) => {
  try {
    const { id } = req.params;

    const poll = await Poll.findById(id);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    const hasTransactions = await VoteTransaction.exists({ pollId: id });
    if (hasTransactions) {
      return res.status(409).json({
        message: "Cannot delete poll. It already has votes.",
      });
    }

    await poll.deleteOne();

    return res.status(200).json({
      message: "Poll deleted successfully",
    });
  } catch (error) {
    console.log("DELETE POLL ERROR:", error);

    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid Poll ID format " });
    }
    return res.status(500).json({ message: "Server error, please try again " });
  }
};
