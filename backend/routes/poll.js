const express = require("express");
const router = express.Router();
const pollController = require("../controllers/pollController");
const authenticate = require("../middleware/auth");
const isAdmin = require("../middleware/admin");

router.get("/", pollController.getAllPolls);
router.get("/:id", pollController.getPollById);
router.post("/", authenticate, isAdmin, pollController.createPoll);
router.put("/:id", authenticate, isAdmin, pollController.updatePoll);
router.delete("/:id", authenticate, isAdmin, pollController.deletePoll);

module.exports = router;
