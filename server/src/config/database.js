const mongoose = require("mongoose")


async function connectDB() {
    try {
        const conn = mongoose.connect(process.env.MONGODB_URI)
        console.log(`MongoDB Connected: `)
        return conn
    } catch (error) {
        console.log(error.message)
        process.exit(1)
    }
}


module.exports = connectDB