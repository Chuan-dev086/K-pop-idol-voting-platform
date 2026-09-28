require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const agencyRoutes = require("./routes/agency");
const idolRoutes = require("./routes/idol");
const pollRoutes = require("./routes/poll");
const voteRoutes = require("./routes/vote");
const userRoutes = require("./routes/user");

const app = express();

const corsHandler = cors({
  origin: "*",
  methods: "GET,POST,PUT,DELETE,PATCH",
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
  preflightContinue: true,
});

app.use(corsHandler);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/agencies", agencyRoutes);
app.use("/api/idols", idolRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
