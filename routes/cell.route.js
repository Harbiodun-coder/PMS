const router = require("express").Router();
const protect = require("../middleware/auth");
const rbac = require("../middleware/rbac");
const {
  createCell,
  getAllCells,
  getCell,
  updateCell,
  deleteCell,
} = require("../controllers/cell.controller");

router.use(protect);

router.route("/").get(getAllCells).post(rbac("admin", "warden"), createCell);

router
  .route("/:id")
  .get(getCell)
  .put(rbac("admin", "warden"), updateCell)
  .delete(rbac("admin"), deleteCell);

module.exports = router;
