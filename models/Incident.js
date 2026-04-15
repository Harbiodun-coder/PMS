const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "fight",
        "self_harm",
        "escape_attempt",
        "contraband",
        "assault",
        "property_damage",
        "other",
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true,
    },
    location: { type: String },
    block: { type: mongoose.Schema.Types.ObjectId, ref: "Block" },
    inmatesInvolved: [{ type: mongoose.Schema.Types.ObjectId, ref: "Inmate" }],
    staffInvolved: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "under_review", "resolved", "closed"],
      default: "open",
    },
    resolution: { type: String },
    resolvedAt: { type: Date },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

incidentSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

module.exports = mongoose.model("Incident", incidentSchema);
