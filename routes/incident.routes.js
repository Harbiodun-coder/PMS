const router = require("express").Router();
const ctrl = require("../controllers/incident.controller");
const protect = require("../middleware/auth");
const authorize = require("../middleware/authorize");

router.use(protect);

router
  .route("/")
  .get(ctrl.getAllIncidents)
  .post(authorize("admin", "warden", "guard"), ctrl.createIncident);

router
  .route("/:id")
  .get(ctrl.getIncident)
  .put(authorize("admin", "warden"), ctrl.updateIncident)
  .delete(authorize("admin"), ctrl.deleteIncident);

router.patch(
  "/:id/resolve",
  authorize("admin", "warden"),
  ctrl.resolveIncident,
);

module.exports = router;
