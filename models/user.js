const mongoose = require("mongoose");
// const { isLowercase } = require("validator");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Make name required
  },
  email: {
    type: String,
    unique: true,
    required: true, // Make email required
    match: /.+\@.+\..+/ ,// Simple email validation
    set: (value) => value.toLowerCase()
  },
  password: {
    type: String,
    required: true, // Make password required
  },
  status: {
    type: String,
    enum: ["not verified", "verified"],
    default: "not verified", 
},
  userVerificationCode:Number,
  userVerificationCodeExpiry:Date,
  resendOtpCount: { type: Number, default: 0 },
  resendOtpCountExpiry: Date,
},{timestamps:true});

module.exports = mongoose.model("User", userSchema);