const Complaint = require("../models/complaint");
const {
    processComplaintWithAI
} = require("../services/complaintAIService");



const classifyComplaintInBackground = async (complaintId, description) => {
    try {
        await Complaint.findByIdAndUpdate(complaintId, {
            aiStatus: "processing"
        });

        const aiResult = await processComplaintWithAI(description);

        await Complaint.findByIdAndUpdate(complaintId, {
            aiSuggestedCategory: aiResult.category,
            aiConfidence: aiResult.confidence,
            aiSuggestedDepartmentId: aiResult.departmentId,
            aiStatus: "completed",
            aiProcessedAt: new Date()
        });

        console.log(`AI classification completed for ${complaintId}`);
    } catch (error) {
        console.error(
            `AI classification failed for ${complaintId}:`,
            error.message
        );

        try {
            await Complaint.findByIdAndUpdate(complaintId, {
                aiStatus: "failed",
                aiProcessedAt: new Date()
            });
        } catch (dbError) {
            console.error(
                "Could not update AI status:",
                dbError.message
            );
        }
    }
};



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
            description: description.trim(),
            location: location?.trim() ?? "",
            aiStatus: "pending"
        });

        setImmediate(() => {
            void classifyComplaintInBackground(
                complaint._id,
                complaint.description
            );
        });

        return res.status(201).json({
            message: "Complaint submitted successfully",
            complaint
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
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