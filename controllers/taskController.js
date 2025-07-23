

const Task = require('../models').Task; // Assuming you have a Task model defined
const createTask = async (req, res) => {

    const { title, description, priority, dueDate, userId } = req.body;
    try {
        // Validate required fields
        if (!title || !description || !priority || !dueDate || !userId) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // Create a new task object
        const newTask = await Task.create({
            title,
            description,
            priority,
            dueDate,
            userId

        });
        res.status(201).json({ message: "Task created successfully", task: newTask });
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
//get user tasks 
const getUserTasks = async (req,res)=> {
    const userId = req.params.userId;
    try {
        const tasks = await Task.findAll({
            where: {userId: userId},
            order: [['dueDate', 'ASC']] // Optional: Order tasks by due date
        });
        res.status(200).json({ tasks });
    } catch (error) {
        console.error("Error fetching user tasks:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
//Update a task 
   const updateTask = async(req,res)=> {
    const taskID = req.params.taskID;
    const {title,description,priority,dueDate} = req.body;
    try {
        //Va;idate required fields
        if (!title || !description || !priority || !dueDate) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // Find the task by ID
        const task = await Task.findByPk(taskID);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        // Update the task
        task.title=title;
        task.description=description;
        task.priority=priority;
        task.dueDate=dueDate;
        await task.save();
        res.status(200).json({ message: "Task updated successfully", task });
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
//delete a task
const deleteTask = async(req,res)=> {
    const taskID = req.params.taskID;
    try {
        // Find the task by ID
        const task = await Task.findByPk(taskID);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        // Delete the task
        await task.destroy();
        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
//toggle task completion status
const toggleTask = async (req, res) => {
    const  id  = req.params.taskID; // Get task ID from URL
    
    try {
        // Find the task
        const task = await Task.findByPk(id);
        if (!task) {
            console.log("Task not found with ID:", id);
            return res.status(404).json({ message: "Task not found" });
        }
        
        // Toggle the completed status
        task.completed = !task.completed; // Switch true to false or false to true
        await task.save();
        
        res.json({ 
            message: "Task toggled successfully", 
            task: task 
        });
    } catch (error) {
        console.error("Error toggling task:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
const getSingleTask = async(req, res) => {
    const taskID = req.params.taskID;
    try {
        // Find the task by ID
        const task = await Task.findByPk(taskID);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.status(200).json({ task });
    } catch (error) {
        console.error("Error fetching task:", error);
        res.status(500).json({ message: "Internal server error" });
    }


};

module.exports = {
    createTask,
    getUserTasks,
    updateTask,
    getSingleTask,
    deleteTask,
    toggleTask
}