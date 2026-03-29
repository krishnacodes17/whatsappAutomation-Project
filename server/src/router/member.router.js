const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const upload = require("../config/multer");
const {
  uploadMembersCSVController,
  getMembersController,
  getMemberStatsController,
  updateMemberStatusController
} = require("../controllers/member.controller");

const memberRouter = express.Router();

// All routes require authentication
memberRouter.use(authMiddleware);

// Upload CSV to add members to a group
memberRouter.post("/:groupId/upload-csv", upload.single("file"), uploadMembersCSVController);

// Get all members of a group
memberRouter.get("/:groupId", getMembersController);

// Get member statistics
memberRouter.get("/:groupId/stats", getMemberStatsController);

// Update member status
memberRouter.patch("/:memberId/status", updateMemberStatusController);

module.exports = memberRouter;
