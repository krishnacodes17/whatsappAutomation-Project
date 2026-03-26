const express = require("express")
const { registerUserController } = require("../controllers/auth.controller")

const authrouter = express.Router()



authrouter.post("/register", registerUserController)



module.exports = authrouter