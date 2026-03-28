const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const {
  sendMessageController,
  getGroupMessagesController,
  getMessageByIdController,
} = require("../controllers/message.controller");

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// Send message to group - POST /api/messages/:groupId/send
router.post("/:groupId/send", sendMessageController);

// Get all messages in group - GET /api/messages/:groupId
router.get("/:groupId", getGroupMessagesController);

// Get single message - GET /api/messages/msg/:messageId
router.get("/msg/:messageId", getMessageByIdController);

module.exports = router;