const express = require("express");
const { createComplaint, getMyComplaints, getComplaintById } = require("../controllers/complaintControllers");
const protect = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", protect, createComplaint);

router.get("/", protect, getMyComplaints);

router.get("/:id", protect, getComplaintById);

module.exports = router;