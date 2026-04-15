const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    staffId: { type: String, required: true, unique: true },
    department: {
      type: String,
      enum: ["security", "administration", "medical", "legal", "maintenance"],
      required: true,
    },
    rank: { type: String },
    phone: { type: String, required: true },
    address: { type: String },
    dateJoined: { type: Date, default: Date.now },
    shift: {
      type: String,
      enum: ["morning", "afternoon", "night"],
    },
    assignedBlock: { type: mongoose.Schema.Types.ObjectId, ref: "Block" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

staffSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

module.exports = mongoose.model("Staff", staffSchema);
