const express = require("express")
const { registerUserController, loginUserController, logoutUserController, forgotPasswordController, resetPasswordController } = require("../controllers/auth.controller")

const authrouter = express.Router()



authrouter.post("/register", registerUserController)
authrouter.post("/login" , loginUserController)
authrouter.post("/logout" , logoutUserController)
authrouter.post("/forgot-password", forgotPasswordController)
authrouter.post("/reset-password", resetPasswordController)


module.exports = authrouter