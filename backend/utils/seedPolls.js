require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");

const Poll = require("../models/Poll");
const Idol = require("../models/Idol");
const VoteTransaction = require("../models/VoteTransaction");

const seedPolls = async () => {
  try {
    await connectDB();

    console.log("Clearing polls and vote transactions...");

    await Promise.all([
      Poll.deleteMany({}),
      VoteTransaction.deleteMany({}),
    ]);

    console.log("Cleared");

    const idols = await Idol.find();

    if (idols.length < 6) {
      console.log(`Need at least 6 idols. Found: ${idols.length}`);
      return;
    }

    const [idol1, idol2, idol3, idol4, idol5, idol6] = idols;

    const now = new Date();

    const activeStart = new Date(now);
    activeStart.setDate(now.getDate() - 7);
    const activeEnd = new Date(now);
    activeEnd.setDate(now.getDate() + 30);

    const upcomingStart = new Date(now);
    upcomingStart.setDate(now.getDate() + 30);
    const upcomingEnd = new Date(now);
    upcomingEnd.setDate(now.getDate() + 60);

    const endedStart = new Date(now);
    endedStart.setDate(now.getDate() - 60);
    const endedEnd = new Date(now);
    endedEnd.setDate(now.getDate() - 30);

    await Poll.create({
      title: "October Ranking",
      description: "Monthly ranking poll for October",
      startDate: activeStart,
      endDate: activeEnd,
      candidates: [
        { idolId: idol1._id, voteCount: 0 },
        { idolId: idol2._id, voteCount: 0 },
        { idolId: idol3._id, voteCount: 0 },
        { idolId: idol4._id, voteCount: 0 },
      ],
    });

    await Poll.create({
      title: "January 2027 Event",
      description: "New year special voting event",
      startDate: upcomingStart,
      endDate: upcomingEnd,
      candidates: [
        { idolId: idol5._id, voteCount: 0 },
        { idolId: idol6._id, voteCount: 0 },
      ],
    });

    await Poll.create({
      title: "Summer 2026 Awards",
      description: "Finished event for summer",
      startDate: endedStart,
      endDate: endedEnd,
      candidates: [
        { idolId: idol1._id, voteCount: 50 },
        { idolId: idol2._id, voteCount: 80 },
      ],
    });

    console.log("Created 3 polls (1 active, 1 upcoming, 1 ended)");
    console.log("\n=== POLLS RESEEDED ===");
  } catch (error) {
    console.log("SEED POLLS ERROR:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

seedPolls();