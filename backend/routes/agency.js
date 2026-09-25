const express = require("express");
const router = express.Router();
const agencyController = require("../controllers/agencyController");
const authenticate = require("../middleware/auth");
const isAdmin = require("../middleware/admin");

router.get("/", agencyController.getAllAgencies);
router.get("/:id", agencyController.getAgencyById);
router.post("/", authenticate, isAdmin, agencyController.createAgency);
router.put("/:id", authenticate, isAdmin, agencyController.updateAgency);
router.delete("/:id", authenticate, isAdmin, agencyController.deleteAgency);

module.exports = router;
