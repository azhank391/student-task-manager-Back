// controllers/adminController.js
const {Sequelize}=require('sequelize');
const { User, Task } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const adminController = {
  // GET /api/admin/users
  getAllUsers: async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const where = search
      ? {
          [Op.or]: [
            { username: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { firstName: { [Op.like]: `%${search}%` } },
            { lastName: { [Op.like]: `%${search}%` } }
          ]
        }
      : {};

    const { rows: users, count: totalUsers } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Add task counts for each user
    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        const taskCount = await Task.count({ where: { userId: user.id } });
        const completedTasks = await Task.count({ where: { userId: user.id, completed: true } });

        return {
          ...user.toJSON(),
          taskCount,
          completedTasks
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        users: usersWithCounts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalUsers / limit),
          totalUsers,
          hasNextPage: page < Math.ceil(totalUsers / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching users' });
  }
},
  // GET /api/admin/stats
  // getPlatformStats: async (req, res) => {
  //   try {
  //     const totalUsers = await User.count();
  //     const totalTasks = await Task.count();
  //     const totalAdmins = await User.count({ where: { isAdmin: true } });

  //     const thirtyDaysAgo = new Date();
  //     thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  //     const newUsersLastMonth = await User.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } });
  //     const newTasksLastMonth = await Task.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } });

  //     const tasksByStatus = await Task.findAll({
  //       attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('completed')), 'count']],
  //       group: ['status']
  //     });

  //     const userTrends = await User.findAll({
  //       attributes: [
  //         [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'date'],
  //         [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
  //       ],
  //       where: { createdAt: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
  //       group: ['date'],
  //       order: [['date', 'ASC']]
  //     });

  //     res.status(200).json({
  //       success: true,
  //       data: {
  //         overview: { totalUsers, totalTasks, totalAdmins, newUsersLastMonth, newTasksLastMonth },
  //         tasksByStatus: tasksByStatus.reduce((acc, item) => {
  //           acc[item.status] = parseInt(item.dataValues.count);
  //           return acc;
  //         }, {}),
  //         userRegistrationTrends: userTrends.map(entry => ({
  //           date: entry.dataValues.date,
  //           count: parseInt(entry.dataValues.count)
  //         }))
  //       }
  //     });
  //   } catch (error) {
  //     console.error('Stats error:', error);
  //     res.status(500).json({ success: false, message: 'Server error while fetching stats' });
  //   }
  // },
// GET /api/admin/stats
getPlatformStats: async (req, res) => {
  try {
    // Total counts
    const totalUsers = await User.count();
    const totalTasks = await Task.count();

    // Task completion breakdown
    const completedTasks = await Task.count({ where: { completed: true } });
    const pendingTasks = await Task.count({ where: { completed: false } });

    // Optional: New users and tasks in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsersLastMonth = await User.count({
      where: { createdAt: { [Op.gte]: thirtyDaysAgo } }
    });

    const newTasksLastMonth = await Task.count({
      where: { createdAt: { [Op.gte]: thirtyDaysAgo } }
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalTasks,
        completedTasks,
        pendingTasks,
        newUsersLastMonth,
        newTasksLastMonth
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching stats' });
  }
},


  // GET /api/admin/users/:id/tasks
  getUserTasks: async (req, res) => {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10, status = '' } = req.query;
      const offset = (page - 1) * limit;

      const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const where = { userId: id };
      if (status) where.status = status;

      const { rows: tasks, count: totalTasks } = await Task.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.status(200).json({
        success: true,
        data: {
          user,
          tasks,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalTasks / limit),
            totalTasks,
            hasNextPage: page < Math.ceil(totalTasks / limit),
            hasPrevPage: page > 1
          }
        }
      });
    } catch (error) {
      console.error('User tasks error:', error);
      res.status(500).json({ success: false, message: 'Server error while fetching user tasks' });
    }
  },
  addAnotherAdmin: async (req,res) => {
    try {
      const {adminName,adminEmail,adminPassword,confirmPassword} = req.body;
      if (!adminName || !adminEmail || !adminPassword || !confirmPassword) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
      }
      if (adminPassword !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Passwords do not match' });
      }
      const existingAdmin = await User.findOne({ where: { email: adminEmail } });
      if (existingAdmin) { 
        return res.status(400).json({ success: false, message: 'Admin with this email already exists' });
      }
      //hash the password
      const hashedpassword = await bcrypt.hash(adminPassword, 10);

      // Create new admin
      const newAdmin = await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedpassword,
        isAdmin: true
      });

      res.status(201).json({ success: true, data: newAdmin });
    } catch (error) {
      console.error('Add admin error:', error);
      res.status(500).json({ success: false, message: 'Server error while adding admin' });
    }
  }
  
};

module.exports = adminController;
