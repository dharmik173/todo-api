const validateOTP =  (otp, userDetails) => {
    // Check if OTP is a 6-digit number
    if (!/^\d{6}$/.test(otp)) {
      throw new Error('Invalid OTP format. OTP must be a 6-digit number.');
    }
  
    // Check if the OTP matches the one stored in the database
    if (userDetails.userVerificationCode !== parseInt(otp)) {
      throw new Error('OTP does not match.');
    }
  
    // Check if the OTP is expired
    if (Date.now() > userDetails.userVerificationCodeExpiry) {
      throw new Error('OTP has expired.');
    }
  
    // If all checks pass, return true
    return true;
  };

module.exports = validateOTP
