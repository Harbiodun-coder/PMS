const router = require("express").Router();
const protect = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const {
  createInmate,
  getAllInmates,
  getInmate,
  updateInmate,
  transferInmate,
  releaseInmate,
  deleteInmate,
} = require("../controllers/inmate.controller");

router.use(protect);

router
  .route("/")
  .get(getAllInmates)
  .post(authorize("admin", "warden"), createInmate);

router
  .route("/:id")
  .get(getInmate)
  .put(authorize("admin", "warden"), updateInmate)
  .delete(authorize("admin"), deleteInmate);

router.put("/:id/transfer", authorize("admin", "warden"), transferInmate);
router.put("/:id/release", authorize("admin", "warden"), releaseInmate);

module.exports = router;
