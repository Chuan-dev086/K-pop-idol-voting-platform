const Agency = require("../models/Agency");
const Idol = require("../models/Idol");

exports.getAllAgencies = async (req, res) => {
  try {
    const agencies = await Agency.find().sort({ name: 1 });

    return res.status(200).json({ count: agencies.length, agencies });
  } catch (error) {
    console.log("GET ALL AGENCIES ERROR:", error);
    return res.status(500).json({ message: "Server error, Please try again" });
  }
};

exports.getAgencyById = async (req, res) => {
  try {
    const { id } = req.params;

    const agency = await Agency.findById(id);

    if (!agency) {
      return res.status(404).json({ message: "Agency not found" });
    }

    return res.status(200).json({ agency });
  } catch (error) {
    console.log("GET AGENCY BY ID ERROR:", error);
    return res.status(500).json({ message: "Server error , Please try again" });
  }
};

exports.createAgency = async (req, res) => {
  try {
    const { name, country, foundedYear } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Agency name is required" });
    }

    const existingName = await Agency.findOne({ name });
    if (existingName) {
      return res.status(400).json({ message: "Agency already exists" });
    }
    const agency = await Agency.create({
      name,
      country,
      foundedYear,
    });

    return res.status(201).json({
      message: "Agency created successfully",
      agency,
    });
  } catch (error) {
    console.log("CREATE AGENCY ERROR:", error);
    return res.status(500).json({ message: "Server error,Please try again " });
  }
};

exports.updateAgency = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, country, foundedYear } = req.body;

    let agency = await Agency.findById(id);

    if (!agency) {
      return res.status(404).json({ message: "Agency not found" });
    }

    if (name && name !== agency.name) {
      const nameExists = await Agency.findOne({
        name: name,
        _id: { $ne: id },
      });
      if (nameExists) {
        return res.status(400).json({ message: "Agency name already exists" });
      }
      agency.name = name;
    }
    if (country) agency.country = country;
    if (foundedYear) agency.foundedYear = foundedYear;

    await agency.save();

    return res.status(200).json({
      message: "Agency updated successfully",
      agency,
    });
  } catch (error) {
    console.log("UPDATED AGENCY ERROR:", error);

    if (error.name == "CastError") {
      return res.status(400).json({ message: "Invalid Agency ID format" });
    }
    return res.status(500).json({
      message: "Server error,Please try again",
    });
  }
};

exports.deleteAgency = async (req, res) => {
  try {
    const { id } = req.params;
    const agency = await Agency.findById(id);

    if (!agency) {
      return res.status(404).json({ message: "Agency not found " });
    }

    const hasIdols = await Idol.findOne({ agencyId: id });

    if (hasIdols) {
      return res.status(409).json({
        message:
          "Cannot delete agency.There are idols assigned to this agency ",
      });
    }

    await agency.deleteOne();

    return res.status(200).json({
      message: "Agency deleted successfully ",
    });
  } catch (error) {
    console.log("DELETE AGENCY ERROR:", error);

    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid Agency ID format" });
    }

    return res.status(500).json({
      message: "Server error,Please try again",
    });
  }
};
