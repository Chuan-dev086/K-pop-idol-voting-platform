require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const agencyRoutes = require("./routes/agency");

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
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
