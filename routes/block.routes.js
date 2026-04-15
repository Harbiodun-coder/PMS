const router = require("express").Router();
const protect = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const {
  createBlock,
  getAllBlocks,
  getBlock,
  updateBlock,
  deleteBlock,
} = require("../controllers/block.controller");

router.use(protect); // all block routes require login

router
  .route("/")
  .get(getAllBlocks)
  .post(authorize("admin", "warden"), createBlock);

router
  .route("/:id")
  .get(getBlock)
  .put(authorize("admin", "warden"), updateBlock)
  .delete(authorize("admin"), deleteBlock);

module.exports = router;
