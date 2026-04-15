const mongoose = require("mongoose");

const visitLogSchema = new mongoose.Schema(
  {
    visitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visitor",
      required: true,
    },
    inmate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inmate",
      required: true,
    },
    scheduledAt: { type: Date, required: true },
    checkedInAt: { type: Date },
    checkedOutAt: { type: Date },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "no_show"],
      default: "scheduled",
    },
    purpose: {
      type: String,
      enum: ["family", "legal", "medical", "other"],
      default: "family",
    },
    notes: { type: String },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("VisitLog", visitLogSchema);
