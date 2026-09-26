const Idol = require("../models/Idol");
const Agency = require("../models/Agency");
const Poll = require("../models/Poll");
const mongoose = require("mongoose");

exports.getAllIdols = async (req, res) => {
  try {
    const { category, name, agencyId } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    if (agencyId) {
      filter.agencyId = agencyId;
    }

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
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Idol name is required " });
    }

    const allowedCategories = ["Boy Group", "Girl Group", "Soloist"];

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        message: "Invalid category",
      });
    }
    if (!agencyId) {
      return res.status(400).json({ message: "Agency ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(agencyId)) {
      return res.status(400).json({ message: "Invalid Agency ID format " });
    }

    const agencyExists = await Agency.findById(agencyId);

    if (!agencyExists) {
      return res.status(400).json({ message: "This agency does not exist" });
    }

    const idol = await Idol.create({
      name,
      category,
      agencyId,
      avatarUrl,
    });

    const populated = await Idol.findById(idol._id).populate("agencyId");

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

    const idol = await Idol.findById(id);
    if (!idol) {
      return res.status(404).json({ message: "Idol not found" });
    }

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
    if (avatarUrl) {
      idol.avatarUrl = avatarUrl;
    }

    await idol.save();

    const populated = await Idol.findById(idol._id).populate("agencyId");

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
