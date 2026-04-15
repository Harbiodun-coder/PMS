const Inmate = require("../models/Inmate");
const Cell = require("../models/Cell");

// Helper to generate unique inmate number
const generateInmateNumber = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `PMS-${year}-${rand}`;
};

// ─── CREATE INMATE ───────────────────────────────────────────
exports.createInmate = async (req, res, next) => {
  try {
    const { cellId, ...inmateData } = req.body;

    // Assign to cell if provided
    if (cellId) {
      const cell = await Cell.findById(cellId);
      if (!cell)
        return res
          .status(404)
          .json({ success: false, message: "Cell not found" });
      if (cell.status === "full")
        return res
          .status(400)
          .json({ success: false, message: "Cell is full" });
      if (cell.status === "under_maintenance")
        return res
          .status(400)
          .json({ success: false, message: "Cell is under maintenance" });

      inmateData.cell = cellId;
      inmateData.block = cell.block;

      // Increment cell occupancy
      cell.currentCount += 1;
      await cell.save();
    }

    inmateData.inmateNumber = generateInmateNumber();
    const inmate = await Inmate.create(inmateData);

    res.status(201).json({ success: true, data: inmate });
  } catch (err) {
    next(err);
  }
};

// ─── GET ALL INMATES (with search + filter) ──────────────────
exports.getAllInmates = async (req, res, next) => {
  try {
    const {
      status,
      gender,
      cell,
      block,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (gender) filter.gender = gender;
    if (cell) filter.cell = cell;
    if (block) filter.block = block;

    // Search by name or inmate number
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { inmateNumber: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await Inmate.countDocuments(filter);

    const inmates = await Inmate.find(filter)
      .populate("cell", "cellNumber")
      .populate("block", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: inmates,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET SINGLE INMATE ───────────────────────────────────────
exports.getInmate = async (req, res, next) => {
  try {
    const inmate = await Inmate.findById(req.params.id)
      .populate("cell", "cellNumber type status")
      .populate("block", "name");

    if (!inmate)
      return res
        .status(404)
        .json({ success: false, message: "Inmate not found" });
    res.json({ success: true, data: inmate });
  } catch (err) {
    next(err);
  }
};

// ─── UPDATE INMATE ───────────────────────────────────────────
exports.updateInmate = async (req, res, next) => {
  try {
    const inmate = await Inmate.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!inmate)
      return res
        .status(404)
        .json({ success: false, message: "Inmate not found" });
    res.json({ success: true, data: inmate });
  } catch (err) {
    next(err);
  }
};

// ─── TRANSFER INMATE TO ANOTHER CELL ─────────────────────────
exports.transferInmate = async (req, res, next) => {
  try {
    const { newCellId } = req.body;
    const inmate = await Inmate.findById(req.params.id);
    if (!inmate)
      return res
        .status(404)
        .json({ success: false, message: "Inmate not found" });

    const newCell = await Cell.findById(newCellId);
    if (!newCell)
      return res
        .status(404)
        .json({ success: false, message: "New cell not found" });
    if (newCell.status === "full")
      return res
        .status(400)
        .json({ success: false, message: "Target cell is full" });

    // Decrement old cell
    if (inmate.cell) {
      await Cell.findByIdAndUpdate(inmate.cell, { $inc: { currentCount: -1 } });
      // Re-trigger status update
      const oldCell = await Cell.findById(inmate.cell);
      if (oldCell) await oldCell.save();
    }

    // Increment new cell
    newCell.currentCount += 1;
    await newCell.save();

    inmate.cell = newCellId;
    inmate.block = newCell.block;
    await inmate.save();

    res.json({
      success: true,
      message: "Inmate transferred successfully",
      data: inmate,
    });
  } catch (err) {
    next(err);
  }
};

// ─── RELEASE INMATE ───────────────────────────────────────────
exports.releaseInmate = async (req, res, next) => {
  try {
    const inmate = await Inmate.findById(req.params.id);
    if (!inmate)
      return res
        .status(404)
        .json({ success: false, message: "Inmate not found" });

    // Free up the cell
    if (inmate.cell) {
      await Cell.findByIdAndUpdate(inmate.cell, { $inc: { currentCount: -1 } });
      const cell = await Cell.findById(inmate.cell);
      if (cell) await cell.save();
    }

    inmate.status = "released";
    inmate.releaseDate = new Date();
    inmate.cell = null;
    inmate.block = null;
    await inmate.save();

    res.json({
      success: true,
      message: "Inmate released successfully",
      data: inmate,
    });
  } catch (err) {
    next(err);
  }
};

// ─── SOFT DELETE ─────────────────────────────────────────────
exports.deleteInmate = async (req, res, next) => {
  try {
    const inmate = await Inmate.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
    });
    if (!inmate)
      return res
        .status(404)
        .json({ success: false, message: "Inmate not found" });
    res.json({ success: true, message: "Inmate record deleted" });
  } catch (err) {
    next(err);
  }
};

// TRANSFER INMATE to another cell/block
exports.transferInmate = async (req, res, next) => {
  try {
    const { cellId, reason } = req.body;

    const inmate = await Inmate.findById(req.params.id);
    if (!inmate)
      return res
        .status(404)
        .json({ success: false, message: "Inmate not found" });

    const newCell = await Cell.findById(cellId);
    if (!newCell)
      return res
        .status(404)
        .json({ success: false, message: "Cell not found" });
    if (newCell.status === "full")
      return res.status(400).json({ success: false, message: "Cell is full" });
    if (newCell.status === "under_maintenance")
      return res
        .status(400)
        .json({ success: false, message: "Cell is under maintenance" });

    // Free up old cell
    if (inmate.cell) {
      await Cell.findByIdAndUpdate(inmate.cell, {
        $inc: { currentOccupancy: -1 },
      });
    }

    // Assign new cell
    inmate.cell = newCell._id;
    inmate.block = newCell.block;
    if (reason)
      inmate.notes = `Transferred: ${reason}. Previous notes: ${inmate.notes || ""}`;
    await inmate.save();

    // Increment new cell occupancy
    newCell.currentOccupancy += 1;
    await newCell.save();

    res.json({
      success: true,
      message: "Inmate transferred successfully",
      data: inmate,
    });
  } catch (err) {
    next(err);
  }
};

// RELEASE INMATE
exports.releaseInmate = async (req, res, next) => {
  try {
    const inmate = await Inmate.findById(req.params.id);
    if (!inmate)
      return res
        .status(404)
        .json({ success: false, message: "Inmate not found" });
    if (inmate.status === "released")
      return res
        .status(400)
        .json({ success: false, message: "Inmate is already released" });

    // Free up cell
    if (inmate.cell) {
      await Cell.findByIdAndUpdate(inmate.cell, {
        $inc: { currentOccupancy: -1 },
      });
    }

    inmate.status = "released";
    inmate.releaseDate = new Date();
    inmate.cell = null;
    inmate.block = null;
    await inmate.save();

    res.json({
      success: true,
      message: "Inmate released successfully",
      data: inmate,
    });
  } catch (err) {
    next(err);
  }
};
