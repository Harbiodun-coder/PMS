require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

connectDB();

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/blocks", require("./routes/block.routes"));
app.use("/api/cells", require("./routes/cell.routes"));
app.use("/api/inmates", require("./routes/inmate.routes"));
app.use("/api/staff", require("./routes/staff.routes"));
app.use("/api/visitors", require("./routes/visitor.routes"));
app.use("/api/incidents", require("./routes/incident.routes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));

app.use(errorHandler);

module.exports = app;

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
