const Member = require("../models/member.model");
const { formatPhoneNumber, validatePhoneNumber } = require("./phone.service");


// Add single member
async function addMemberService(phone, groupId, desiredName = null, uploadedVia = "manual") {
  try {
    if (!phone || !groupId) {
      throw new Error("Phone and group ID are required");
    }

    // Validate phone format
    if (!validatePhoneNumber(phone)) {
      throw new Error(`Invalid phone number: ${phone}`);
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(phone);

    // Check if member already exists in this group
    const existingMember = await Member.findOne({
      phone: formattedPhone,
      groupId
    });

    if (existingMember) {
      throw new Error(`Member with phone ${phone} already exists in this group`);
    }

    // Create new member
    const member = new Member({
      phone: formattedPhone,
      desiredName,
      groupId,
      status: "pending",
      metadata: {
        uploadedVia
      }
    });

    await member.save();

    return {
      success: true,
      member
    };

  } catch (error) {
    throw new Error(error.message);
  }
}


// Add multiple members (CSV upload)
async function addMembersService(groupId, members, batchId = null) {
  try {
    if (!groupId || !members || members.length === 0) {
      throw new Error("Group ID and members array are required");
    }

    const results = {
      successful: [],
      failed: []
    };

    for (const memberData of members) {
      try {
        const { phone, desiredName } = memberData;

        if (!validatePhoneNumber(phone)) {
          results.failed.push({
            phone,
            reason: `Invalid phone number`
          });
          continue;
        }

        const formattedPhone = formatPhoneNumber(phone);

        // Check for duplicates in this batch
        const existingMember = await Member.findOne({
          phone: formattedPhone,
          groupId
        });

        if (existingMember) {
          results.failed.push({
            phone,
            reason: `Already exists in this group`
          });
          continue;
        }

        const member = new Member({
          phone: formattedPhone,
          desiredName,
          groupId,
          status: "pending",
          metadata: {
            uploadedVia: "csv",
            batchId
          }
        });

        await member.save();
        results.successful.push(phone);

      } catch (error) {
        results.failed.push({
          phone: memberData.phone,
          reason: error.message
        });
      }
    }

    return {
      success: true,
      uploadedCount: results.successful.length,
      failedCount: results.failed.length,
      details: {
        successful: results.successful,
        failed: results.failed
      }
    };

  } catch (error) {
    throw new Error(error.message);
  }
}


// Get all members of a group
async function getMembersService(groupId, filters = {}) {
  try {
    if (!groupId) {
      throw new Error("Group ID is required");
    }

    const query = { groupId };

    // Optional filters
    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.optedOut !== undefined) {
      query.optedOut = filters.optedOut;
    }

    const members = await Member.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      count: members.length,
      members
    };

  } catch (error) {
    throw new Error(error.message);
  }
}


// Get member by ID
async function getMemberByIdService(memberId) {
  try {
    if (!memberId) {
      throw new Error("Member ID is required");
    }

    const member = await Member.findById(memberId).lean();

    if (!member) {
      throw new Error("Member not found");
    }

    return {
      success: true,
      member
    };

  } catch (error) {
    throw new Error(error.message);
  }
}


// Update member status
async function updateMemberStatusService(memberId, status) {
  try {
    if (!memberId || !status) {
      throw new Error("Member ID and status are required");
    }

    const validStatuses = ["pending", "invited", "joined", "opted_out"];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    }

    let updateData = { status };

    // Set additional timestamps based on status
    if (status === "invited") {
      updateData.inviteSentAt = new Date();
    } else if (status === "joined") {
      updateData.joinedAt = new Date();
    } else if (status === "opted_out") {
      updateData.optedOut = true;
      updateData.optedOutAt = new Date();
    }

    const member = await Member.findByIdAndUpdate(
      memberId,
      updateData,
      { new: true }
    );

    if (!member) {
      throw new Error("Member not found");
    }

    return {
      success: true,
      member
    };

  } catch (error) {
    throw new Error(error.message);
  }
}


// Get member statistics for a group
async function getMemberStatsService(groupId) {
  try {
    if (!groupId) {
      throw new Error("Group ID is required");
    }

    const stats = await Member.aggregate([
      { $match: { groupId: new (require("mongoose")).Types.ObjectId(groupId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
          },
          invited: {
            $sum: { $cond: [{ $eq: ["$status", "invited"] }, 1, 0] }
          },
          joined: {
            $sum: { $cond: [{ $eq: ["$status", "joined"] }, 1, 0] }
          },
          optedOut: {
            $sum: { $cond: [{ $eq: ["$optedOut", true] }, 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0,
      pending: 0,
      invited: 0,
      joined: 0,
      optedOut: 0
    };

    return {
      success: true,
      stats: result
    };

  } catch (error) {
    throw new Error(error.message);
  }
}


module.exports = {
  addMemberService,
  addMembersService,
  getMembersService,
  getMemberByIdService,
  updateMemberStatusService,
  getMemberStatsService
};
