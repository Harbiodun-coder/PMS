const mongoose = require("mongoose");

const cellSchema = new mongoose.Schema(
  {
    cellNumber: { type: String, required: true, unique: true, trim: true }, // e.g. "A-101"
    block: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Block",
      required: true,
    },
    capacity: { type: Number, required: true, default: 2 },
    currentCount: { type: Number, default: 0 },
    type: {
      type: String,
      enum: ["general", "solitary", "medical", "juvenile", "high_security"],
      default: "general",
    },
    status: {
      type: String,
      enum: ["available", "full", "under_maintenance"],
      default: "available",
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Auto-update status based on capacity
cellSchema.pre("save", function (next) {
  if (this.currentCount >= this.capacity) {
    this.status = "full";
  } else if (this.status !== "under_maintenance") {
    this.status = "available";
  }
  next();
});

cellSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

module.exports = mongoose.model("Cell", cellSchema);
