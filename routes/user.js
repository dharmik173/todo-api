const express = require("express")
const userRoute = express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const User = require("../models/user")
const validator = require('validator');


const userAuth = require("../middlewares/auth")
const userValidation = require("../middlewares/userValidation");
const { sendPasswordResetEmail } = require("../utils/mail");
const { Error } = require("mongoose");
const validateOTP = require("../helpers/validateOtp");
const { RESEND_EXPIRY_HOURS, MAX_RESEND_ATTEMPTS } = require("../utils/constants");
const ForgotPasswordOTP = require("../models/forgotPasswordOTP");
const { forgotPasswordEmail } = require("../utils/forgotPasswordMail");



// SIGNUP API - CREATING NEW USER
userRoute.post('/signup',async(req,res)=>{
    try {
        // CHECKING USER MAIL AND PASSWORD IS VALID OR NOT
        userValidation(req.body)

        // CONVERTING PASSWORD INTO HASH
        const userPassword = req.body.password
        const hashPassword = await bcrypt.hash(userPassword,10)

        // create new code and save in user model and set 1 day code expiry
        const CURRENT_DATE = new Date();
        const USER_VERIFICATION_CODE =  Math.floor(100000 + Math.random() * 900000);
        const USER_VERIFICATION_CODE_EXPIRY = new Date(CURRENT_DATE.getTime() + 24 * 60 * 60 * 1000);

        let userData = req.body
        userData.password =hashPassword
        userData.userVerificationCode=USER_VERIFICATION_CODE
        userData.userVerificationCodeExpiry=USER_VERIFICATION_CODE_EXPIRY

        const saveUserInDb = await User(userData)
       const userAdded = await saveUserInDb.save()
       if(userAdded){
        sendPasswordResetEmail(userAdded.email,userAdded.userVerificationCode)
       }

        res.json({message:"User Added Successfully",})
    } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            res.status(400).json({ message: "Email is already in use. Please use a different email." });
        } else {
            res.status(400).json({ message: "Something went wrong: " + error.message });
        }
       }
})

userRoute.post('/login',userAuth,async(req,res)=>{
    try {
        // (req.body)
        const user = req.user
        if(user.status ==="verified"){
            delete user.userVerificationCode
        }
        
        let token = jwt.sign({user}, process.env.JWT_SECRET);

        // res.cookie("token",token,{ expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) })
        res.json({message:"login Successfully",token,user})
    } catch (error) {
        res.status(401).json({
            message: "Something went wrong: " + error.message,
            statusCode: 401
          });
    }
})


userRoute.put('/verify',async(req,res)=>{
try {
    // const id = req.params.id;
    const {verificationCode,email} = req.body

    // finding user 
    const findUserDetails = await User.findOne({email})
    if(!findUserDetails){
        throw new Error("please enter correct data")
    }

    if(findUserDetails.status==="verified"){
        return res.status(200).json({ message: "User already verified" });
    }

    // validating user
    const isValidOTP = validateOTP(verificationCode,findUserDetails)
    if(!isValidOTP){
        throw new Error("something went wrong")
    }

    // changing user status - from not verified to verified
    const userStatus = "verified"
    findUserDetails.status = userStatus
    findUserDetails.userVerificationCodeExpiry = new Date()
    await findUserDetails.save()

    res.json({message:"Verification Done"})
} catch (error) {
    res.status(401).json({
        message: "Something went wrong: " + error.message,
        statusCode: 401
      });
    
}
})

