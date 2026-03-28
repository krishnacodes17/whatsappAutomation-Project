const Queue = require("bull");
const Message = require("../models/message.model");

const messageQueue = new Queue("messages", {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },
});

// Process messages from queue
messageQueue.process(5, async (job) => {
  try {
    const { messageId, userId, groupMembers } = job.data;

    // Find message
    const message = await Message.findById(messageId);

    if (!message) {
      throw new Error("Message not found");
    }

    // Send to each member (WhatsApp API would go here)
    const deliveredTo = [];
    const failedRecipients = [];

    for (const member of groupMembers) {
      try {
        // TODO: Send to WhatsApp API
        // await whatsappAPI.send(member.phone, message.message)
        
        deliveredTo.push({
          userId: member._id,
          deliveredAt: new Date(),
        });
      } catch (error) {
        failedRecipients.push({
          userId: member._id,
          reason: error.message,
        });
      }
    }

    // Update message status
    message.deliveredTo = deliveredTo;
    message.failedRecipients = failedRecipients;
    message.status = failedRecipients.length === 0 ? "delivered" : "partial";

    await message.save();

    return { success: true, deliveredTo, failedRecipients };
  } catch (error) {
    throw new Error(`Failed to process message: ${error.message}`);
  }
});

console.log("Message worker started!");

module.exports = messageQueue;