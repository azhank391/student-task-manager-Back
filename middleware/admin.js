// middleware/isAdmin.js
const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied: Admins only' });
  }
};

module.exports = isAdmin;
