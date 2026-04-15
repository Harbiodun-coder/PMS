require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const existing = await User.findOne({ email: "admin@pms.com" });
    if (existing) {
      console.log("Admin already exists");
      process.exit(0);
    }

    await User.create({
      name: "Super Admin",
      email: "admin@pms.com",
      password: "admin123456",
      role: "admin",
      isActive: true,
    });

    console.log("✅ Admin created successfully");
    console.log("📧 Email:    admin@pms.com");
    console.log("🔑 Password: admin123456");
    process.exit(0);
  } catch (err) {
    console.error("Seeder error:", err.message);
    process.exit(1);
  }
};

seedAdmin();
