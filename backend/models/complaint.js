const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
    {
        citizenId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        location: {
            type: String,
            trim: true,
            default: ""
        },

        category: {
            type: String,
            enum: [
                "garbage",
                "water",
                "electricity",
                "streetlight",
                "other"
            ],
            default: null
        },

        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            default: null
        },

        aiSuggestedCategory: {
            type: String,
            enum: [
                "garbage",
                "water",
                "electricity",
                "streetlight",
                "other"
            ],
            default: null
        },

        aiSuggestedDepartmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            default: null
        },

        aiConfidence: {
            type: Number,
            default: null
        },

        aiStatus: {
            type: String,
            enum: ["pending", "processing", "completed", "failed"],
            default: "pending"
        },

        aiProcessedAt: {
            type: Date,
            default: null
        },

        status: {
            type: String,
            enum: [
                "submitted",
                "under_review",
                "assigned",
                "in_progress",
                "resolved"
            ],
            default: "submitted"
        },

        latitude: {
            type: Number,
            default: null
        },

        longitude: {
            type: Number,
            default: null
        },
        
        locationAccuracy: {
            type: Number,
            default: null
        },

        assignedOfficerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        assignedWorkerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        }
    },
    {
        timestamps: true
    }
);

const Complaint = mongoose.model("Complaint", complaintSchema);

module.exports = Complaint;