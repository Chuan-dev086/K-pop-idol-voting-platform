require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");

const User = require("../models/User");
const Agency = require("../models/Agency");
const Idol = require("../models/Idol");
const Poll = require("../models/Poll");
const VoteTransaction = require("../models/VoteTransaction");
const HeartLog = require("../models/HeartLog");

// 生成占位头像 URL
const avatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=c06db2&color=fff&size=200&bold=true`;

const seed = async () => {
  try {
    await connectDB();

    console.log("Clearing all collections...");

    await Promise.all([
      User.deleteMany({}),
      Agency.deleteMany({}),
      Idol.deleteMany({}),
      Poll.deleteMany({}),
      VoteTransaction.deleteMany({}),
      HeartLog.deleteMany({}),
    ]);

    console.log("All collections cleared");

    // ================================
    // 1. AGENCIES
    // ================================
    const agenciesData = [
      { name: "SM Entertainment", country: "South Korea", foundedYear: 1995 },
      { name: "JYP Entertainment", country: "South Korea", foundedYear: 1997 },
      { name: "YG Entertainment", country: "South Korea", foundedYear: 1996 },
      { name: "HYBE", country: "South Korea", foundedYear: 2005 },
      {
        name: "Starship Entertainment",
        country: "South Korea",
        foundedYear: 2008,
      },
      {
        name: "CUBE Entertainment",
        country: "South Korea",
        foundedYear: 2006,
      },
      { name: "S2 Entertainment", country: "South Korea", foundedYear: 2021 },
    ];

    const agencies = await Agency.insertMany(agenciesData);

    const sm = agencies.find((a) => a.name === "SM Entertainment");
    const jyp = agencies.find((a) => a.name === "JYP Entertainment");
    const yg = agencies.find((a) => a.name === "YG Entertainment");
    const hybe = agencies.find((a) => a.name === "HYBE");
    const starship = agencies.find((a) => a.name === "Starship Entertainment");
    const cube = agencies.find((a) => a.name === "CUBE Entertainment");
    const s2 = agencies.find((a) => a.name === "S2 Entertainment");

    console.log(`Created ${agencies.length} agencies`);

    // ================================
    // 2. IDOLS
    // ================================
    const idolsData = [
      // SM Entertainment
      {
        name: "IU",
        category: "Soloist",
        agencyId: sm._id,
        avatarUrl: avatar("IU"),
      },
      {
        name: "Taeyeon",
        category: "Soloist",
        agencyId: sm._id,
        avatarUrl: avatar("Taeyeon"),
      },
      {
        name: "aespa",
        category: "Girl Group",
        agencyId: sm._id,
        avatarUrl: avatar("aespa"),
      },
      {
        name: "Red Velvet",
        category: "Girl Group",
        agencyId: sm._id,
        avatarUrl: avatar("Red Velvet"),
      },
      {
        name: "Girls Generation",
        category: "Girl Group",
        agencyId: sm._id,
        avatarUrl: avatar("Girls Generation"),
      },

      // JYP Entertainment
      {
        name: "TWICE",
        category: "Girl Group",
        agencyId: jyp._id,
        avatarUrl: avatar("TWICE"),
      },
      {
        name: "Stray Kids",
        category: "Boy Group",
        agencyId: jyp._id,
        avatarUrl: avatar("Stray Kids"),
      },
      {
        name: "NMIXX",
        category: "Girl Group",
        agencyId: jyp._id,
        avatarUrl: avatar("NMIXX"),
      },
      {
        name: "ITZY",
        category: "Girl Group",
        agencyId: jyp._id,
        avatarUrl: avatar("ITZY"),
      },

      // YG Entertainment
      {
        name: "BLACKPINK",
        category: "Girl Group",
        agencyId: yg._id,
        avatarUrl: avatar("BLACKPINK"),
      },
      {
        name: "BIGBANG",
        category: "Boy Group",
        agencyId: yg._id,
        avatarUrl: avatar("BIGBANG"),
      },
      {
        name: "Baby Monster",
        category: "Girl Group",
        agencyId: yg._id,
        avatarUrl: avatar("Baby Monster"),
      },

      // HYBE
      {
        name: "BTS",
        category: "Boy Group",
        agencyId: hybe._id,
        avatarUrl: avatar("BTS"),
      },
      {
        name: "NewJeans",
        category: "Girl Group",
        agencyId: hybe._id,
        avatarUrl: avatar("NewJeans"),
      },

      // Starship Entertainment
      {
        name: "IVE",
        category: "Girl Group",
        agencyId: starship._id,
        avatarUrl: avatar("IVE"),
      },
      {
        name: "SISTAR",
        category: "Girl Group",
        agencyId: starship._id,
        avatarUrl: avatar("SISTAR"),
      },

      // CUBE Entertainment
      {
        name: "i-dle",
        category: "Girl Group",
        agencyId: cube._id,
        avatarUrl: avatar("i-dle"),
      },

      // S2 Entertainment
      {
        name: "KISS OF LIFE",
        category: "Girl Group",
        agencyId: s2._id,
        avatarUrl: avatar("KISS OF LIFE"),
      },
    ];

    const idols = await Idol.insertMany(idolsData);
    console.log(`Created ${idols.length} idols`);

    // 取常用 idol（按名字查找）
    const iu = idols.find((i) => i.name === "IU");
    const aespa = idols.find((i) => i.name === "aespa");
    const bts = idols.find((i) => i.name === "BTS");
    const blackpink = idols.find((i) => i.name === "BLACKPINK");
    const twice = idols.find((i) => i.name === "TWICE");
    const newjeans = idols.find((i) => i.name === "NewJeans");

    // ================================
    // 3. USERS
    // ================================
    // 注意：User 有 pre-save hook 哈希密码，必须用 create（不能用 insertMany）
    const admin = await User.create({
      username: "admin",
      email: "admin@test.com",
      password: "admin123",
      role: "admin",
    });

    const xander = await User.create({
      username: "xander",
      email: "xander@test.com",
      password: "xander123",
    });

    const bob = await User.create({
      username: "bob",
      email: "bob@test.com",
      password: "bob123",
    });

    console.log(`Created 3 users (1 admin + 2 regular)`);

    // ================================
    // 4. POLLS
    // ================================
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

    const activePoll = await Poll.create({
      title: "October Ranking",
      description: "Monthly ranking poll for October",
      startDate: activeStart,
      endDate: activeEnd,
      candidates: [
        { idolId: iu._id, voteCount: 0 },
        { idolId: bts._id, voteCount: 0 },
        { idolId: blackpink._id, voteCount: 0 },
        { idolId: aespa._id, voteCount: 0 },
      ],
    });

    const upcomingPoll = await Poll.create({
      title: "January 2027 Event",
      description: "New year special voting event",
      startDate: upcomingStart,
      endDate: upcomingEnd,
      candidates: [
        { idolId: newjeans._id, voteCount: 0 },
        { idolId: twice._id, voteCount: 0 },
      ],
    });

    const endedPoll = await Poll.create({
      title: "Summer 2026 Awards",
      description: "Finished event for summer",
      startDate: endedStart,
      endDate: endedEnd,
      candidates: [
        { idolId: iu._id, voteCount: 50 },
        { idolId: bts._id, voteCount: 80 },
      ],
    });

    console.log(`Created 3 polls (1 active, 1 upcoming, 1 ended)`);

    // ================================
    // 5. VOTES
    // ================================
    const xanderVotes = 30;
    const bobVotes = 15;

    xander.heartBalance -= xanderVotes;
    bob.heartBalance -= bobVotes;
    await xander.save();
    await bob.save();

    await VoteTransaction.create({
      userId: xander._id,
      pollId: activePoll._id,
      idolId: iu._id,
      votesSpent: xanderVotes,
      message: "Go IU!",
    });

    await VoteTransaction.create({
      userId: bob._id,
      pollId: activePoll._id,
      idolId: bts._id,
      votesSpent: bobVotes,
      message: "BTS forever!",
    });

    await HeartLog.create({
      userId: xander._id,
      type: "VOTE_SPENT",
      amount: -xanderVotes,
    });

    await HeartLog.create({
      userId: bob._id,
      type: "VOTE_SPENT",
      amount: -bobVotes,
    });

    // 更新 poll 里对应 candidate 的 voteCount
    activePoll.candidates.find(
      (c) => c.idolId.toString() === iu._id.toString(),
    ).voteCount = xanderVotes;
    activePoll.candidates.find(
      (c) => c.idolId.toString() === bts._id.toString(),
    ).voteCount = bobVotes;
    await activePoll.save();

    // 更新 idol 的 totalVotes
    await Idol.findByIdAndUpdate(iu._id, { $inc: { totalVotes: xanderVotes } });
    await Idol.findByIdAndUpdate(bts._id, { $inc: { totalVotes: bobVotes } });

    console.log(
      `Created votes (xander -> IU: ${xanderVotes}, bob -> BTS: ${bobVotes})`,
    );

    // ================================
    // 6. DONE
    // ================================
    console.log("\n=== SEED COMPLETED ===");
    console.log("Login accounts:");
    console.log("  Admin: admin@test.com / admin123");
    console.log("  User:  xander@test.com / xander123");
    console.log("  User:  bob@test.com   / bob123");
  } catch (error) {
    console.log("SEED ERROR:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

seed();
