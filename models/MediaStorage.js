const mongoose = require('mongoose');

const mediaStorageSchema = new mongoose.Schema({
  data: {
    type: Buffer,
    required: true
  },
  contentType: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MediaStorage', mediaStorageSchema);

