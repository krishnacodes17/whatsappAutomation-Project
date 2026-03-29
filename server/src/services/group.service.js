const Group = require("../models/group.model");
const { generateInviteLink, buildFullInviteLink } = require("./inviteLink.service");

// create group
async function createGroupService(groupData) {
  const { name, description, userId } = groupData;

  const newGroup = new Group({
    name: name,
    description: description,
    adminId: userId,
    members: [
      {
        userId: userId,
        joinedAt: new Date(),
      },
    ],
  });

  const savedGroup = await newGroup.save();

  return savedGroup;
}

//  getgroup throught id
async function getGroupByIdService(groupId) {
  const group = await Group.findById(groupId)
    .populate("adminId", "name email")
    .populate("members.userId", "name email");

  if (!group) {
    throw new Error("Group not found");
  }

  return group;
}

//  getAllGroupsService
async function getAllGroupsService(userId) {
  const groups = await Group.find({ "members.userId": userId })
    .populate("adminId", "name email")
    .select("name description adminId members createdAt");

  return groups;
}

// addMembersService - add multiple members(only admin)
async function addMembersService(groupId, memberIds, userId) {
  const group = await Group.findById(groupId);

  if (!group) {
    throw new Error("Group not found");
  }

  //  check if user is admin
  if (group.adminId.toString() !== userId.toString()) {
    throw new Error("Only admin can add member");
  }

  // Get existing member IDs to prevent duplicates
  const existingUserIds = group.members.map((m) => m.userId.toString());

  // Filter out members that already exist
  const newMembers = memberIds
    .filter((memberId) => !existingUserIds.includes(memberId.toString()))
    .map((memberId) => ({
      userId: memberId,
      joinedAt: new Date(),
    }));

  // Add new members to group
  group.members.push(...newMembers);

  // Save and return
  const updatedGroup = await group.save();

  return updatedGroup;
}



// Get members of a group
async function getMembersService(groupId) {
  const group = await Group.findById(groupId).populate(
    "members.userId",
    "name email"
  );

  if (!group) {
    throw new Error("Group not found");
  }

  return group.members;
}

// Remove member from group (only admin)
async function removeGroupMemberService(groupId, memberId, userId) {
  const group = await Group.findById(groupId);

  if (!group) {
    throw new Error("Group not found");
  }

  // Check if user is admin
  if (group.adminId.toString() !== userId.toString()) {
    throw new Error("Only admin can remove members");
  }

  // Remove member from array
  group.members = group.members.filter(
    (m) => m.userId.toString() !== memberId.toString()
  );

  // Save and return
  const updatedGroup = await group.save();

  return updatedGroup;
}


// Generate invite link for group
async function generateInviteLinkService(groupId, userId) {
  const group = await Group.findById(groupId);

  if (!group) {
    throw new Error("Group not found");
  }

  // Check if user is admin
  if (group.adminId.toString() !== userId.toString()) {
    throw new Error("Only admin can generate invite link");
  }

  // Generate new invite link
  const inviteCode = generateInviteLink();
  const fullLink = buildFullInviteLink(inviteCode);

  // Update group
  group.inviteLink = inviteCode;
  group.inviteLinkGeneratedAt = new Date();
  await group.save();

  return {
    groupId: group._id,
    inviteCode,
    inviteLink: fullLink,
    generatedAt: group.inviteLinkGeneratedAt
  };
}


// Deactivate group (only admin)
async function deactivateGroupService(groupId, userId) {
  const group = await Group.findById(groupId);

  if (!group) {
    throw new Error("Group not found");
  }

  // Check if user is admin
  if (group.adminId.toString() !== userId.toString()) {
    throw new Error("Only admin can deactivate group");
  }

  // Check if already inactive
  if (!group.isActive) {
    throw new Error("Group is already inactive");
  }

  // Deactivate
  group.isActive = false;
  await group.save();

  return group;
}


module.exports = {
  createGroupService,
  getGroupByIdService,
  getAllGroupsService,
  addMembersService,
  getMembersService,
  removeGroupMemberService,
  generateInviteLinkService,
  deactivateGroupService
};
