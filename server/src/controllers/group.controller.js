const {parseCSVFile , getUserIdsFromEmails} = require("../services/csv.service")
const fs = require("fs")

const {
  createGroupService,
  getGroupByIdService,
  getAllGroupsService,
  addMembersService,
  getMembersService,
  removeGroupMemberService,
} = require("../services/group.service");

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

    // Parse CSV file
    const emails = await parseCSVFile(req.file.path);

    // Get user IDs from emails
    const memberIds = await getUserIdsFromEmails(emails);

    if (memberIds.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No matching users found in CSV"
      });
    }

    // Add members to group
    const updatedGroup = await addMembersService(
      groupId,
      memberIds,
      userId
    );

    // Delete uploaded file after processing
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      message: `Successfully added ${memberIds.length} members`,
      data: updatedGroup
    });
  } catch (error) {
    // Delete file on error
    if (req.file) fs.unlinkSync(req.file.path);
    
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
  uploadCSVController
};
