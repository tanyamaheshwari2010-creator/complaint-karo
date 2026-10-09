const express = require("express");

const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

const {
    getOfficerComplaints, getOfficerComplaintById, reviewComplaint
} = require("../controllers/officerController");

const router = express.Router();

router.get(
    "/complaints",
    protect,
    authorize("complaint_officer"),
    getOfficerComplaints
);

router.get(
    "/complaints/:id",
    protect,
    authorize("complaint_officer"),
    getOfficerComplaintById
);


router.patch(
    "/complaints/:id",
    protect,
    authorize("complaint_officer"),
    reviewComplaint
);

module.exports = router;