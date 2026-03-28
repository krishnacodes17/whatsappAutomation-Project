const Message = require("../models/message.model");
const Group = require("../models/group.model");

// Send message to group
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

    // Send to all members (WhatsApp API integration would go here)
    const memberIds = group.members.map((m) => m.userId._id.toString());

    // Mock: Update as sent
    newMessage.status = "sent";
    newMessage.deliveredTo = memberIds.map((id) => ({
      userId: id,
      deliveredAt: new Date(),
    }));

    await newMessage.save();

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