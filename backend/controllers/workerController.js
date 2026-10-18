
const Complaint = require("../models/complaint");
const mongoose = require("mongoose");


const getAssignedComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({
            assignedWorkerId: req.user.userId
        })
            .sort({ createdAt: -1 })
            .populate("departmentId", "name")
            .populate("citizenId", "name email");

        return res.status(200).json({
            message: "Assigned complaints fetched successfully",
            complaints
        });
    } catch (error) {
        console.error("Failed to fetch assigned complaints:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};


const moveComplaint = (from, to, message) => async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid complaint ID" });
    }

    try {
        // This only matches if the complaint is assigned to THIS worker
        // AND is currently in the expected status. The check and the update
        // happen in one step, so a complaint can never skip or go backwards.
        const complaint = await Complaint.findOneAndUpdate(
            { _id: req.params.id, assignedWorkerId: req.user.userId, status: from },
            { $set: { status: to } },
            { new: true }
        );

        if (complaint) {
            return res.json({ message, complaint });
        }

        // No match: either it isn't theirs (404) or it's in the wrong status (409)
        const isMine = await Complaint.exists({
            _id: req.params.id,
            assignedWorkerId: req.user.userId
        });

        return isMine
            ? res.status(409).json({ message: `This complaint can't be moved to ${to} from its current status` })
            : res.status(404).json({ message: "Complaint not found" });
    } catch (error) {
        console.error("Worker status error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const startWork = moveComplaint("assigned", "in_progress", "Work started");
const resolveComplaint = moveComplaint("in_progress", "resolved", "Complaint resolved");

module.exports = {
    getAssignedComplaints,
    startWork,
    resolveComplaint
};
