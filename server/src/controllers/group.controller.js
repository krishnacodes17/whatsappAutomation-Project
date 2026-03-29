const {parseCSVFile, parseCSVForMembers, getUserIdsFromEmails} = require("../services/csv.service")
const fs = require("fs")
const Group = require("../models/group.model");

const {
  createGroupService,
  getGroupByIdService,
  getAllGroupsService,
  addMembersService,
  getMembersService,
  removeGroupMemberService,
  generateInviteLinkService,
  deactivateGroupService,
} = require("../services/group.service");

const {
  addMembersService: addMembersToMemberModel,
} = require("../services/member.service");

async function createGroupController(req, res) {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    const groupData = {
      name,
      description,
      userId,
    };

    const newGroup = await createGroupService(groupData);

    res.status(201).json({
      success: true,
      message: "Group created successfully",
      data: newGroup,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// Get group by ID with members
async function getGroupByIdController(req, res) {
  try {
    const { groupId } = req.params;

    const group = await getGroupByIdService(groupId);

    res.status(200).json({
      success: true,
      message: "Group fetched successfully",
      data: group,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// Get all groups for user
async function getAllGroupsController(req, res) {
  try {
    const userId = req.user.id;

    const groups = await getAllGroupsService(userId);

    res.status(200).json({
      success: true,
      message: "Groups fetched successfully",
      data: groups,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// Add members to group (admin only)
async function addMembersController(req, res) {
  try {
    const { groupId } = req.params;
    const { memberIds } = req.body;
    const userId = req.user.id;

    const updatedGroup = await addMembersService(groupId, memberIds, userId);

    res.status(200).json({
      success: true,
      message: "Members added successfully",
      data: updatedGroup,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// Get members of group
async function getMembersController(req, res) {
  try {
    const { groupId } = req.params;

    const members = await getMembersService(groupId);

    res.status(200).json({
      success: true,
      message: "Members fetched successfully",
      data: members,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// Remove member from group (admin only)
async function removeGroupMemberController(req, res) {
  try {
    const { groupId, memberId } = req.params;
    const userId = req.user.id;

    const updatedGroup = await removeGroupMemberService(
      groupId,
      memberId,
      userId,
    );

    res.status(200).json({
      success: true,
      message: "Member removed successfully",
      data: updatedGroup,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}



async function uploadCSVController(req, res) {
  try {
    const { groupId } = req.params;
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
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    if (group.adminId.toString() !== userId) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({
        success: false,
        message: "Only admin can upload members"
      });
    }

    // Parse CSV file for members (phone, desiredName)
    const members = await parseCSVForMembers(req.file.path);

    if (members.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: "No valid members found in CSV. CSV should have columns: phone, desiredName"
      });
    }

    // Add members to Member model (not Group.members)
    const batchId = `batch_${Date.now()}`;
    const result = await addMembersToMemberModel(groupId, members, batchId);

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


// Generate invite link for group (admin only)
async function generateInviteLinkController(req, res) {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const result = await generateInviteLinkService(groupId, userId);

    res.status(200).json({
      success: true,
      message: "Invite link generated successfully",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}


// Deactivate group (admin only)
async function deactivateGroupController(req, res) {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const updatedGroup = await deactivateGroupService(groupId, userId);

    res.status(200).json({
      success: true,
      message: "Group deactivated successfully",
      data: updatedGroup
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}






module.exports = {
  createGroupController,
  getGroupByIdController,
  getAllGroupsController,
  addMembersController,
  getMembersController,
  removeGroupMemberController,
  uploadCSVController,
  generateInviteLinkController,
  deactivateGroupController
};
