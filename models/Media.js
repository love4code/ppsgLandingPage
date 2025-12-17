const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  sizes: {
    large: {
      storageId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      width: Number,
      height: Number,
      bytes: Number
    },
    medium: {
      storageId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      width: Number,
      height: Number,
      bytes: Number
    },
    thumb: {
      storageId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      width: Number,
      height: Number,
      bytes: Number
    }
  }
}, {
  timestamps: true
});

mediaSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Media', mediaSchema);

