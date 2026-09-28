require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");

const User = require("../models/User");
const Agency = require("../models/Agency");
const Idol = require("../models/Idol");
const Poll = require("../models/Poll");
const VoteTransaction = require("../models/VoteTransaction");
const HeartLog = require("../models/HeartLog");

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
    ];

    const agencies = await Agency.insertMany(agenciesData);
    const [sm, jyp, yg, hybe] = agencies;
    console.log(`Created ${agencies.length} agencies`);

    // ================================
    // 2. IDOLS
    // ================================
    const idolsData = [
      { name: "IU", category: "Soloist", agencyId: sm._id },
      { name: "Taeyeon", category: "Soloist", agencyId: sm._id },
      { name: "aespa", category: "Girl Group", agencyId: sm._id },
      { name: "TWICE", category: "Girl Group", agencyId: jyp._id },
      { name: "Stray Kids", category: "Boy Group", agencyId: jyp._id },
      { name: "BLACKPINK", category: "Girl Group", agencyId: yg._id },
      { name: "BIGBANG", category: "Boy Group", agencyId: yg._id },
      { name: "BTS", category: "Boy Group", agencyId: hybe._id },
      { name: "NewJeans", category: "Girl Group", agencyId: hybe._id },
    ];

    const idols = await Idol.insertMany(idolsData);
    console.log(`Created ${idols.length} idols`);

    // 用 find 按名字取常用的 idol，后面创建 poll 和投票要用
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

    // active poll: 现在在区间内
    const activeStart = new Date(now);
    activeStart.setDate(now.getDate() - 7); // 7 天前开始
    const activeEnd = new Date(now);
    activeEnd.setDate(now.getDate() + 30); // 30 天后结束

    // upcoming poll: 未来开始
    const upcomingStart = new Date(now);
    upcomingStart.setDate(now.getDate() + 30);
    const upcomingEnd = new Date(now);
    upcomingEnd.setDate(now.getDate() + 60);

    // ended poll: 已经结束
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
    // 5. VOTES (让 xander 和 bob 各投几次票)
    // ================================
    // 注意：这里只是塞测试数据，不走 castVote 的完整逻辑
    // 所以要手动改 heartBalance、voteCount、totalVotes

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
