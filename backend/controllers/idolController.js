const Idol = require("../models/Idol");
const Agency = require("../models/Agency");
const Poll = require("../models/Poll");
const mongoose = require("mongoose");

exports.getAllIdols = async (req, res) => {
  try {
    // get three filed from req.query
    const { category, name, agencyId } = req.query;
    // let filter become empty object
    const filter = {};

    // store the condition inside the filter object
    if (category) {
      filter.category = category;
    }

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    if (agencyId) {
      filter.agencyId = agencyId;
    }

    // find the idols with the filter conditions and .populate the agency ID with complete agency ID message
    const idols = await Idol.find(filter).populate("agencyId");

    return res.status(200).json({ count: idols.length, idols });
  } catch (error) {
    console.log("GET ALL IDOLS ERROR:", error);
    return res.status(500).json({ message: "Server error, please try again " });
  }
};

exports.getIdolById = async (req, res) => {
  try {
    const { id } = req.params;
    const idol = await Idol.findById(id).populate("agencyId");

    if (!idol) {
      return res.status(404).json({ message: "Idol not found" });
    }

    return res.status(200).json({ idol });
  } catch (error) {
    console.log("GET IDOL BY ID ERROR:", error);
    if (error.name == "CastError") {
      return res.status(400).json({ message: "Invalid Idol ID format" });
    }
    return res
      .status(500)
      .json({ message: "Server error , please try again " });
  }
};

exports.createIdol = async (req, res) => {
  try {
    const { name, category, agencyId, avatarUrl } = req.body;
    // check the name if the name is blank will return error
    // trim() will clear the string front and back spacing
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Idol name is required " });
    }

    // check the categories
    const allowedCategories = ["Boy Group", "Girl Group", "Soloist"];

    // if not inculde inside category will return error
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        message: "Invalid category",
      });
    }
    // check agency ID exist
    if (!agencyId) {
      return res.status(400).json({ message: "Agency ID is required" });
    }

    // check the format of ID with mongoose method
    if (!mongoose.Types.ObjectId.isValid(agencyId)) {
      return res.status(400).json({ message: "Invalid Agency ID format " });
    }

    // find the agency with agency ID and make sure the agency is in database
    const agencyExists = await Agency.findById(agencyId);

    if (!agencyExists) {
      return res.status(400).json({ message: "This agency does not exist" });
    }

    // if everything is OK will create idol in database
    const idol = await Idol.create({
      name,
      category,
      agencyId,
      avatarUrl,
    });

    // check the idol message and populate the agency info
    const populated = await Idol.findById(idol._id).populate("agencyId");

    // return the idol and its agency message
    return res.status(201).json({
      message: "Idol created successfully",
      idol: populated,
    });
  } catch (error) {
    console.log("CREATE IDOL ERROR:", error);
    return res.status(500).json({
      message: "Server error , Please try again ",
    });
  }
};

exports.updateIdol = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, agencyId, avatarUrl } = req.body;

    // find the idol by ID
    const idol = await Idol.findById(id);
    if (!idol) {
      return res.status(404).json({ message: "Idol not found" });
    }

    // if the name have changes renew the name
    if (name && name !== idol.name) {
      idol.name = name;
    }

    if (category && category !== idol.category) {
      const allowedCategories = ["Boy Group", "Girl Group", "Soloist"];

      if (!allowedCategories.includes(category)) {
        return res.status(400).json({ message: "Invalid Category" });
      }
      idol.category = category;
    }

    // convert the idol.agencyId to string and compare with agencyId
    // check the format of agencyId and find this ID in database
    // if everything is OK will renew the agencyId field
    if (agencyId && agencyId !== idol.agencyId?.toString()) {
      if (!mongoose.Types.ObjectId.isValid(agencyId)) {
        return res.status(400).json({ message: "Invalid Agency ID format " });
      }
      const agencyExists = await Agency.findById(agencyId);
      if (!agencyExists) {
        return res.status(400).json({ message: "This agency does not exist" });
      }
      idol.agencyId = agencyId;
    }

    // if avatarUrl have changes then renew it
    if (avatarUrl) {
      idol.avatarUrl = avatarUrl;
    }

    // save it to database
    await idol.save();

    // find the idol by ID and populate the agency message
    const populated = await Idol.findById(idol._id).populate("agencyId");

    // return the idol with it fully agency message
    return res.status(200).json({
      message: "Idol updated successfully",
      idol: populated,
    });
  } catch (error) {
    console.log("UPDATED IDOL ERROR:", error);
    if (error.name == "CastError") {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    return res.status(500).json({ message: "Server error,Please try again " });
  }
};

exports.deleteIdol = async (req, res) => {
  try {
    const { id } = req.params;
    const idol = await Idol.findById(id);

    if (!idol) {
      return res.status(404).json({ message: "Idol not found" });
    }

    // check the idol in the poll with its idol ID if idol is in the poll cannot delete that idol 
    const hasPolls = await Poll.findOne({ "candidates.idolId": id });

    if (hasPolls) {
      return res.status(409).json({
        message: "Cannot delete idol. It is used in a poll.",
      });
    }
    await idol.deleteOne();

    return res.status(200).json({
      message: "Idol deleted successfully",
    });
  } catch (error) {
    console.log("DELETE IDOL ERROR:", error);

    if (error.name == "CastError") {
      return res.status(400).json({ message: "Invalid Idol ID format" });
    }
    return res
      .status(500)
      .json({ message: " Server error , Please try again " });
  }
};
