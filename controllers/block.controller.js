const Block = require("../models/Block");

exports.createBlock = async (req, res, next) => {
  try {
    const block = await Block.create(req.body);
    res.status(201).json({ success: true, data: block });
  } catch (err) {
    next(err);
  }
};

exports.getAllBlocks = async (req, res, next) => {
  try {
    const blocks = await Block.find();
    res.json({ success: true, count: blocks.length, data: blocks });
  } catch (err) {
    next(err);
  }
};

exports.getBlock = async (req, res, next) => {
  try {
    const block = await Block.findById(req.params.id);
    if (!block)
      return res
        .status(404)
        .json({ success: false, message: "Block not found" });
    res.json({ success: true, data: block });
  } catch (err) {
    next(err);
  }
};

exports.updateBlock = async (req, res, next) => {
  try {
    const block = await Block.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!block)
      return res
        .status(404)
        .json({ success: false, message: "Block not found" });
    res.json({ success: true, data: block });
  } catch (err) {
    next(err);
  }
};

exports.deleteBlock = async (req, res, next) => {
  try {
    await Block.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.json({ success: true, message: "Block deleted successfully" });
  } catch (err) {
    next(err);
  }
};
