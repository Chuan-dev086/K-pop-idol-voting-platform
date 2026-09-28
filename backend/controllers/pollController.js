const Poll = require("../models/Poll");
const Idol = require("../models/Idol");
const VoteTransaction = require("../models/VoteTransaction");
const getPollStatus = require("../utils/pollStatus");
const mongoose = require("mongoose");

exports.getAllPolls = async (req, res) => {
  try {
    const { status, from, to } = req.query;
    const polls = await Poll.find();

    // map through the polls array and give the status with utility function 'getPollStatus'
    // poll.toObject change the poll into object and change it
    let result = polls.map((poll) => {
      const obj = poll.toObject();
      obj.status = getPollStatus(obj);
      return obj;
    });

    // the three filter condition
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

    // find the poll ID and populate the idol Id
    const poll = await Poll.findById(id).populate("candidates.idolId");

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    const pollObj = poll.toObject();

    // calculate the status of poll
    pollObj.status = getPollStatus(pollObj);

    // sort the candidates according to the voteCount
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

    // check the require of title
    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Poll title is required" });
    }

    // check the required of both start and end dates
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Both date are required" });
    }

    // the startdate must earlier than enddate
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return res
        .status(400)
        .json({ message: "startDate must be earlier than endDate" });
    }

    // candidates must be an array and cannot be empty
    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return res
        .status(400)
        .json({ message: "Candidates must not be empty array" });
    }

    // get all of the idol Id
    const idolIds = candidates.map((c) => c.idolId);

    // check the validity of idol Id format
    for (const id of idolIds) {
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid Idol ID format " });
      }
    }

    // make sure the idol is unique in poll
    const uniqueIdolIds = [...new Set(idolIds)];
    if (uniqueIdolIds.length !== idolIds.length) {
      return res
        .status(400)
        .json({ message: "Duplicate idols are not allowed in same poll" });
    }

    // check how many idol exist in database
    const existingIdols = await Idol.find({ _id: { $in: uniqueIdolIds } });
    if (existingIdols.length !== uniqueIdolIds.length) {
      return res.status(400).json({
        message: "One or more specified idols do not exist in database ",
      });
    }

    // if everything is OK map the candidates array and extract the ID
    const formattedCandidates = candidates.map((c) => ({
      idolId: c.idolId,
    }));

    // create the poll in database
    const newPoll = await Poll.create({
      title,
      description,
      startDate,
      endDate,
      candidates: formattedCandidates,
    });

    // populate the idol ID
    const populatedPoll = await Poll.findById(newPoll._id).populate(
      "candidates.idolId",
    );

    // calculate the poll status
    const pollObj = populatedPoll.toObject();
    pollObj.status = getPollStatus(pollObj);

    // return the poll info with status
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

    // check the title and make sure it is a string and cannot be empty then renew it
    if (title !== undefined) {
      if (typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({ message: "Title cannot be empty" });
      }
      poll.title = title;
    }

    // check the description and renew it
    if (description !== undefined) {
      poll.description = description;
    }

    /*check the date field 
    if the date have changes then renew the field 
    if user change the start date and the end date will get from ori end date  
     */
    if (startDate !== undefined || endDate !== undefined) {
      const finalStartDate =
        startDate !== undefined
          ? new Date(startDate)
          : new Date(poll.startDate);
      const finalEndDate =
        endDate !== undefined ? new Date(endDate) : new Date(poll.endDate);

      // check the format of start and end date
      if (isNaN(finalStartDate.getTime()) || isNaN(finalEndDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      // start date must be before end date
      if (finalStartDate >= finalEndDate) {
        return res
          .status(400)
          .json({ message: "Start date must be before end date " });
      }

      // renew the field if the field have changes
      if (startDate !== undefined) poll.startDate = finalStartDate;
      if (endDate !== undefined) poll.endDate = finalEndDate;
    }

    /* check the candidates and make sure the candidates is array
        and also check the candidates array not an empty array */
    if (candidates !== undefined) {
      if (!Array.isArray(candidates) || candidates.length === 0) {
        return res
          .status(400)
          .json({ message: "Candidates must be a non empty array" });
      }

      // check the format and the validity of idol Id
      const idolIds = [];
      for (const c of candidates) {
        if (!c.idolId) {
          return res.status(400).json({ message: "Invalid candidates format" });
        }
        if (!mongoose.Types.ObjectId.isValid(c.idolId)) {
          return res.status(400).json({ message: "Invalid Idol ID format" });
        }

        // make sure there is no duplicate candidates inside a poll
        const idStr = c.idolId.toString();
        if (idolIds.includes(idStr)) {
          return res
            .status(400)
            .json({ message: "Duplicate candidates are not allowed" });
        }
        idolIds.push(idStr);
      }
      /* get all idols in idol database according idolId 
          $in means inculde 
          check and compare the count of idolId make sure the data is correct 
          if everything is Ok will return the idolID to the candidates field  */
      const existingIdols = await Idol.find({ _id: { $in: idolIds } });
      if (existingIdols.length !== idolIds.length) {
        return res
          .status(400)
          .json({ message: "One or more idols do not exist" });
      }
      poll.candidates = candidates.map((c) => ({ idolId: c.idolId }));
    }

    // renew the poll in database
    await poll.save();

    // populated the idol ID
    const populated = await Poll.findById(poll._id).populate(
      "candidates.idolId",
    );
    // convert it to object and define the status
    const obj = populated.toObject();
    obj.status = getPollStatus(obj);

    // return the poll with status
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

    // check the poll if that poll have votes cannot delete it
    const hasTransactions = await VoteTransaction.exists({ pollId: id });
    if (hasTransactions) {
      return res.status(409).json({
        message: "Cannot delete poll. It already has votes.",
      });
    }

    // delete the poll 
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
