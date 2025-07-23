const jwt = require("jsonwebtoken");
const Jwt_Secret= "my-secret-key"
const tokenValidation = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) {
        return res.status(401).json({ message: "Authorization token required" });
    }
    try {
        // First extract the token
        const bearer = token.split(" ")[1];
        // Verify the token with the jwt secret
        const verified = jwt.verify(bearer, Jwt_Secret);
        
        // Debug log to see what's in the token
        console.log('Decoded token:', verified);
        
        req.user = verified;
        next();
    } catch (error) {
        console.log('Token verification error:', error);
        return res.status(401).json({ message: "Invalid Token" });
    }
};
module.exports = tokenValidation;