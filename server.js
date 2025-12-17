require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')
const expressLayouts = require('express-ejs-layouts')
const path = require('path')

const app = express()

// Trust proxy for Heroku (required for secure cookies)
app.set('trust proxy', 1)

// Database connection
mongoose
  .connect(
    process.env.MONGODB_URI || 'mongodb://localhost:27017/aquarian-pool-spa'
  )
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err))

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: false // Allow inline scripts for Bootstrap
  })
)
app.use(compression())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl:
        process.env.MONGODB_URI || 'mongodb://localhost:27017/aquarian-pool-spa'
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
)

// View engine setup
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(expressLayouts)
app.set('layout', 'layouts/main')

// Make settings available to all views
const Setting = require('./models/Setting')
app.use(async (req, res, next) => {
  try {
    let settings = await Setting.findOne()
    if (!settings) {
      // Create default settings if none exist
      settings = await Setting.create({
        companyName: 'Aquarian Pool and Spa',
        theme: {
          mode: 'preset',
          presetName: 'ocean-blue'
        }
      })
    }
    res.locals.settings = settings

    // Handle flash messages
    if (req.session.flash) {
      res.locals.flash = req.session.flash
      delete req.session.flash
    }

    // Handle contact success
    if (req.session.contactSuccess) {
      res.locals.contactSuccess = true
      delete req.session.contactSuccess
    }

    next()
  } catch (error) {
    console.error('Error loading settings:', error)
    next()
  }
})

// Routes
app.use('/', require('./routes/public'))
app.use('/admin', require('./routes/admin'))

// Error handling
app.use((req, res, next) => {
  res.status(404).render('errors/404', {
    title: 'Page Not Found',
    layout: 'layouts/main'
  })
})

app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).render('errors/500', {
    title: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {},
    layout: 'layouts/main'
  })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
