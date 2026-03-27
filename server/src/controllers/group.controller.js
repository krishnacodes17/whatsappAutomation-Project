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

module.exports = {
  createGroupController,
  getGroupByIdController,
  getAllGroupsController,
  addMembersController,
  getMembersController,
  removeGroupMemberController,
};
