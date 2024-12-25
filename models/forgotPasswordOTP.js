const mongoose = require('mongoose');

const forgotPasswordOTPSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  otp: {
    type: Number,
    required: true,
  },
  expiry: {
    type: Date,
    required: true,
  },
}, { timestamps: true }); // Adds createdAt and updatedAt fields

const ForgotPasswordOTP = mongoose.model('ForgotPasswordOTP', forgotPasswordOTPSchema);

module.exports = ForgotPasswordOTP;
