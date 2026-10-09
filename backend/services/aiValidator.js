const {
    ALLOWED_CATEGORIES
} = require("../constants/complaintConstants");

const validateAIResult = (result) => {
    if (!result || typeof result !== "object" || Array.isArray(result)) {
        return false;
    }

    if (!ALLOWED_CATEGORIES.includes(result.category)) {
        return false;
    }

    if (
        typeof result.confidence !== "number" ||
        !Number.isFinite(result.confidence) ||
        result.confidence < 0 ||
        result.confidence > 1
    ) {
        return false;
    }

    return true;
};

module.exports = {
    validateAIResult
};