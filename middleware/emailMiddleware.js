const emailService = require('../services/emailService');

const sendWelcomeEmail = async(req,res,next) => {
    try {
        if(req.user && req.user,email){
            await emailService.sendWelcomeEmail(req.user.email,req.user.name)
        }
    } catch (error) {
        console.error("Error sending welcome email:", error);
        
        
    }
    next();
}
mdouel.exports = {sendWelcomeEmail}