const { boolean } = require("joi");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    require: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please provide a valid email",
    ],
  },

  password:{
    type:String,
    require:[true , "Password is require"],
    minlength:6,
    select:true
  },

  firstName:{
    type:String,
    trim:true
  },

  lastName:{
    type:String,
    trim:true
  },

  isActive:{
    type:Boolean,
    default:true
  },

  role:{
    type:String,
    enum:["admin", "user"],
    default:"user"
  },

  lastLogin:{
    type:Date
  },

  resetToken: {
    type: String,
    default: null,
    select: false
  },

  resetTokenExpires: {
    type: Date,
    default: null,
    select: false
  },

  createdAt:{
    type:Date,
    default:Date.now
  },

  updatedAt:{
    type:Date,
    default:Date.now
  }

},{timestamps:true});


module.exports = mongoose.model("User" , userSchema)