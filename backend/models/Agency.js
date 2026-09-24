const mongoose = require("mongoose");

const agencySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  country: {
    type: String,
  },
  foundedYear: {
    type: Number,
  },
});

module.exports = mongoose.model("Agency", agencySchema);
