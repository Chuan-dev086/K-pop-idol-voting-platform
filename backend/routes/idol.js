const express = require("express");
const router = express.Router();
const idolController = require("../controllers/idolController");
const authenticate = require("../middleware/auth");
const isAdmin = require("../middleware/admin");

router.get("/", idolController.getAllIdols);
router.get("/:id", idolController.getIdolById);
router.post("/", authenticate, isAdmin, idolController.createIdol);
router.put("/:id", authenticate, isAdmin, idolController.updateIdol);
router.delete("/:id", authenticate, isAdmin, idolController.deleteIdol);

module.exports = router;
