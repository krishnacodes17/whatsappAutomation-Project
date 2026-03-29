const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/, "Please provide a valid phone number"],
    },

    desiredName: {
      type: String,
      trim: true,
      default: null,
    },

    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: [true, "Group ID is required"],
    },

    status: {
      type: String,
      enum: ["pending", "invited", "joined", "opted_out"],
      default: "pending",
    },

    optedOut: {
      type: Boolean,
      default: false,
    },

    optedOutAt: {
      type: Date,
      default: null,
    },

    inviteSentAt: {
      type: Date,
      default: null,
    },

    joinedAt: {
      type: Date,
      default: null,
    },

    metadata: {
      uploadedVia: {
        type: String,
        enum: ["csv", "manual"],
        default: "manual",
      },
      batchId: String,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index for unique members per group
memberSchema.index({ phone: 1, groupId: 1 }, { unique: true });

module.exports = mongoose.model("Member", memberSchema);
