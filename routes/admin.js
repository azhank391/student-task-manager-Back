// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const isAdmin = require('../middleware/admin');
const tokenValidation = require('../middleware/auth');

router.get('/users', tokenValidation, isAdmin, adminController.getAllUsers);
router.get('/stats', tokenValidation, isAdmin, adminController.getPlatformStats);
router.get('/users/:id/tasks', tokenValidation, isAdmin, adminController.getUserTasks);
router.post('/createAdmin', tokenValidation, isAdmin, adminController.addAnotherAdmin);

module.exports = router;
