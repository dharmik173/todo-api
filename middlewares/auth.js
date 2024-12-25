const validator = require('validator');
const bcrypt = require("bcrypt");

const User = require("../models/user")

const userAuth = async(req,res,next)=>{

    try {
    const {  email, password } = req.body;

    if (typeof email !== 'string' || email.trim() === '') {
        throw new Error("Email is required and must be a string");
    }
    if (typeof password !== 'string' || password.trim() === '') {
        throw new Error("Password is required and must be a string");
    }
    if (!validator.isEmail(email)) {
        throw new Error("Invalid Data");
    }
    if (!validator.isStrongPassword(password)) {
        throw new Error("Invalid Data");
    }
        // first find the user in db from Email
        const user = await User.findOne({email})
        if(!user){
            throw new Error("please enter valid data")
        }

        // match user password with bcrypt.compare method
        const userValidation = await bcrypt.compare(password,user.password)
        if(!userValidation){
            throw new Error("please enter valid data")
        }
        const userWithoutPassword = user.toObject();

        delete userWithoutPassword.password;
        req.user = userWithoutPassword

        next()
    } catch (error) {
        res.status(401).json({
            message: "Something went wrong: " + error.message,
            statusCode: 401
          });
    }
}

module.exports = userAuth
