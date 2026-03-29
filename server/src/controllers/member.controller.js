const fs = require("fs");
const Group = require("../models/group.model");
const Member = require("../models/member.model");
const {
  addMemberService,
  addMembersService,
  getMembersService,
  getMemberByIdService,
  updateMemberStatusService,
  getMemberStatsService
} = require("../services/member.service");
const { parseCSVForMembers } = require("../services/csv.service");


// Upload CSV to add members
async function uploadMembersCSVController(req, res) {
  try {
    const groupId = req.params.groupId;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    // Verify user owns the group
    const group = await Group.findById(groupId);
    if (!group) {
      fs.unlinkSync(req.file.path); // Delete file
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    if (group.adminId.toString() !== userId) {
      fs.unlinkSync(req.file.path); // Delete file
      return res.status(403).json({
        success: false,
        message: "Only admin can upload members"
      });
    }

    // Parse CSV
    const members = await parseCSVForMembers(req.file.path);

    if (members.length === 0) {
      fs.unlinkSync(req.file.path); // Delete file
      return res.status(400).json({
        success: false,
        message: "No valid members found in CSV"
      });
    }

    // Add members to database
    const batchId = `batch_${Date.now()}`;
    const result = await addMembersService(groupId, members, batchId);

    // Delete uploaded file
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      message: `Uploaded ${result.uploadedCount} members, ${result.failedCount} failed`,
      ...result
    });

  } catch (error) {
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        // File already deleted
      }
    }

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}


// Get all members of a group
async function getMembersController(req, res) {
  try {
    const groupId = req.params.groupId;
    const userId = req.user.id;

    // Verify group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    // Get members
    const result = await getMembersService(groupId);

    res.status(200).json({
      success: true,
      ...result
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}


// Get member statistics
async function getMemberStatsController(req, res) {
  try {
    const groupId = req.params.groupId;
    const userId = req.user.id;

    // Verify group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    const result = await getMemberStatsService(groupId);

    res.status(200).json({
      success: true,
      ...result
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}


// Update member status (for queue processing)
async function updateMemberStatusController(req, res) {
  try {
    const memberId = req.params.memberId;
    const { status } = req.body;
    const userId = req.user.id;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }

    // Verify member belongs to user's group
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found"
      });
    }

    const group = await Group.findById(member.groupId);
    if (group.adminId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const result = await updateMemberStatusService(memberId, status);

    res.status(200).json({
      success: true,
      ...result
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}


module.exports = {
  uploadMembersCSVController,
  getMembersController,
  getMemberStatsController,
  updateMemberStatusController
};
