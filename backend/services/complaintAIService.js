const { classifyComplaint } = require("./aiService");
const { getDepartmentByKey } = require("./departmentService");

const CATEGORY_TO_DEPARTMENT =
    require("../constants/departmentMapping");

const processComplaintWithAI = async (description) => {
    const aiResult = await classifyComplaint(description);

    const departmentKey =
        CATEGORY_TO_DEPARTMENT[aiResult.category];

    let department = null;

    if (departmentKey) {
        department = await getDepartmentByKey(departmentKey);
    }

    return {
        category: aiResult.category,
        confidence: aiResult.confidence,
        departmentId: department ? department._id : null
    };
};

module.exports = {
    processComplaintWithAI
};