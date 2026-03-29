const express = require("express")

const authMiddleware = require("../middleware/auth.middleware");
const { createGroupController, getAllGroupsController, getGroupByIdController, getMembersController, addMembersController, removeGroupMemberController, uploadCSVController, generateInviteLinkController, deactivateGroupController } = require("../controllers/group.controller");
const upload = require("../config/multer");


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

router.post(
  "/:groupId/upload-csv", 
  upload.single("file"),  // ← Middleware: expect file named "file"
  uploadCSVController
);

// Generate invite link for group - POST /api/groups/:groupId/invite-link
router.post("/:groupId/invite-link", generateInviteLinkController);

// Deactivate group - PATCH /api/groups/:groupId/deactivate
router.patch("/:groupId/deactivate", deactivateGroupController);


module.exports = router;