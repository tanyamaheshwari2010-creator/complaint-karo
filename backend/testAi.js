const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);
require("dotenv").config();
const mongoose = require("mongoose");

const {
    processComplaintWithAI
} = require("./services/complaintAIService");

const runTest = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");

        const result = await processComplaintWithAI(
            "There is garbage lying outside my house for three days."
        );

        console.log("Complete AI result:");
        console.log(result);
    } catch (error) {
        console.error("AI processing error:", error.message);
    } finally {
        await mongoose.disconnect();
    }
};

runTest();