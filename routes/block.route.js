const router = require("express").Router();
const protect = require("../middleware/auth");
const rbac = require("../middleware/rbac");
const {
  createBlock,
  getAllBlocks,
  getBlock,
  updateBlock,
  deleteBlock,
} = require("../controllers/block.controller");

router.use(protect); // all block routes require login

router.route("/").get(getAllBlocks).post(rbac("admin", "warden"), createBlock);

router
  .route("/:id")
  .get(getBlock)
  .put(rbac("admin", "warden"), updateBlock)
  .delete(rbac("admin"), deleteBlock);

module.exports = router;