userRoute.post('/resend-otp',async(req,res)=>{
    try {
        const email=req.body.email

    // finding user 
    const findUserDetails = await User.findOne({email})
    if(!findUserDetails){
        throw new Error("please enter correct data")
    }

    if (findUserDetails.resendOtpCount >= MAX_RESEND_ATTEMPTS) {
        if (findUserDetails.resendOtpCountExpiry && new Date() < findUserDetails.resendOtpCountExpiry) {
          // Still within the block period
          return res.status(429).json({
            message: `You have reached the maximum resend attempts. Please try again after ${RESEND_EXPIRY_HOURS} hours.`,
          });
        } else {
          // Reset the count and expiry since block period has passed
          findUserDetails.resendOtpCount = 0;
          findUserDetails.resendOtpCountExpiry = null;
        }
      }


    if (!findUserDetails.resendOtpCountExpiry) {
        findUserDetails.resendOtpCountExpiry = new Date(Date.now() + RESEND_EXPIRY_HOURS * 60 * 60 * 1000);
      }

        const CURRENT_DATE = new Date();
        const USER_VERIFICATION_CODE =  Math.floor(100000 + Math.random() * 900000);
        const USER_VERIFICATION_CODE_EXPIRY = new Date(CURRENT_DATE.getTime() + 24 * 60 * 60 * 1000);
    // adding new otp in user
    findUserDetails.resendOtpCount += 1;
    findUserDetails.userVerificationCode=USER_VERIFICATION_CODE
    findUserDetails.userVerificationCodeExpiry=USER_VERIFICATION_CODE_EXPIRY

    await findUserDetails.save()

    // sending mail to user
    sendPasswordResetEmail(findUserDetails.email,findUserDetails.userVerificationCode)
    res.json({message:"OTP resent successfully"})
    } catch (error) {
        res.status(400).json({
        message: "Something went wrong: " + error.message
      });
    }
})

userRoute.post('/forgot-password/send-otp',async(req,res)=>{
    try {
        const email = req.body.email
        if (!validator.isEmail(email)) {
            throw new Error("Email must be valid");
        }

        const findUser = await User.findOne({email})
        if(!findUser){
            throw new Error("please register first")
        }

        const CURRENT_DATE = new Date();
        const USER_VERIFICATION_CODE =  Math.floor(100000 + Math.random() * 900000);
        const USER_VERIFICATION_CODE_EXPIRY = new Date(CURRENT_DATE.getTime() + 30 * 60 * 1000);

            const otpData = {
                userId:findUser._id,
                otp:USER_VERIFICATION_CODE,
                expiry:USER_VERIFICATION_CODE_EXPIRY
            }

            // checking if entry already there updating the otp with expiry
            const isUserEntryExits = await ForgotPasswordOTP.findOne({userId:findUser._id})
            if(!isUserEntryExits){
                const newOtpData = await ForgotPasswordOTP(otpData)
                await newOtpData.save()
                forgotPasswordEmail(email,newOtpData.otp)
            }else{
                isUserEntryExits.otp = USER_VERIFICATION_CODE
                isUserEntryExits.expiry = USER_VERIFICATION_CODE_EXPIRY
                await isUserEntryExits.save()
                forgotPasswordEmail(email,isUserEntryExits.otp)
            }

            res.json({message:"mail send successfully"})
    } catch (error) {
        res.status(400).json({
        message: "Something went wrong: " + error.message
      });
    }
})

userRoute.post('/forgot-password/verify-otp',async(req,res)=>{
    try {
        const {email,otp,password}=req.body

        if(!email || !otp || !password){
            throw new Error("all field is required");
        }

        if (!validator.isStrongPassword(password)) {
            throw new Error("Password must be strong");
        }
        if (!/^\d{6}$/.test(otp)) {
            throw new Error('Invalid OTP format. OTP must be a 6-digit number.');
          }
          if (!validator.isEmail(email)) {
            throw new Error("Email must be valid");
        }

        const findUser = await User.findOne({email})
            if(!findUser){
                throw new Error("Invalid Data")
            }

            const findOtp = await ForgotPasswordOTP.findOne({userId:findUser._id})
            if(!findOtp){
                throw new Error("otp is expired")
            }
            if(findOtp.otp !== parseInt(otp) || new Date() > findOtp.expiry){
                throw new Error("otp is wrong")
            }

            const hashPassword = await bcrypt.hash(password,10)

            findUser.password =hashPassword
            await findUser.save()

            const deleteOtpEntry = await ForgotPasswordOTP.deleteOne({userId:findUser._id})

        res.json({message:"password changed successfully"})

    } catch (error) {
        res.status(400).json({
        message: "Something went wrong: " + error.message
      });
    }
})



userRoute.get('/logout',(req,res)=>{
    try {
        res.clearCookie('token')

        res.json({ message: "Logout successful" });
    } catch (error) {
        res.status(400).send("something went wrong : "+error.message);
        
    }
})



module.exports = userRoute