const crypto = require("crypto");

/**
 * Generate a unique invite link for a group
 * Format: https://yourdomain.com/join/ABC123XYZ789
 */
const generateInviteLink = () => {
  // Generate random 12-character alphanumeric string
  const randomString = crypto.randomBytes(9).toString("hex").toUpperCase();
  return randomString;
};

/**
 * Validate invite link format
 */
const validateInviteLink = (link) => {
  // Should be 18 characters (hex string)
  const inviteLinkRegex = /^[A-F0-9]{18}$/;
  return inviteLinkRegex.test(link);
};

/**
 * Build full invite link URL
 */
const buildFullInviteLink = (inviteCode) => {
  const baseUrl = process.env.API_URL || "http://localhost:3000";
  return `${baseUrl}/join/${inviteCode}`;
};

module.exports = {
  generateInviteLink,
  validateInviteLink,
  buildFullInviteLink
};
