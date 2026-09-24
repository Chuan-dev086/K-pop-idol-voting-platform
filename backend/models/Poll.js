const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    idolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Idol",
      required: true,
    },
    voteCount: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

const pollSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  candidates: [candidateSchema],
});

module.exports = mongoose.model("Poll", pollSchema);
