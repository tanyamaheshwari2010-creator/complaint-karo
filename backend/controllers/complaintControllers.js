const Complaint = require("../models/complaint");
const {
    processComplaintWithAI
} = require("../services/complaintAIService");

const createComplaint = async (req, res) => {
    try {
        const { description, location } = req.body;

        if (!description || !description.trim()) {
            return res.status(400).json({
                message: "Complaint description is required"
            });
        }

        const complaint = await Complaint.create({
            citizenId: req.user.userId,
            description,
            location: location?.trim() ?? "",
            aiStatus: "processing"
        });

        try {
            const aiResult = await processComplaintWithAI(description);

            complaint.aiSuggestedCategory = aiResult.category;
            complaint.aiConfidence = aiResult.confidence;
            complaint.aiSuggestedDepartmentId = aiResult.departmentId;
            complaint.aiStatus = "completed";
        } catch (error) {
            console.error("AI processing failed:", error.message);

            complaint.aiStatus = "failed";
        } finally {
            complaint.aiProcessedAt = new Date();
            await complaint.save();
        }

        res.status(201).json({
            message: "Complaint submitted successfully",
            complaint
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


const getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({
            citizenId: req.user.userId
        }).sort({ createdAt: -1 });

        res.json({
            complaints
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const getComplaintById = async (req, res) => {
    try {
        const complaint = await Complaint.findOne({
            _id: req.params.id,
            citizenId: req.user.userId
        });

        if (!complaint) {
            return res.status(404).json({
                message: "Complaint not found"
            });
        }

        res.json({
            complaint
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = { createComplaint, getMyComplaints, getComplaintById };