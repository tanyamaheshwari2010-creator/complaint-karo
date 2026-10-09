const Department = require("../models/department");

const getDepartmentByKey = async (departmentKey) => {
    const departmentMap = {
        sanitation: "Sanitation & Garbage",
        water: "Water & Drainage",
        electricity: "Electricity & Streetlights"
    };

    const departmentName = departmentMap[departmentKey];

    if (!departmentName) {
        return null;
    }

    const department = await Department.findOne({
        name: departmentName,
        isActive: true
    });

    return department;
};

module.exports = {
    getDepartmentByKey
};