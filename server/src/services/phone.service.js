/**
 * Phone number validation and formatting utility
 */

// Validate phone number format
const validatePhoneNumber = (phone) => {
  if (!phone) return false;
  
  // Remove common formatting characters
  const cleaned = phone.toString().replace(/[\s\-\(\)\.]/g, "");
  
  // International format: +[country code][number] OR [country code][number]
  const phoneRegex = /^(\+)?[0-9]{7,15}$/;
  
  return phoneRegex.test(cleaned);
};

// Format phone to standard format (with +91 for India if needed)
const formatPhoneNumber = (phone, countryCode = "+91") => {
  if (!phone) return null;
  
  // Remove all non-digit characters except +
  let cleaned = phone.toString().replace(/[^\d+]/g, "");
  
  // If already has +, keep it; otherwise add country code
  if (cleaned.startsWith("+")) {
    return cleaned;
  } else if (cleaned.length === 10) {
    // Indian 10-digit number
    return `${countryCode}${cleaned}`;
  } else if (cleaned.length > 10) {
    // Already includes country code digits
    return `+${cleaned}`;
  }
  
  return cleaned;
};

// Normalize phone for duplicate checking
const normalizePhoneNumber = (phone) => {
  const cleaned = phone.toString().replace(/[\s\-\(\)\.]/g, "");
  // Remove leading zeros and country code variations
  return cleaned.replace(/^\+?0?/, "");
};

module.exports = {
  validatePhoneNumber,
  formatPhoneNumber,
  normalizePhoneNumber,
};
