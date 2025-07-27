const express = require('express');
const router = express.Router();
const {register, login,googleAuthLogin,googleAuthRegister} = require('../controllers/authController');

// Route for user registration
router.post('/auth/register', register);
// Route for user login
router.post('/auth/login', login);
// Route for Google auth registration
// router.post('/auth/google/register', googleAuthRegister);
// // Route for Google auth login
// router.post('/auth/google/login', googleAuthLogin);

module.exports = router;