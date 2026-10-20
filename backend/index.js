const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoute");
const complaintRoutes = require("./routes/complaintRoute");
const officerRoutes = require("./routes/officerRoute");
const workerRoutes = require("./routes/workerRoute");

dotenv.config();

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173").split(",").map((s) => s.trim());
app.use(cors({ origin: allowedOrigins }));

const rateLimit = require("express-rate-limit");
app.set("trust proxy", 1); // Render sits in front of your app. Without this, everyone looks like one person.

const limiter = (limit, minutes) =>
    rateLimit({
        windowMs: minutes * 60 * 1000,
        limit,
        standardHeaders: true,
        legacyHeaders: false,
        skip: () => process.env.NODE_ENV !== "production", // so your API tests don't get blocked
        message: { message: "Too many attempts. Please try again later." },
    });

app.use("/api/auth", limiter(20, 15));            // logins and signups
app.post("/api/complaints", limiter(30, 60));     // new complaints only; the dashboards' refreshing is not limited

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/officer", officerRoutes);
app.use("/api/worker", workerRoutes);


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