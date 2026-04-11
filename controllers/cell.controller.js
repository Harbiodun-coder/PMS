const Cell = require("../models/Cell");

exports.createCell = async (req, res, next) => {
  try {
    const cell = await Cell.create(req.body);
    res.status(201).json({ success: true, data: cell });
  } catch (err) {
    next(err);
  }
};

exports.getAllCells = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.block) filter.block = req.query.block;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;

    const cells = await Cell.find(filter).populate("block", "name");
    res.json({ success: true, count: cells.length, data: cells });
  } catch (err) {
    next(err);
  }
};

exports.getCell = async (req, res, next) => {
  try {
    const cell = await Cell.findById(req.params.id).populate("block", "name");
    if (!cell)
      return res
        .status(404)
        .json({ success: false, message: "Cell not found" });
    res.json({ success: true, data: cell });
  } catch (err) {
    next(err);
  }
};

exports.updateCell = async (req, res, next) => {
  try {
    const cell = await Cell.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!cell)
      return res
        .status(404)
        .json({ success: false, message: "Cell not found" });
    res.json({ success: true, data: cell });
  } catch (err) {
    next(err);
  }
};

exports.deleteCell = async (req, res, next) => {
  try {
    await Cell.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.json({ success: true, message: "Cell deleted successfully" });
  } catch (err) {
    next(err);
  }
};
