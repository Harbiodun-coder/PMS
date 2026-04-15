const Visitor = require("../models/Visitor");
const VisitLog = require("../models/VisitLog");
const Inmate = require("../models/Inmate");

// Register a visitor
exports.createVisitor = async (req, res, next) => {
  try {
    const inmate = await Inmate.findById(req.body.inmate);
    if (!inmate)
      return res
        .status(404)
        .json({ success: false, message: "Inmate not found" });

    const visitor = await Visitor.create(req.body);
    res.status(201).json({ success: true, data: visitor });
  } catch (err) {
    next(err);
  }
};

exports.getAllVisitors = async (req, res, next) => {
  try {
    const { search, inmate } = req.query;
    const filter = {};
    if (inmate) filter.inmate = inmate;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { nationalId: { $regex: search, $options: "i" } },
      ];
    }
    const visitors = await Visitor.find(filter).populate(
      "inmate",
      "firstName lastName inmateNumber",
    );
    res.json({ success: true, count: visitors.length, data: visitors });
  } catch (err) {
    next(err);
  }
};

exports.getVisitor = async (req, res, next) => {
  try {
    const visitor = await Visitor.findById(req.params.id).populate(
      "inmate",
      "firstName lastName inmateNumber status",
    );
    if (!visitor)
      return res
        .status(404)
        .json({ success: false, message: "Visitor not found" });
    res.json({ success: true, data: visitor });
  } catch (err) {
    next(err);
  }
};

exports.blacklistVisitor = async (req, res, next) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      { isBlacklisted: true },
      { new: true },
    );
    if (!visitor)
      return res
        .status(404)
        .json({ success: false, message: "Visitor not found" });
    res.json({ success: true, message: "Visitor blacklisted", data: visitor });
  } catch (err) {
    next(err);
  }
};

// Schedule a visit
exports.scheduleVisit = async (req, res, next) => {
  try {
    const visitor = await Visitor.findById(req.body.visitor);
    if (!visitor)
      return res
        .status(404)
        .json({ success: false, message: "Visitor not found" });
    if (visitor.isBlacklisted)
      return res
        .status(403)
        .json({ success: false, message: "Visitor is blacklisted" });

    const inmate = await Inmate.findById(req.body.inmate);
    if (!inmate)
      return res
        .status(404)
        .json({ success: false, message: "Inmate not found" });
    if (inmate.status === "released")
      return res
        .status(400)
        .json({ success: false, message: "Inmate has been released" });

    const visit = await VisitLog.create({
      ...req.body,
      approvedBy: req.user.id,
    });
    res.status(201).json({ success: true, data: visit });
  } catch (err) {
    next(err);
  }
};

// Check visitor in
exports.checkIn = async (req, res, next) => {
  try {
    const visit = await VisitLog.findById(req.params.id);
    if (!visit)
      return res
        .status(404)
        .json({ success: false, message: "Visit not found" });
    if (visit.status !== "scheduled")
      return res
        .status(400)
        .json({ success: false, message: `Visit is already ${visit.status}` });

    visit.checkedInAt = new Date();
    visit.status = "completed";
    await visit.save();

    res.json({ success: true, message: "Visitor checked in", data: visit });
  } catch (err) {
    next(err);
  }
};

// Check visitor out
exports.checkOut = async (req, res, next) => {
  try {
    const visit = await VisitLog.findById(req.params.id);
    if (!visit)
      return res
        .status(404)
        .json({ success: false, message: "Visit not found" });

    visit.checkedOutAt = new Date();
    await visit.save();

    res.json({ success: true, message: "Visitor checked out", data: visit });
  } catch (err) {
    next(err);
  }
};

exports.getAllVisitLogs = async (req, res, next) => {
  try {
    const { status, inmate, date } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (inmate) filter.inmate = inmate;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.scheduledAt = { $gte: start, $lte: end };
    }
    const logs = await VisitLog.find(filter)
      .populate("visitor", "firstName lastName phone")
      .populate("inmate", "firstName lastName inmateNumber")
      .populate("approvedBy", "name role")
      .sort({ scheduledAt: -1 });

    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    next(err);
  }
};
