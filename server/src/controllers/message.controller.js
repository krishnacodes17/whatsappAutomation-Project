const {
  sendMessageService,
  getGroupMessagesService,
  getMessageByIdService,
} = require("../services/message.service");

// Send message to group
async function sendMessageController(req, res) {
  try {
    const { groupId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    const sentMessage = await sendMessageService(groupId, userId, message);

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: sentMessage,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// Get all messages in group
async function getGroupMessagesController(req, res) {
  try {
    const { groupId } = req.params;

    const messages = await getGroupMessagesService(groupId);

    res.status(200).json({
      success: true,
      message: "Messages fetched successfully",
      data: messages,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// Get single message
async function getMessageByIdController(req, res) {
  try {
    const { messageId } = req.params;

    const message = await getMessageByIdService(messageId);

    res.status(200).json({
      success: true,
      message: "Message fetched successfully",
      data: message,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  sendMessageController,
  getGroupMessagesController,
  getMessageByIdController,
};