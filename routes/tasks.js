const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const tokenValidation = require('../middleware/auth')

// Route to create a new task
router.post('/tasks', tokenValidation, taskController.createTask);
//get user tasks
router.get('/tasks/:userId', tokenValidation, taskController.getUserTasks);
// Route to update a task
router.put('/tasks/:taskID', tokenValidation,  taskController.updateTask);
// Route to delete a task
router.delete('/tasks/:taskID', tokenValidation, taskController.deleteTask);
//route to toggle task completion
router.patch('/tasks/:taskID/toggle', tokenValidation, taskController.toggleTask);
// Route to get a single task by ID
router.get('/tasks/single/:taskID', tokenValidation, taskController.getSingleTask);
module.exports = router;
