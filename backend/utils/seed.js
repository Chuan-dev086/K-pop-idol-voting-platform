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
      {
        name: "Starship Entertainment",
        country: "South Korea",
        foundedYear: 2008,
      },
      { name: "CUBE Entertainment", country: "South Korea", foundedYear: 2006 },
      { name: "S2 Entertainment", country: "South Korea", foundedYear: 2021 },
      { name: "EDAM Entertainment", country: "South Korea", foundedYear: 2019 },
    ];

    const agencies = await Agency.insertMany(agenciesData);

    const sm = agencies.find((a) => a.name === "SM Entertainment");
    const jyp = agencies.find((a) => a.name === "JYP Entertainment");
    const yg = agencies.find((a) => a.name === "YG Entertainment");
    const hybe = agencies.find((a) => a.name === "HYBE");
    const starship = agencies.find((a) => a.name === "Starship Entertainment");
    const cube = agencies.find((a) => a.name === "CUBE Entertainment");
    const s2 = agencies.find((a) => a.name === "S2 Entertainment");
    const edam = agencies.find((a) => a.name === "EDAM Entertainment");

    console.log(`Created ${agencies.length} agencies`);

    // ================================
    // 2. IDOLS (with real avatar URLs)
    // ================================
    const idolsData = [
      // EDAM Entertainment
      {
        name: "IU",
        category: "Soloist",
        agencyId: edam._id,
        avatarUrl:
          "https://bucket-image.inkmaginecms.com/9dde7c0f-ade5-407b-98ce-c69dfa0ac58f/image/2026/04/b76c5f60-0448-46d4-89e6-e3178f913432.webp",
      },

      // SM Entertainment
      {
        name: "Taeyeon",
        category: "Soloist",
        agencyId: sm._id,
        avatarUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTB2yZPSD_zkgXsw2bA6JbmW7AEe1oOWSDZwqTSu46kDQ&s=10",
      },
      {
        name: "aespa",
        category: "Girl Group",
        agencyId: sm._id,
        avatarUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQR0rAqXv5BhBEEYwiWjmxiWLDTSCh5OSe5CWDKtyDHtKp8hOP6I80jNQPq&s=10",
      },
      {
        name: "Red Velvet",
        category: "Girl Group",
        agencyId: sm._id,
        avatarUrl:
          "https://i.pinimg.com/originals/8d/1e/f1/8d1ef1c741f8f448faee6bfa186e2e2a.jpg",
      },
      {
        name: "Girls Generation",
        category: "Girl Group",
        agencyId: sm._id,
        avatarUrl:
          "https://static.wikia.nocookie.net/smtown/images/9/90/Forever1snsd3.jpg/revision/latest?cb=20230615195537",
      },

      // JYP Entertainment
      {
        name: "TWICE",
        category: "Girl Group",
        agencyId: jyp._id,
        avatarUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJFyqN9acnUllY7vzfVm_LdNgRdrQkD2k62NcLTe9mgctVgk7gPwkMt2Nb&s=10",
      },
      {
        name: "Stray Kids",
        category: "Boy Group",
        agencyId: jyp._id,
        avatarUrl:
          "https://i.pinimg.com/736x/3a/a8/c0/3aa8c05aeec9108cfb0ea66bdd4a3804.jpg",
      },
      {
        name: "NMIXX",
        category: "Girl Group",
        agencyId: jyp._id,
        avatarUrl:
          "https://preview.redd.it/nmixx-the-2nd-single-entwurf-concept-photo-2-group-v0-uuzrqnx6lum91.jpg?auto=webp&s=6ef854324ae64ffe8760693446b17337c1550ef1",
      },
      {
        name: "ITZY",
        category: "Girl Group",
        agencyId: jyp._id,
        avatarUrl:
          "https://i.pinimg.com/736x/d4/a8/fd/d4a8fdf54e7bf28f04f27aa8c2ab97eb.jpg",
      },

      // YG Entertainment
      {
        name: "BLACKPINK",
        category: "Girl Group",
        agencyId: yg._id,
        avatarUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGWAJdEpVUZ_Z-uUHtSShLe0475egOmZtV4HAjEWl_lnPyAutDtp2LBNFK&s=10",
      },
      {
        name: "BIGBANG",
        category: "Boy Group",
        agencyId: yg._id,
        avatarUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzx6qTK7akYaxXWJGlOkkS4LZiSsM0NLdUyO-tBlFnOCiORIkej3iq9177&s=10",
      },
      {
        name: "Baby Monster",
        category: "Girl Group",
        agencyId: yg._id,
        avatarUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWivOj0y85uf2k_TssEJUI6EA29uD4c8tHu-iAiVWVzVvKNdfr6pSxORgt&s=10",
      },

      // HYBE
      {
        name: "BTS",
        category: "Boy Group",
        agencyId: hybe._id,
        avatarUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDU5NlRAS9Efn-eRizqjxqzpXW7TNKzNgoDM9DtkeDjwISdLIg9HSBBOx0&s=10",
      },
      {
        name: "NewJeans",
        category: "Girl Group",
        agencyId: hybe._id,
        avatarUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXljJT3YnequXHAha7INRREBwA4q0g1YjJYGvEDFUodg&s",
      },

      // Starship Entertainment
      {
        name: "IVE",
        category: "Girl Group",
        agencyId: starship._id,
        avatarUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnXemGFuBafmcUyg_oUKX37nN7ZLVeVp7sktkTdxxLH0nx7boGppiJ6E8&s=10",
      },
      {
        name: "SISTAR",
        category: "Girl Group",
        agencyId: starship._id,
        avatarUrl:
          "https://i.pinimg.com/236x/48/36/40/48364081fe4161be6c75faedbb6f0f75.jpg",
      },

      // CUBE Entertainment
      {
        name: "i-dle",
        category: "Girl Group",
        agencyId: cube._id,
        avatarUrl:
          "https://i.pinimg.com/736x/41/42/b3/4142b32bb53f2b6a1e35166fa26eb056.jpg",
      },

      // S2 Entertainment
      {
        name: "KISS OF LIFE",
        category: "Girl Group",
        agencyId: s2._id,
        avatarUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfEQqlZHJPToKjvoWDTgFlqW8vX4lDWWmnwGnS3jrdiaUFYvojfGeqtBQg&s=10",
      },
    ];

    const idols = await Idol.insertMany(idolsData);
    console.log(`Created ${idols.length} idols`);

    // 取常用 idol
    const iu = idols.find((i) => i.name === "IU");
    const aespa = idols.find((i) => i.name === "aespa");
    const bts = idols.find((i) => i.name === "BTS");
    const blackpink = idols.find((i) => i.name === "BLACKPINK");
    const twice = idols.find((i) => i.name === "TWICE");
    const newjeans = idols.find((i) => i.name === "NewJeans");

    // ================================
    // 3. USERS
    // ================================
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

    activePoll.candidates.find(
      (c) => c.idolId.toString() === iu._id.toString(),
    ).voteCount = xanderVotes;
    activePoll.candidates.find(
      (c) => c.idolId.toString() === bts._id.toString(),
    ).voteCount = bobVotes;
    await activePoll.save();

    // ================================
    // 5.5 SYNC totalVotes
    // ================================
    // 遍历所有 idol，从所有 poll 的 candidates 里重新算 totalVotes
    const allIdols = await Idol.find();
    let syncedCount = 0;

    for (const idol of allIdols) {
      const polls = await Poll.find({ "candidates.idolId": idol._id });

      let total = 0;
      for (const poll of polls) {
        const candidate = poll.candidates.find(
          (c) => c.idolId.toString() === idol._id.toString(),
        );
        total += candidate?.voteCount || 0;
      }

      if (idol.totalVotes !== total) {
        idol.totalVotes = total;
        await idol.save();
        syncedCount++;
      }
    }

    console.log(`Synced totalVotes for ${syncedCount} idols`);

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
