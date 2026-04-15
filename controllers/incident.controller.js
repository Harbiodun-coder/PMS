const Incident = require("../models/Incident");

exports.createIncident = async (req, res, next) => {
  try {
    const incident = await Incident.create({
      ...req.body,
      reportedBy: req.user.id,
    });
    res.status(201).json({ success: true, data: incident });
  } catch (err) {
    next(err);
  }
};

exports.getAllIncidents = async (req, res, next) => {
  try {
    const { status, severity, type, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (type) filter.type = type;

    const skip = (page - 1) * limit;
    const total = await Incident.countDocuments(filter);
    const incidents = await Incident.find(filter)
      .populate("block", "name")
      .populate("inmatesInvolved", "firstName lastName inmateNumber")
      .populate("reportedBy", "name role")
      .populate("resolvedBy", "name role")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: incidents,
    });
  } catch (err) {
    next(err);
  }
};

exports.getIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id).populate(
      "block inmatesInvolved staffInvolved reportedBy resolvedBy",
    );
    if (!incident)
      return res
        .status(404)
        .json({ success: false, message: "Incident not found" });
    res.json({ success: true, data: incident });
  } catch (err) {
    next(err);
  }
};

exports.updateIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!incident)
      return res
        .status(404)
        .json({ success: false, message: "Incident not found" });
    res.json({ success: true, data: incident });
  } catch (err) {
    next(err);
  }
};

exports.resolveIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident)
      return res
        .status(404)
        .json({ success: false, message: "Incident not found" });
    if (incident.status === "resolved" || incident.status === "closed")
      return res
        .status(400)
        .json({ success: false, message: "Incident already resolved" });

    incident.status = "resolved";
    incident.resolution = req.body.resolution;
    incident.resolvedAt = new Date();
    incident.resolvedBy = req.user.id;
    await incident.save();

    res.json({ success: true, message: "Incident resolved", data: incident });
  } catch (err) {
    next(err);
  }
};

exports.deleteIncident = async (req, res, next) => {
  try {
    await Incident.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.json({ success: true, message: "Incident deleted" });
  } catch (err) {
    next(err);
  }
};
