const express = require("express");
const router = express.Router();
const voteController = require("../controllers/voteController");
const authenticate = require("../middleware/auth");
const notAdmin = require("../middleware/notAdmin");

router.post("/check-in", authenticate, notAdmin, voteController.checkIn);
router.post("/cast", authenticate, notAdmin, voteController.castVote);
router.get("/history", authenticate, voteController.getHistory);
router.get("/poll/:pollId", voteController.getPollMessages);

module.exports = router;
