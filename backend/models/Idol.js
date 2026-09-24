const mongoose = require("mongoose");

const idolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["Boy Group", "Girl Group", "Soloist"],
  },
  agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Agency",
    required: true,
  },
  avatarUrl: {
    type: String,
  },
  totalVotes: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Idol", idolSchema);
