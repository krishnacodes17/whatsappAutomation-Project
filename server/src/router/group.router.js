const express = require("express")

const authMiddleware = require("../middleware/auth.middleware");
const { createGroupController, getAllGroupsController, getGroupByIdController, getMembersController, addMembersController, removeGroupMemberController } = require("../controllers/group.controller");


const router = express.Router();


//  all routes protected with authmiddleware
router.use(authMiddleware)



// Create group - POST /api/groups/create
router.post("/create",createGroupController)

// Get all groups for user - GET /api/groups
router.get("/", getAllGroupsController);

// Get single group - GET /api/groups/:groupId
router.get("/:groupId", getGroupByIdController);

// Get members of group - GET /api/groups/:groupId/members
router.get("/:groupId/members", getMembersController);

// Add members to group - POST /api/groups/:groupId/add-members
router.post("/:groupId/add-members", addMembersController);

// Remove member from group - DELETE /api/groups/:groupId/member/:memberId
router.delete("/:groupId/member/:memberId", removeGroupMemberController);

module.exports = router;