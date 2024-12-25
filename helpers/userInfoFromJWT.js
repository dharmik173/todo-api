const jwt = require('jsonwebtoken');


const userInfoFromJWT = async(req,res,next)=>{
    try {
        const token = req.headers['authorization']?.split("Bearer ")?.[1]

        if(!token){
            throw new Error("please login first")
        }
        const userDataFromToken = await jwt.verify(token,process.env.JWT_SECRET)
        req.userDataFromToken = userDataFromToken
        next()
    } catch (error) {
        res.status(401).json({"message": `${error.message}`,statusCode:401});
    }
}

module.exports = userInfoFromJWT