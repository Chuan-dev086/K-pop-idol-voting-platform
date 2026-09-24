const mongoose = require("mongoose");

const voteTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  pollId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Poll",
    required: true,
  },
  idolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Idol",
    required: true,
  },
  votesSpent: {
    type: Number,
    required: true,
    min: 1,
  },
  message: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("VoteTransaction", voteTransactionSchema);
