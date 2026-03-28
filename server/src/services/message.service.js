const Message = require("../models/message.model");
const Group = require("../models/group.model");
const { messageQueue } = require("../config/queue");

// Send message to group (adds to queue)
async function sendMessageService(groupId, userId, message) {
  try {
    // Find group and get members
    const group = await Group.findById(groupId).populate(
      "members.userId",
      "email"
    );

    if (!group) {
      throw new Error("Group not found");
    }

    // Create message document
    const newMessage = new Message({
      groupId,
      senderId: userId,
      message,
      status: "pending",
    });

    await newMessage.save();

    // Get members for queue job
    const groupMembers = group.members.map((m) => ({
      _id: m.userId._id,
      phone: m.userId.email, // or phone number if available
    }));

    // Add to queue instead of sending directly
    await messageQueue.add(
      {
        messageId: newMessage._id,
        userId,
        groupMembers,
      },
      {
        attempts: 3,  // Retry 3 times
        backoff: {
          type: "exponential",
          delay: 2000,  // Start with 2 seconds
        },
        removeOnComplete: true,
      }
    );

    return newMessage;
  } catch (error) {
    throw error;
  }
}

// Get messages for group
async function getGroupMessagesService(groupId) {
  const messages = await Message.find({ groupId })
    .populate("senderId", "name email")
    .populate("deliveredTo.userId", "name email")
    .sort({ createdAt: -1 });

  return messages;
}

// Get message by ID
async function getMessageByIdService(messageId) {
  const message = await Message.findById(messageId)
    .populate("senderId", "name email")
    .populate("deliveredTo.userId", "name email");

  if (!message) {
    throw new Error("Message not found");
  }

  return message;
}

module.exports = {
  sendMessageService,
  getGroupMessagesService,
  getMessageByIdService,
};