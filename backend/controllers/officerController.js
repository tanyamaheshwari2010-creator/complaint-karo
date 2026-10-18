const mongoose = require("mongoose");
const Complaint = require("../models/complaint");
const Department = require("../models/department");

const {
    ALLOWED_CATEGORIES
} = require("../constants/complaintConstants");

const getOfficerComplaints = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = typeof status === "string" && status ? { status } : {};

        const complaints = await Complaint.find(filter)
            .sort({ createdAt: -1 })
            .limit(200)
            .populate("citizenId", "name email")
            .populate("departmentId", "name");

        res.json({ complaints });
    } catch (error) {
        console.error("Get officer complaints error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const getOfficerComplaintById = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
            message: "Invalid complaint ID"
        });
    }

    try {
        const complaint = await Complaint.findById(req.params.id)
            .populate("citizenId", "name email")
            .populate("departmentId", "name");

        if (!complaint) {
            return res.status(404).json({
                message: "Complaint not found"
            });
        }

        res.json({ complaint });
    } catch (error) {
        console.error("Get officer complaint error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const reviewComplaint = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
            message: "Invalid complaint ID"
        });
    }

    try {
        const { category, departmentId } = req.body;

        // Validate category
        if (
            category !== undefined &&
            !ALLOWED_CATEGORIES.includes(category)
        ) {
            return res.status(400).json({
                message: "Invalid complaint category"
            });
        }

        // Validate department ID and ensure it is active
        if (departmentId !== undefined && departmentId !== null) {
            if (!mongoose.isValidObjectId(departmentId)) {
                return res.status(400).json({
                    message: "Invalid department ID"
                });
            }

            const department = await Department.findOne({
                _id: departmentId,
                isActive: true
            });

            if (!department) {
                return res.status(400).json({
                    message: "Department not found or inactive"
                });
            }
        }



        // Fetch the complaint before modifying it
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                message: "Complaint not found"
            });
        }

        if (
            complaint.status !== "submitted" &&
            complaint.status !== "under_review"
        ) {
            return res.status(409).json({
                message: "This complaint is no longer available for initial review"
            });
        }

        if (category !== undefined) {
            complaint.category = category;
        }

        if (departmentId !== undefined) {
            complaint.departmentId = departmentId;
        }

        // Initial review always leaves the complaint under review
        complaint.status = "under_review";

        await complaint.save();

        res.json({
            message: "Complaint reviewed successfully",
            complaint
        });
    } catch (error) {
        console.error("Review complaint error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


const User = require("../models/user");

const assignWorker = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid complaint ID" });
    }

    const { workerId } = req.body;

    if (!mongoose.isValidObjectId(workerId)) {
        return res.status(400).json({ message: "Valid worker ID is required" });
    }

    try {
        const worker = await User.findOne({ _id: workerId, role: "field_worker" });

        if (!worker) {
            return res.status(404).json({ message: "Field worker not found" });
        }

        // One atomic step: only works if the complaint is STILL reviewed and has a department.
        const complaint = await Complaint.findOneAndUpdate(
            { _id: req.params.id, status: "under_review", departmentId: { $ne: null } },
            {
                $set: {
                    assignedWorkerId: worker._id,
                    assignedOfficerId: req.user.userId,
                    status: "assigned"
                }
            },
            { returnDocument: "after" }
        );

        if (!complaint) {
            const exists = await Complaint.exists({ _id: req.params.id });
            return exists
                ? res.status(409).json({ message: "Complaint must be reviewed and have a department before assignment" })
                : res.status(404).json({ message: "Complaint not found" });
        }

        res.json({ message: "Worker assigned successfully", complaint });
    } catch (error) {
        console.error("Assign worker error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find({ isActive: true })
            .select("name")
            .sort({ name: 1 });

        res.json({ departments });
    } catch (error) {
        console.error("Get departments error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const getWorkers = async (req, res) => {
    try {
        const workers = await User.find({ role: "field_worker" })
            .select("name email")
            .sort({ name: 1 });

        res.json({ workers });
    } catch (error) {
        console.error("Get workers error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    getOfficerComplaints,
    getOfficerComplaintById,
    reviewComplaint,
    assignWorker,
    getDepartments,
    getWorkers
};

