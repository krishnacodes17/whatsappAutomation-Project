const express = require("express")
const cookieParser = require("cookie-parser")
const app = express()


app.use(express.json())
app.use(cookieParser())


const authRouter = require("./router/auth.routers")
const groupRouter = require("./router/group.router")
const messageRouter = require("./routers/message.router");
const memberRouter = require("./router/member.router");


app.use("/api/auth",authRouter)
app.use("/api/groups",groupRouter)
app.use("/api/messages", messageRouter);
app.use("/api/members", memberRouter);





module.exports = app