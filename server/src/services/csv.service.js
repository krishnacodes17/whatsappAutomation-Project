const fs = require("fs")
const csv = require("csv-parser")
const User= require("../models/User")

async function parseCSVFile(filePath) {
    const results = []

    return new Promise((resolve,reject)=>{
        fs.createReadStream(filePath)
        .pipe(csv())
        .on("data",(data)=>{
            if(data.email){
                results.push(data.email)
            }          
        })
        .on("end",()=>{
            resolve(results)
        })
        .on("error",(error)=>{
            reject(error)
        })
    })
}


async function getUserIdsFromEmails(emails) {
    const users = await User.find({email:{$in: emails}}).select("_id");
    return users.map((user)=> user._id)
}


module.exports = {
    parseCSVFile,
    getUserIdsFromEmails
}