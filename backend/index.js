const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoute");
const complaintRoutes = require("./routes/complaintRoute");
const officerRoutes = require("./routes/officerRoute");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/officer", officerRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Voice Complaint System API is running"
    });
});

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});