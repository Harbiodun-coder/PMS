const Staff = require("../models/Staff");
const User = require("../models/User");

const generateStaffId = async () => {
  const count = await Staff.countDocuments();
  return `PMS-STAFF-${String(count + 1).padStart(4, "0")}`;
};

exports.createStaff = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      department,
      rank,
      phone,
      address,
      shift,
      assignedBlock,
    } = req.body;

    const user = await User.create({ name, email, password, role });
    const staffId = await generateStaffId();
    const staff = await Staff.create({
      user: user._id,
      staffId,
      department,
      rank,
      phone,
      address,
      shift,
      assignedBlock,
    });

    res.status(201).json({ success: true, data: { user, staff } });
  } catch (err) {
    next(err);
  }
};

exports.getAllStaff = async (req, res, next) => {
  try {
    const { department, shift, search } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (shift) filter.shift = shift;

    let staffList = await Staff.find(filter)
      .populate("user", "name email role isActive")
      .populate("assignedBlock", "name securityLevel");

    if (search) {
      const s = search.toLowerCase();
      staffList = staffList.filter(
        (st) =>
          st.user?.name?.toLowerCase().includes(s) ||
          st.staffId?.toLowerCase().includes(s),
      );
    }

    res.json({ success: true, count: staffList.length, data: staffList });
  } catch (err) {
    next(err);
  }
};

exports.getStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id)
      .populate("user", "name email role isActive")
      .populate("assignedBlock", "name");
    if (!staff)
      return res
        .status(404)
        .json({ success: false, message: "Staff not found" });
    res.json({ success: true, data: staff });
  } catch (err) {
    next(err);
  }
};

exports.updateStaff = async (req, res, next) => {
  try {
    const { name, email, role, isActive, ...staffFields } = req.body;
    const staff = await Staff.findById(req.params.id);
    if (!staff)
      return res
        .status(404)
        .json({ success: false, message: "Staff not found" });

    if (name || email || role || isActive !== undefined) {
      await User.findByIdAndUpdate(staff.user, { name, email, role, isActive });
    }
    const updated = await Staff.findByIdAndUpdate(req.params.id, staffFields, {
      new: true,
    }).populate("user", "name email role isActive");

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

exports.deleteStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff)
      return res
        .status(404)
        .json({ success: false, message: "Staff not found" });
    await Staff.findByIdAndUpdate(req.params.id, { isDeleted: true });
    await User.findByIdAndUpdate(staff.user, { isActive: false });
    res.json({ success: true, message: "Staff member deactivated" });
  } catch (err) {
    next(err);
  }
};
