const Agency = require("../models/Agency");
const Idol = require("../models/Idol");

exports.getAllAgencies = async (req, res) => {
  try {
    // get all agencies and sort it with ascending order
    // and return the count of agencies and whole agencies
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

    // find the agency according the ID
    const agency = await Agency.findById(id);

    if (!agency) {
      return res.status(404).json({ message: "Agency not found" });
    }

    // and return the agency with message
    return res.status(200).json({ agency });
  } catch (error) {
    console.log("GET AGENCY BY ID ERROR:", error);
    return res.status(500).json({ message: "Server error , Please try again" });
  }
};

exports.createAgency = async (req, res) => {
  try {
    // destructure the field and store it in req.body
    const { name, country, foundedYear } = req.body;
    // check the name existing because name is required
    if (!name) {
      return res.status(400).json({ message: "Agency name is required" });
    }

    // find the agency if to find the same name agency
    const existingName = await Agency.findOne({ name });
    if (existingName) {
      return res.status(400).json({ message: "Agency already exists" });
    }
    // create the agency in database
    const agency = await Agency.create({
      name,
      country,
      foundedYear,
    });

    // return the new create agency
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

    // check the name to find the name which exist
    // find the agency with the name except itself
    // if name exist return the error message else renew the agency.name
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

    // if country sent renew it
    // if foundedYear sent then renew it
    if (country) agency.country = country;
    if (foundedYear) agency.foundedYear = foundedYear;

    // save it to the database
    await agency.save();

    // return the success message and whole agency list
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

    // use agency ID to find the idol
    const hasIdols = await Idol.findOne({ agencyId: id });

    if (hasIdols) {
      return res.status(409).json({
        message:
          "Cannot delete agency.There are idols assigned to this agency ",
      });
    }

    // delete the agency from database 
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
