const router = require("express").Router();
const protect = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const {
  createCell,
  getAllCells,
  getCell,
  updateCell,
  deleteCell,
} = require("../controllers/cell.controller");

router.use(protect);

router
  .route("/")
  .get(getAllCells)
  .post(authorize("admin", "warden"), createCell);

router
  .route("/:id")
  .get(getCell)
  .put(authorize("admin", "warden"), updateCell)
  .delete(authorize("admin"), deleteCell);

module.exports = router;
