
const express = require("express");
const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

const {
    getAssignedComplaints, startWork, resolveComplaint
} = require("../controllers/workerController");

const router = express.Router();

router.get(
    "/complaints",
    protect,
    authorize("field_worker"),
    getAssignedComplaints
);

router.patch(
    "/complaints/:id/start",
     protect,
     authorize("field_worker"),
     startWork
);


router.patch(
    "/complaints/:id/resolve",
     protect,
     authorize("field_worker"),
     resolveComplaint
);

module.exports = router;
