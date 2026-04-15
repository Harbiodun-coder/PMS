const router = require("express").Router();
const protect = require("../middleware/auth");
const Inmate = require("../models/Inmate");
const Cell = require("../models/Cell");
const Incident = require("../models/Incident");
const VisitLog = require("../models/VisitLog");
const Staff = require("../models/Staff");

router.get("/", protect, async (req, res, next) => {
  try {
    const [
      totalInmates,
      activeInmates,
      releasedInmates,
      totalCells,
      availableCells,
      openIncidents,
      criticalIncidents,
      todayVisits,
      totalStaff,
    ] = await Promise.all([
      Inmate.countDocuments(),
      Inmate.countDocuments({
        status: { $in: ["awaiting_trial", "convicted"] },
      }),
      Inmate.countDocuments({ status: "released" }),
      Cell.countDocuments(),
      Cell.countDocuments({ status: "available" }),
      Incident.countDocuments({ status: "open" }),
      Incident.countDocuments({ status: "open", severity: "critical" }),
      VisitLog.countDocuments({
        scheduledAt: {
          $gte: new Date().setHours(0, 0, 0, 0),
          $lte: new Date().setHours(23, 59, 59, 999),
        },
      }),
      Staff.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        inmates: {
          total: totalInmates,
          active: activeInmates,
          released: releasedInmates,
        },
        cells: {
          total: totalCells,
          available: availableCells,
          occupied: totalCells - availableCells,
        },
        incidents: { open: openIncidents, critical: criticalIncidents },
        visits: { today: todayVisits },
        staff: { total: totalStaff },
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
