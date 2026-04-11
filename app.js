require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// Connect to MongoDB
connectDB();

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/inmates", require("./routes/inmate.routes"));
app.use("/api/cells", require("./routes/cell.routes"));
app.use("/api/staff", require("./routes/staff.routes"));
app.use("/api/visitors", require("./routes/visitor.routes"));
app.use("/api/incidents", require("./routes/incident.routes"));
app.use("/api/court", require("./routes/court.routes"));
app.use("/api/medical", require("./routes/medical.routes"));
app.use("/api/finance", require("./routes/finance.routes"));
app.use("/api/blocks", require("./routes/block.routes"));

app.use(errorHandler);

module.exports = app;
