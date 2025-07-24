const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models').User;
const jwtSecret = process.env.JWT_SECRET
const {OAuth2Client} = require('google-auth-library')
const emailService = require('../services/emailService')
//register function to handle user registration
//it checks if the user already exists, hashes the password, and creates a new user in
const register = async (req, res) => {
    const {name,email,password} = req.body;
    try {
        //check if user already exists 
        const existingUser = await User.findOne({where:{email}});
        if (existingUser) {
            return res.status(400).json({message: "User already exists"});
        }
        //hash the password
        const hashedPassword = await bcrypt.hash(password,10);
        //create new user
        const newUser = await User.create({
            name,
            email,
            password:hashedPassword,
        });
        try {
            //send welcome email 
            await emailService.sendWelcomeEmail(newUser.email, newUser.name)
        }  catch(emailerror) {
          console.error("Error Sending Welcome Email:", emailerror);
        } 
        return res.status(201).json({
            message: "User registered successfully",
            user: newUser
        })
        
    }
    catch(error) {
            console.error("Error during registration:", error);
            return res.status(500).json({message: "Internal server error"});
        }
    }
//login function to handle user login
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (!existingUser) {
      return res.status(400).json({ message: "User does not exist" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ Include isAdmin in the token payload
    const authToken = jwt.sign({
      id: existingUser.id,
      email: existingUser.email,
      isAdmin: existingUser.isAdmin   // <-- important!
    }, jwtSecret, { expiresIn: '1h' });

    // ✅ Also include isAdmin in user response
    const userData = {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      isAdmin: existingUser.isAdmin   // <-- for frontend if needed
    };

    res.status(200).json({
      message: "Login successful",
      token: authToken,
      user: userData,
      role: existingUser.isAdmin ? "admin" : "user" // <-- role for frontend
    });
    //send welcome email
    try {
      await emailService.sendWelcomeEmail(existingUser.email, existingUser.name);
    } catch (error) {
      console.error("Error sending welcome email:", error);
    }
  } catch (error) {
    console.log("Error during login:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
//register using the google auth that will be coming from the frontend
//this function will handle the registration of the user using google auth
const googleAuthRegister = async (req,res)=> {
  const {tokenId}= req.body;
  try {
    // Verify the token with Google
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const { email, name } = payload;

    //check if user already exists 
    const existingUser = await User.findOne({where:{email}});
    if (existingUser) {
        return res.status(400).json({message: "User already exists"});
    }
    //create new user
    const newUser = await User.create({
        name,
        email,
        password: null, // No password for Google auth
    });
    // Generate JWT token
    const authToken = jwt.sign({
      id: newUser.id,
      email: newUser.email,
      isAdmin: newUser.isAdmin
    }, jwtSecret, { expiresIn: '1h' });
    return res.status(201).json({
        message: "User registered successfully",
        token: authToken,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          isAdmin: newUser.isAdmin
        }
    });
  } catch (error) {
    console.error("Error during Google auth registration:", error);
    return res.status(500).json({ message: "Internal server error" });
  }


}
//google auth login function to handle user login
const googleAuthLogin = async (req, res) => {
  const { tokenId  } = req.body;
  try {
    // Verify the token with Google
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    let payload = ticket.getPayload();
    const { email, name } = payload;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (!existingUser) {
      //auto-register the user if they don't exist
      existingUser = await User.create({
        name,
        email,
        password: null
      });
    }

    // Generate JWT token
    const authToken = jwt.sign({
      id: existingUser.id,
      email: existingUser.email,
      isAdmin: existingUser.isAdmin
    }, jwtSecret, { expiresIn: '1h' });

    res.status(200).json({
      message: "Login successful",
      token: authToken,
      user: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        isAdmin: existingUser.isAdmin
      }
    });
  } catch (error) {
    console.log("Error during Google auth login:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

//exporting the register and login functions
module.exports = {
    register,
    login,
    googleAuthRegister,
    googleAuthLogin
}