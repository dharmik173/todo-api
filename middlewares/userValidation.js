const validator = require('validator');

const userValidation = (req,res,next)=>{
    const { name, email, password } = req;

    if (typeof name !== 'string' || name.trim() === '') {
        throw new Error("Name is required and must be a string");
    }
    if (typeof email !== 'string' || email.trim() === '') {
        throw new Error("Email is required and must be a string");
    }
    if (typeof password !== 'string' || password.trim() === '') {
        throw new Error("Password is required and must be a string");
    }
    if (!validator.isEmail(email)) {
        throw new Error("Email must be valid");
    }
    if (!validator.isStrongPassword(password)) {
        throw new Error("Password must be strong");
    }

    return true;
}

module.exports = userValidation
