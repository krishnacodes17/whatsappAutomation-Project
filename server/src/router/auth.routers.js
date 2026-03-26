const express = require("express")
const { registerUserController, loginUserController, logoutUserController } = require("../controllers/auth.controller")

const authrouter = express.Router()



authrouter.post("/register", registerUserController)
authrouter.post("/login" , loginUserController)
authrouter.post("/logout" , logoutUserController)


module.exports = authrouter