const express = require("express")
const { registerUserController, loginUserController } = require("../controllers/auth.controller")

const authrouter = express.Router()



authrouter.post("/register", registerUserController)
authrouter.post("/login" , loginUserController)


module.exports = authrouter