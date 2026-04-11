const mongoose = require("mongoose");

const inmateSchema = new mongoose.Schema(
  {
    inmateNumber: { type: String, required: true, unique: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    nationality: { type: String },
    status: {
      type: String,
      enum: ["awaiting_trial", "convicted", "released", "transferred"],
      default: "awaiting_trial",
    },
    admissionDate: { type: Date, required: true, default: Date.now },
    releaseDate: { type: Date },
    cell: { type: mongoose.Schema.Types.ObjectId, ref: "Cell" },
    block: { type: mongoose.Schema.Types.ObjectId, ref: "Block" },
    photo: { type: String },
    notes: { type: String },
    isDeleted: { type: Boolean, default: false }, // soft delete
  },
  { timestamps: true },
);

// Exclude soft-deleted inmates from all queries
inmateSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

module.exports = mongoose.model("Inmate", inmateSchema);
