require('dotenv').config()
const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Setting = require('../models/Setting')
  const Media = require('../models/Media')

  console.log('Settings:', await Setting.find())
  console.log('Media count:', await Media.countDocuments())
  process.exit()
})
