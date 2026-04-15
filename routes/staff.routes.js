const router = require("express").Router();
const ctrl = require("../controllers/staff.controller");
const protect = require("../middleware/auth");
const authorize = require("../middleware/authorize");

router.use(protect);

router
  .route("/")
  .get(authorize("admin", "warden"), ctrl.getAllStaff)
  .post(authorize("admin"), ctrl.createStaff);

router
  .route("/:id")
  .get(authorize("admin", "warden"), ctrl.getStaff)
  .put(authorize("admin"), ctrl.updateStaff)
  .delete(authorize("admin"), ctrl.deleteStaff);

module.exports = router;
