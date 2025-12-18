const express = require('express')
const router = express.Router()
const { requireAuth, redirectIfAuthenticated } = require('../middleware/auth')
const Admin = require('../models/Admin')
const bcrypt = require('bcryptjs')

// Flash message middleware for admin routes
router.use((req, res, next) => {
  if (req.session.flash) {
    res.locals.flash = req.session.flash
    delete req.session.flash
  }
  next()
})

// Login page
router.get('/login', redirectIfAuthenticated, (req, res) => {
  res.render('admin/login', { title: 'Admin Login', layout: 'layouts/login' })
})

// Login handler
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const admin = await Admin.findOne({ email: email.toLowerCase() })

    if (!admin || !(await admin.comparePassword(password))) {
      return res.render('admin/login', {
        title: 'Admin Login',
        layout: 'layouts/login',
        error: 'Invalid email or password'
      })
    }

    req.session.adminId = admin._id
    req.session.save(err => {
      if (err) console.error('Session save error:', err)
      res.redirect('/admin/dashboard')
    })
  } catch (error) {
    console.error('Login error:', error)
    res.render('admin/login', {
      title: 'Admin Login',
      layout: 'layouts/login',
      error: 'An error occurred. Please try again.'
    })
  }
})

// Logout
router.post('/logout', requireAuth, (req, res) => {
  req.session.destroy()
  res.redirect('/admin/login')
})

// Dashboard
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const ContactSubmission = require('../models/ContactSubmission')
    const Product = require('../models/Product')
    const PortfolioPost = require('../models/PortfolioPost')
    const Media = require('../models/Media')

    const stats = {
      contacts: await ContactSubmission.countDocuments(),
      products: await Product.countDocuments(),
      portfolio: await PortfolioPost.countDocuments(),
      media: await Media.countDocuments()
    }

    res.render('admin/dashboard', {
      title: 'Dashboard',
      layout: 'layouts/admin',
      stats
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    res
      .status(500)
      .render('errors/500', { title: 'Server Error', layout: 'layouts/admin' })
  }
})

// Contacts routes
router.use('/contacts', requireAuth, require('./admin/contacts'))

// Products routes
router.use('/products', requireAuth, require('./admin/products'))

// Portfolio routes
router.use('/portfolio', requireAuth, require('./admin/portfolio'))

// Media routes - image serving is public, other routes require auth
const mediaRouter = require('./admin/media')
router.get('/media/image/:id/:size', mediaRouter)
router.use('/media', requireAuth, mediaRouter)

// Settings routes
router.use('/settings', requireAuth, require('./admin/settings'))

module.exports = router
