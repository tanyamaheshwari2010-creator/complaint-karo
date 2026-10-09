const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const createOfficer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const hashedPassword = await bcrypt.hash("officer123", 10);

        const officer = await User.create({
            name: "Test Officer",
            email: "officer@example.com",
            password: hashedPassword,
            role: "complaint_officer"
        });

        console.log("Officer created:", officer.email);

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error.message);
    }
};

createOfficer();