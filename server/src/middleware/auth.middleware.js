const { verify } = require("jsonwebtoken")
const { verifyToken } = require("../services/token.service")



async function authMiddleware(req,res,next) {
    try {
        const token = req.cookies.accessToken

        if(!token){
            return res.status(401).json({
                success:false,
                message:"No token Provided"
            })
        }

        const decoded = verifyToken(token);
        req.user = decoded
        next()


    } catch (error) {
        res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
    }
}

module.exports = authMiddleware