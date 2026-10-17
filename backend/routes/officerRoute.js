const express = require("express");

const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

const {
    getOfficerComplaints, getOfficerComplaintById, reviewComplaint, assignWorker, getDepartments,
    getWorkers
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

router.patch(
    "/complaints/:id/assign-worker",
    protect,
    authorize("complaint_officer", "admin"),
    assignWorker
);

router.get(
    "/departments",
    protect,
    authorize("complaint_officer", "admin"),
    getDepartments
);

router.get(
    "/workers",
    protect,
    authorize("complaint_officer", "admin"),
    getWorkers
);

module.exports = router;