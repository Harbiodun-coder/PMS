const router = require("express").Router();
const ctrl = require("../controllers/visitor.controller");
const protect = require("../middleware/auth");
const authorize = require("../middleware/authorize");

router.use(protect);

router
  .route("/")
  .get(ctrl.getAllVisitors)
  .post(
    authorize("admin", "warden", "visitor_coordinator"),
    ctrl.createVisitor,
  );

router.get("/logs", ctrl.getAllVisitLogs);
router.post(
  "/logs/schedule",
  authorize("admin", "warden", "visitor_coordinator"),
  ctrl.scheduleVisit,
);
router.patch(
  "/logs/:id/checkin",
  authorize("admin", "warden", "guard", "visitor_coordinator"),
  ctrl.checkIn,
);
router.patch(
  "/logs/:id/checkout",
  authorize("admin", "warden", "guard", "visitor_coordinator"),
  ctrl.checkOut,
);

router.get("/:id", ctrl.getVisitor);
router.patch(
  "/:id/blacklist",
  authorize("admin", "warden"),
  ctrl.blacklistVisitor,
);

module.exports = router;
