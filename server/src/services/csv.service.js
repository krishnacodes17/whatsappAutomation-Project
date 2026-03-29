const fs = require("fs")
const csv = require("csv-parser")
const User = require("../models/User")
const { validatePhoneNumber } = require("./phone.service")

/**
 * Parse CSV file and extract member data
 * Expected CSV structure:
 * phone | desiredName
 * +91987654321 | John Doe
 * 9876543210 | Jane Doe
 */
async function parseCSVForMembers(filePath) {
  const results = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        // Expected columns: phone, desiredName (or name)
        const phone = data.phone || data.Phone || data.PHONE;
        const desiredName = data.desiredName || data.name || data.Name || null;

        if (phone && validatePhoneNumber(phone)) {
          results.push({
            phone,
            desiredName
          });
        }
      })
      .on("end", () => {
        resolve(results);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}


/**
 * Parse CSV file for emails (legacy, kept for backward compatibility)
 */
async function parseCSVFile(filePath) {
  const results = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        if (data.email) {
          results.push(data.email);
        }
      })
      .on("end", () => {
        resolve(results);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}


async function getUserIdsFromEmails(emails) {
  const users = await User.find({ email: { $in: emails } }).select("_id");
  return users.map((user) => user._id);
}


module.exports = {
  parseCSVFile,
  parseCSVForMembers,
  getUserIdsFromEmails
};