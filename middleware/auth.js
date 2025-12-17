const Admin = require('../models/Admin');

const requireAuth = async (req, res, next) => {
  if (!req.session.adminId) {
    return res.redirect('/admin/login');
  }
  
  try {
    const admin = await Admin.findById(req.session.adminId);
    if (!admin) {
      req.session.destroy();
      return res.redirect('/admin/login');
    }
    req.admin = admin;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    req.session.destroy();
    res.redirect('/admin/login');
  }
};

const redirectIfAuthenticated = (req, res, next) => {
  if (req.session.adminId) {
    return res.redirect('/admin/dashboard');
  }
  next();
};

module.exports = { requireAuth, redirectIfAuthenticated };

